#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";
import * as logger from "../src/logger.js";

const { lint, createDefaultConfig, loadConfigSync } = await import("../src/rules.cjs")
  .then((m) => m.default || m);

const args = process.argv.slice(2);
const command = args[0];

// ── nslint init ──
if (command === "init" || command === "create") {
  await initConfig();
  process.exit(0);
}

// ── nslint help ──
if (command === "help" || command === "-h" || command === "--help") {
  printHelp();
  process.exit(0);
}

// ── nslint version ──
if (command === "version" || command === "-v" || command === "--version") {
  const pkg = JSON.parse(
    await fs.readFile(new URL("../package.json", import.meta.url), "utf-8"),
  );
  console.log(pkg.version);
  process.exit(0);
}

// ── nslint [files...] ──
await runLint(args);

// ────────────────────────────────────────

async function initConfig() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "nsjslinter.json");

  try {
    await fs.access(configPath);
    logger.info("nsjslinter.json already exists.");
    return;
  } catch {
    // ファイルが存在しない → 作成
  }

  const config = createDefaultConfig();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
  logger.success("Created nsjslinter.json");
}

function printHelp() {
  console.log(`
  @noshift.js/lint — A linter for NoShift.js

  Usage:
    nslint                        Lint all .nsjs files in rootdir (from nsjsconfig.json)
    nslint <file> [file...]       Lint specific files
    nslint init | create          Create nsjslinter.json with defaults
    nslint version | -v           Show version
    nslint help | -h              Show this help

  Configuration:
    nsjslinter.json               Rule severity: "error" | "warning" | "off"

  Site: https://noshift.js.org
  `);
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

async function loadNsjsConfig(cwd) {
  try {
    const raw = await fs.readFile(path.join(cwd, "nsjsconfig.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function runLint(fileArgs) {
  const cwd = process.cwd();

  // nsjslinter.json を読み込む
  const configPath = path.join(cwd, "nsjslinter.json");
  const lintConfig = loadConfigSync(configPath);

  let files;

  if (fileArgs.length > 0) {
    // 引数で指定されたファイル
    files = fileArgs.map((f) => path.resolve(cwd, f));
  } else {
    // nsjsconfig.json の rootdir から検索
    const nsjsConfig = await loadNsjsConfig(cwd);
    const rootDir = nsjsConfig?.compileroptions?.rootdir
      ? path.resolve(cwd, nsjsConfig.compileroptions.rootdir)
      : path.resolve(cwd, "src");

    files = await findNsjsFiles(rootDir);
    if (!files || files.length === 0) {
      logger.info("No .nsjs files found.");
      process.exit(0);
    }
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let filesWithIssues = 0;

  for (const file of files) {
    let code;
    try {
      code = await fs.readFile(file, "utf-8");
    } catch {
      logger.error(`File not found: ${file}`);
      totalErrors++;
      continue;
    }

    const messages = lint(code, lintConfig);
    if (messages.length === 0) continue;

    filesWithIssues++;
    const relative = path.relative(cwd, file).replace(/\\/g, "/");
    console.log("");
    console.log(`  \x1b[4m${relative}\x1b[0m`);

    for (const msg of messages) {
      const icon = msg.severity === "error"
        ? "\x1b[31m✗\x1b[0m"
        : "\x1b[33m⚠\x1b[0m";
      const loc = `\x1b[90m${msg.line}:${msg.column}\x1b[0m`;
      const ruleDim = `\x1b[90m${msg.rule}\x1b[0m`;
      console.log(`    ${icon} ${loc}  ${msg.message}  ${ruleDim}`);

      if (msg.severity === "error") totalErrors++;
      else totalWarnings++;
    }
  }

  console.log("");
  if (totalErrors === 0 && totalWarnings === 0) {
    logger.success(`Lint passed. ${files.length} file(s) checked.`);
  } else {
    const parts = [];
    if (totalErrors > 0) parts.push(`${totalErrors} error(s)`);
    if (totalWarnings > 0) parts.push(`${totalWarnings} warning(s)`);
    const summary = parts.join(", ");
    if (totalErrors > 0) {
      logger.error(`${summary} in ${filesWithIssues} file(s).`);
      process.exit(1);
    } else {
      logger.warn(`${summary} in ${filesWithIssues} file(s).`);
    }
  }
}
