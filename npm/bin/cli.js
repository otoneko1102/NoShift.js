#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
);

const DOCS_URL = "https://noshift.js.org/";

const program = new Command();

program
  .name("nsc")
  .description("NoShift.js compiler")
  .version(pkg.version, "-v, --version", "output the version number")
  .option("-w, --watch", "Watch for file changes and recompile")
  .option("--init", "Create a nsjsconfig.json in the current directory")
  .option("--clean", "Delete the output directory (outdir)")
  .option("-r, --run <file>", "Run a .nsjs file directly")
  .option("--create [name]", "Scaffold a new NoShift.js project")
  .addHelpText("after", `\nDocumentation: ${DOCS_URL}`)
  .action(async (options) => {
    if (options.watch) {
      const { default: dev } = await import("../commands/dev.js");
      await dev();
    } else if (options.init) {
      const { default: init } = await import("../commands/init.js");
      await init();
    } else if (options.clean) {
      const { default: clean } = await import("../commands/clean.js");
      await clean();
    } else if (options.run) {
      const { default: run } = await import("../commands/run.js");
      await run(options.run);
    } else if (options.create !== undefined) {
      const { default: create } = await import("../commands/create.js");
      await create(options.create || undefined);
    } else {
      const { default: compile } = await import("../commands/compile.js");
      await compile();
    }
  });

// nsc watch
program
  .command("watch")
  .alias("w")
  .description("Watch for file changes and recompile")
  .action(async () => {
    const { default: dev } = await import("../commands/dev.js");
    await dev();
  });

// nsc run <file>
program
  .command("run <file>")
  .description("Run a .nsjs file directly")
  .action(async (file) => {
    const { default: run } = await import("../commands/run.js");
    await run(file);
  });

// nsc create [name]
program
  .command("create [name]")
  .description("Scaffold a new NoShift.js project")
  .option("--prettier", "Include Prettier (default)")
  .option("--no-prettier", "Skip Prettier setup")
  .action(async (name, options) => {
    const { default: create } = await import("../commands/create.js");
    await create(name, options);
  });

// nsc init
program
  .command("init")
  .description("Create a nsjsconfig.json in the current directory")
  .action(async () => {
    const { default: init } = await import("../commands/init.js");
    await init();
  });

// nsc clean
program
  .command("clean")
  .description("Delete the output directory (outdir)")
  .action(async () => {
    const { default: clean } = await import("../commands/clean.js");
    await clean();
  });

// nsc version
program
  .command("version")
  .description("Display the current version")
  .action(() => {
    console.log(pkg.version);
  });

// nsc help
program
  .command("help")
  .description("Show help information")
  .action(() => {
    program.outputHelp();
  });

program.parse();
