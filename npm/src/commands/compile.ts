import { promises as fs } from "fs";
import path from "path";
import convert, { checkUppercaseWarnings, diagnose } from "../convert.js";
import { loadConfig } from "../config.js";
import { addHeader } from "../header.js";
import { handleSigint } from "../signal-handler.js";
import * as logger from "../logger.js";

interface CompileCliOptions {
  noHeader?: boolean;
}

async function findNsjsFiles(dir: string): Promise<string[] | null> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  const files: string[] = [];
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

export default async function compile(
  cliOptions: CompileCliOptions = {},
): Promise<void> {
  handleSigint();

  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    logger.errorCode("NS0", (e as Error).message);
    process.exit(1);
  }

  const rootDir = path.resolve(cwd, config.compileroptions.rootdir);
  const outDir = path.resolve(cwd, config.compileroptions.outdir);

  const files = await findNsjsFiles(rootDir);

  if (files === null) {
    logger.errorCode(
      "NS0",
      `rootdir '${config.compileroptions.rootdir}' not found.`,
    );
    process.exit(1);
  }

  if (files.length === 0) {
    logger.info("No .nsjs files found.");
    return;
  }

  await fs.mkdir(outDir, { recursive: true });

  let compiled = 0;
  let errors = 0;
  let totalWarnings = 0;
  const warnUppercase = config.compileroptions.warnuppercase !== false;
  const convertOptions = {
    capitalizeInStrings: config.compileroptions.capitalizeinstrings !== false,
  };

  for (const file of files) {
    const relative = path.relative(rootDir, file);
    const destPath = path.join(outDir, relative).replace(/\.nsjs$/, ".js");

    try {
      const code = await fs.readFile(file, "utf-8");

      // 構文エラーチェック
      const syntaxErrors = diagnose(code);
      if (syntaxErrors.length > 0) {
        for (const e of syntaxErrors) {
          logger.errorCode(
            "NS1",
            `${relative.replace(/\\/g, "/")}:${e.line}:${e.column} - ${e.message}`,
          );
        }
        errors += syntaxErrors.length;
        continue;
      }

      // 大文字警告チェック
      if (warnUppercase) {
        const warnings = checkUppercaseWarnings(code, convertOptions);
        for (const w of warnings) {
          logger.warn(
            `${relative.replace(/\\/g, "/")}:${w.line}:${w.column} - ${w.message}`,
          );
          totalWarnings++;
        }
      }

      let js = convert(code, convertOptions);

      // ヘッダー挿入（noheader が明示的に true でない場合）
      const noHeader = cliOptions.noHeader || config.compileroptions.noheader;
      if (!noHeader) {
        js = addHeader(js);
      }

      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(destPath, js, "utf-8");

      logger.dim(
        `  ${relative.replace(/\\/g, "/")} → ${path.relative(cwd, destPath).replace(/\\/g, "/")}`,
      );
      compiled++;
    } catch (e) {
      logger.errorCode(
        "NS1",
        `${relative.replace(/\\/g, "/")}: ${(e as Error).message}`,
      );
      errors++;
    }
  }

  console.log("");
  if (errors > 0) {
    logger.error(`Found ${errors} error(s). Compiled ${compiled} file(s).`);
    process.exit(1);
  } else {
    let msg = `Compiled ${compiled} file(s).`;
    if (totalWarnings > 0) {
      msg += ` (${totalWarnings} warning(s))`;
    }
    logger.success(msg);
  }
}
