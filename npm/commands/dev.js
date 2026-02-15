import { promises as fs, watch } from "fs";
import path from "path";
import convert, { diagnose } from "../src/convert.js";
import { loadConfig } from "../src/config.js";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

function timestamp() {
  return new Date().toLocaleTimeString("en-GB"); // HH:MM:SS
}

async function findNsjsFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findNsjsFiles(fullPath);
      if (nested) files.push(...nested);
    } else if (entry.name.endsWith(".nsjs") && !entry.name.startsWith("_")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function compileFile(file, rootDir, outDir, cwd, convertOptions = {}) {
  const relative = path.relative(rootDir, file).replace(/\\/g, "/");
  const destPath = path
    .join(outDir, path.relative(rootDir, file))
    .replace(/\.nsjs$/, ".js");
  const code = await fs.readFile(file, "utf-8");

  // 構文エラーチェック
  const syntaxErrors = diagnose(code);
  if (syntaxErrors.length > 0) {
    const rel = relative;
    for (const e of syntaxErrors) {
      logger.errorCode("NS1", `${rel}:${e.line}:${e.column} - ${e.message}`);
    }
    throw new Error(`${syntaxErrors.length} syntax error(s)`);
  }

  const js = convert(code, convertOptions);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, js, "utf-8");
  logger.dim(
    `[${timestamp()}] ${relative} → ${path.relative(cwd, destPath).replace(/\\/g, "/")}`,
  );
}

export default async function dev() {
  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    logger.errorCode("NS0", e.message);
    process.exit(1);
  }

  const rootDir = path.resolve(cwd, config.compileroptions.rootdir);
  const outDir = path.resolve(cwd, config.compileroptions.outdir);
  const convertOptions = {
    capitalizeInStrings: config.compileroptions.capitalizeinstrings !== false,
  };

  // 初回フルコンパイル
  const files = await findNsjsFiles(rootDir);
  if (files === null) {
    logger.errorCode(
      "NS0",
      `rootdir '${config.compileroptions.rootdir}' not found.`,
    );
    process.exit(1);
  }

  logger.info(`Starting compilation in watch mode...`);

  await fs.mkdir(outDir, { recursive: true });

  for (const file of files) {
    try {
      await compileFile(file, rootDir, outDir, cwd, convertOptions);
    } catch (e) {
      const rel = path.relative(rootDir, file).replace(/\\/g, "/");
      logger.errorCode("NS1", `${rel}: ${e.message}`);
    }
  }

  logger.info(
    `Watching for file changes in '${logger.highlight(config.compileroptions.rootdir)}'... (Press Ctrl+C to stop)`,
  );
  console.log("");

  // Ctrl+C で終了
  handleSigint(() => {
    logger.info("Stopped watching.");
  });

  // デバウンス用マップ (ファイルパス → タイマーID)
  const debounceMap = new Map();
  const DEBOUNCE_MS = 100;

  watch(rootDir, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    if (!filename.endsWith(".nsjs")) return;
    if (path.basename(filename).startsWith("_")) return;

    // 重複イベントをデバウンス
    if (debounceMap.has(filename)) {
      clearTimeout(debounceMap.get(filename));
    }
    debounceMap.set(
      filename,
      setTimeout(async () => {
        debounceMap.delete(filename);
        const absPath = path.join(rootDir, filename);
        try {
          await compileFile(absPath, rootDir, outDir, cwd, convertOptions);
        } catch (e) {
          if (e.code === "ENOENT") {
            // ファイルが削除された場合はスキップ
          } else {
            logger.errorCode(
              "NS1",
              `${filename.replace(/\\/g, "/")}: ${e.message}`,
            );
          }
        }
      }, DEBOUNCE_MS),
    );
  });

  // Ctrl+C で終了するまで待機
  await new Promise(() => {});
}
