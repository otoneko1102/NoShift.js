import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";
import { askInput, askConfirm } from "../src/prompt.js";

export default async function create(projectNameArg, options = {}) {
  handleSigint();

  const cwd = process.cwd();

  // ── プロジェクト名 ──
  let projectName = projectNameArg;
  if (!projectName) {
    projectName = await askInput("Project name", "my-noshift-app");
  }

  // ── Prettier ──
  // --no-prettier で明示的に無効化された場合はスキップ、
  // それ以外はユーザーに尋ねる
  let usePrettier;
  if (options.prettier === false) {
    usePrettier = false;
  } else {
    usePrettier = await askConfirm("Use Prettier?", true);
  }

  const projectPath = path.join(cwd, projectName);

  // Create project directory
  logger.step("Creating project directory ...");
  await fs.mkdir(projectPath, { recursive: true });
  logger.dim(`  ${projectPath}`);

  process.chdir(projectPath);

  // npm init
  logger.step("Initializing npm ...");
  execSync("npm init -y", { stdio: "ignore" });

  // Add scripts to package.json
  const pkgPath = path.join(projectPath, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.compile = "nsc";
  pkg.scripts.dev = "nsc watch";
  if (usePrettier) {
    pkg.scripts.format = "prettier --write ./src";
  }
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Create nsjsconfig.json
  const nsjsconfig = {
    compileroptions: {
      rootdir: "src",
      outdir: "dist",
      warnuppercase: true,
      capitalizeinstrings: true,
    },
  };
  await fs.writeFile(
    "nsjsconfig.json",
    JSON.stringify(nsjsconfig, null, 2) + "\n",
  );
  logger.success("Created nsjsconfig.json");

  // Prettier
  if (usePrettier) {
    logger.step("Installing Prettier & prettier-plugin-noshift.js ...");
    execSync("npm install --save-dev prettier prettier-plugin-noshift.js", {
      stdio: "ignore",
    });

    const prettierConfig = {
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      plugins: ["prettier-plugin-noshift.js"],
    };
    await fs.writeFile(
      ".prettierrc",
      JSON.stringify(prettierConfig, null, 2) + "\n",
    );
    logger.success("Created .prettierrc");

    await fs.writeFile(".prettierignore", "dist/\nnode_modules/\n");
    logger.success("Created .prettierignore");
  }

  // Install noshift.js
  logger.step("Installing noshift.js ...");
  execSync("npm install --save-dev noshift.js", { stdio: "ignore" });

  // Create project files
  logger.step("Creating project files ...");
  await fs.mkdir("src", { recursive: true });
  await fs.writeFile(
    "src/index.nsjs",
    "console.log^8^2^3hello, ^3world^1^2^9;\n",
  );

  // .gitignore
  await fs.writeFile(".gitignore", "node_modules/\ndist/\n");

  // README.md
  const readme = `# ${projectName}

A [NoShift.js](https://github.com/otoneko1102/NoShift.js) project.

## Compile

\`\`\`bash
nsc
\`\`\`

## Dev (watch mode)

\`\`\`bash
nsc watch
\`\`\`
`;

  await fs.writeFile("README.md", readme);

  // Success message
  console.log("");
  logger.success("Project created successfully!");
  console.log("");
  logger.info("Next steps:");
  console.log(`  ${logger.highlight(`cd ${projectName}`)}`);
  console.log(`  ${logger.highlight("nsc")}`);
  console.log("");
}
