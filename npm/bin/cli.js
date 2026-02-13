#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
);

const program = new Command();

// nsc [options]  ←  デフォルト動作: compile
program
  .name("nsc")
  .description("NoShift.js compiler")
  .version(pkg.version, '-v, --version', 'output the version number')
  .option("-w, --watch", "Watch for file changes and recompile")
  .option("--init", "Create a nsjsconfig.json in the current directory")
  .option("--clean", "Delete the output directory (outDir)")
  .action(async (options) => {
    if (options.init) {
      const { default: init } = await import("../commands/init.js");
      await init();
    } else if (options.clean) {
      const { default: clean } = await import("../commands/clean.js");
      await clean();
    } else if (options.watch) {
      const { default: dev } = await import("../commands/dev.js");
      await dev();
    } else {
      const { default: compile } = await import("../commands/compile.js");
      await compile();
    }
  });

// nsc run <file>
program
  .command("run <file>")
  .description("Run a .nsjs file directly")
  .action(async (file) => {
    const { default: run } = await import("../commands/run.js");
    await run(file);
  });

// nsc create [name]  ← 対話式プロジェクト作成
program
  .command("create [name]")
  .description("Scaffold a new NoShift.js project interactively")
  .action(async (name) => {
    const { default: create } = await import("../commands/create.js");
    await create(name);
  });

program.parse();
