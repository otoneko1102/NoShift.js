import { promises as fs } from "fs";
import path from "path";
import convert from "../src/convert.js";
import { loadConfig } from "../src/config.js";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

async function findNsjsFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return null; // ディレクトリが存在しない
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

export default async function compile() {
  handleSigint();

  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    logger.errorCode("NS0", e.message);
    process.exit(1);
  }

  const rootDir = path.resolve(cwd, config.compilerOptions.rootDir);
  const outDir = path.resolve(cwd, config.compilerOptions.outDir);

  const files = await findNsjsFiles(rootDir);

  if (files === null) {
    logger.errorCode(
      "NS0",
      `rootDir '${config.compilerOptions.rootDir}' not found.`,
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

  for (const file of files) {
    const relative = path.relative(rootDir, file);
    const destPath = path.join(outDir, relative).replace(/\.nsjs$/, ".js");

    try {
      const code = await fs.readFile(file, "utf-8");
      const js = convert(code);

      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(destPath, js, "utf-8");

      logger.dim(
        `  ${relative.replace(/\\/g, "/")} → ${path.relative(cwd, destPath).replace(/\\/g, "/")}`,
      );
      compiled++;
    } catch (e) {
      logger.errorCode(
        "NS1",
        `${relative.replace(/\\/g, "/")}: ${e.message}`,
      );
      errors++;
    }
  }

  console.log("");
  if (errors > 0) {
    logger.error(`Found ${errors} error(s). Compiled ${compiled} file(s).`);
    process.exit(1);
  } else {
    logger.success(`Compiled ${compiled} file(s).`);
  }
}
