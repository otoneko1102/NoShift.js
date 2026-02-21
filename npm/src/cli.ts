import { Command } from "commander";
import { readFileSync } from "fs";
import path from "path";
import dev from "./commands/dev.js";
import init from "./commands/init.js";
import clean from "./commands/clean.js";
import run from "./commands/run.js";
import create from "./commands/create.js";
import compile from "./commands/compile.js";

function loadPackageVersion(): string {
  const pkg = JSON.parse(
    readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
  ) as { version: string };
  return pkg.version;
}

const version = loadPackageVersion();

const DOCS_URL = "https://noshift.js.org/";

const program = new Command();

program
  .name("nsc")
  .description("NoShift.js compiler")
  .version(version, "-v, --version", "output the version number")
  .option("-w, --watch", "Watch for file changes and recompile")
  .option("--init", "Create a nsjsconfig.json in the current directory")
  .option("--clean", "Delete the output directory (outdir)")
  .option("-r, --run <file>", "Run a .nsjs file directly")
  .option("--create [name]", "Scaffold a new NoShift.js project")
  .option("--no-header", "Suppress the generated header comment in output")
  .addHelpText("after", `\nDocumentation: ${DOCS_URL}`)
  .action(async (options) => {
    const noHeader = options.header === false;
    if (options.watch) {
      await dev({ noHeader });
    } else if (options.init) {
      await init();
    } else if (options.clean) {
      await clean();
    } else if (options.run) {
      await run(options.run as string, { noHeader });
    } else if (options.create !== undefined) {
      await create((options.create as string) || undefined);
    } else {
      await compile({ noHeader });
    }
  });

// nsc watch
program
  .command("watch")
  .alias("w")
  .description("Watch for file changes and recompile")
  .action(async () => {
    await dev();
  });

// nsc run <file>
program
  .command("run <file>")
  .description("Run a .nsjs file directly")
  .action(async (file: string) => {
    await run(file);
  });

// nsc create [name]
program
  .command("create [name]")
  .description("Scaffold a new NoShift.js project")
  .option("--prettier", "Include Prettier (default)")
  .option("--no-prettier", "Skip Prettier setup")
  .action(
    async (name: string | undefined, options: Record<string, unknown>) => {
      await create(name, options);
    },
  );

// nsc init
program
  .command("init")
  .description("Create a nsjsconfig.json in the current directory")
  .action(async () => {
    await init();
  });

// nsc clean
program
  .command("clean")
  .description("Delete the output directory (outdir)")
  .action(async () => {
    await clean();
  });

// nsc version
program
  .command("version")
  .description("Display the current version")
  .action(() => {
    console.log(version);
  });

// nsc help
program
  .command("help")
  .description("Show help information")
  .action(() => {
    program.outputHelp();
  });

program.parse();
