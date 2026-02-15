import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

export default async function create(projectNameArg, options = {}) {
  handleSigint();

  const cwd = process.cwd();
  const projectName = projectNameArg || "my-noshift-app";
  const usePrettier = options.prettier !== false; // default: true

  const projectPath = path.join(cwd, projectName);

  // Create project directory
  logger.step("Creating project directory...");
  await fs.mkdir(projectPath, { recursive: true });
  logger.dim(`  ${projectPath}`);

  process.chdir(projectPath);

  // npm init
  logger.step("Initializing npm...");
  execSync("npm init -y", { stdio: "ignore" });

  // Add scripts to package.json
  const pkgPath = path.join(projectPath, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.compile = "nsc compile";
  pkg.scripts.dev = "nsc dev";
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
    await fs.writeFile(".prettierignore", "dist/\nnode_modules/\n");
    await fs.writeFile(
      ".prettierrc",
      JSON.stringify(
        {
          semi: true,
          singleQuote: false,
          trailingComma: "es5",
          plugins: ["prettier-plugin-noshift.js"],
        },
        null,
        2,
      ) + "\n",
    );
  }

  // Install noshift.js
  logger.step("Installing noshift.js...");
  execSync("npm install noshift.js", { stdio: "ignore" });

  // Create project files
  logger.step("Creating project files...");
  await fs.mkdir("src", { recursive: true });
  await fs.writeFile(
    "src/index.nsjs",
    "console.log^8^2^3hello, ^3world!^2^9;\n",
  );

  // .gitignore
  await fs.writeFile(".gitignore", "node_modules/\ndist/\n");

  // README.md
  const readme = `# ${projectName}

A [NoShift.js](https://github.com/otoneko1102/NoShift.js) project.

## Compile

\`\`\`bash
npm run compile
\`\`\`

## Dev (watch mode)

\`\`\`bash
npm run dev
\`\`\`
`;

  await fs.writeFile("README.md", readme);

  // Success message
  console.log("");
  logger.success("Project created successfully!");
  console.log("");
  logger.info("Next steps:");
  console.log(`  ${logger.highlight(`cd ${projectName}`)}`);
  console.log(`  ${logger.highlight("npm run compile")}`);
  console.log("");
}
