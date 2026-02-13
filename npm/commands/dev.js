import { promises as fs, watch } from "fs";
import path from "path";
import convert from "../src/convert.js";
import { loadConfig } from "../src/config.js";

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

async function compileFile(file, rootDir, outDir, cwd) {
  const relative = path.relative(rootDir, file).replace(/\\/g, "/");
  const destPath = path
    .join(outDir, path.relative(rootDir, file))
    .replace(/\.nsjs$/, ".js");
  const code = await fs.readFile(file, "utf-8");
  const js = convert(code);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, js, "utf-8");
  console.log(
    `[${timestamp()}] ${relative} → ${path.relative(cwd, destPath).replace(/\\/g, "/")}`,
  );
}

export default async function dev() {
  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    console.error(`error NS0: ${e.message}`);
    process.exit(1);
  }

  const rootDir = path.resolve(cwd, config.compilerOptions.rootDir);
  const outDir = path.resolve(cwd, config.compilerOptions.outDir);

  // 初回フルコンパイル
  const files = await findNsjsFiles(rootDir);
  if (files === null) {
    console.error(
      `error NS0: rootDir '${config.compilerOptions.rootDir}' not found.`,
    );
    process.exit(1);
  }

  console.log(`[${timestamp()}] Starting compilation in watch mode...`);

  await fs.mkdir(outDir, { recursive: true });

  for (const file of files) {
    try {
      await compileFile(file, rootDir, outDir, cwd);
    } catch (e) {
      const rel = path.relative(rootDir, file).replace(/\\/g, "/");
      console.error(`[${timestamp()}] error: ${rel}: ${e.message}`);
    }
  }

  console.log(
    `[${timestamp()}] Watching for file changes in '${config.compilerOptions.rootDir}'...\n`,
  );

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
          await compileFile(absPath, rootDir, outDir, cwd);
        } catch (e) {
          if (e.code === "ENOENT") {
            // ファイルが削除された場合はスキップ
          } else {
            console.error(
              `[${timestamp()}] error: ${filename.replace(/\\/g, "/")}: ${e.message}`,
            );
          }
        }
      }, DEBOUNCE_MS),
    );
  });

  // Ctrl+C で終了するまで待機
  await new Promise(() => {});
}
