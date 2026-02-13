import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import { handleSigint, isUserCancelled } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

export default async function create(projectNameArg) {
  handleSigint();

  const cwd = process.cwd();

  try {
    // Project name
    let projectName = projectNameArg;
    if (!projectName) {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "Project name:",
          default: "my-noshift-app",
        },
      ]);
      projectName = answer.projectName;
    }

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
      compilerOptions: {
        rootDir: "src",
        outDir: "dist",
      },
    };
    await fs.writeFile(
      "nsjsconfig.json",
      JSON.stringify(nsjsconfig, null, 2) + "\n",
    );
    logger.success("Created nsjsconfig.json");

    // Prettier
    const { usePrettier } = await inquirer.prompt([
      {
        type: "confirm",
        name: "usePrettier",
        message: "Format compiled output with Prettier?",
        default: true,
      },
    ]);

    if (usePrettier) {
      logger.step("Installing Prettier...");
      execSync("npm install --save-dev prettier", { stdio: "ignore" });
      await fs.writeFile(".prettierignore", "dist/\nnode_modules/\n");
      await fs.writeFile(
        ".prettierrc",
        JSON.stringify(
          { semi: true, singleQuote: false, trailingComma: "es5" },
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
      "console.log^8^2Hello, World!^2^9;\n",
    );

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
  } catch (error) {
    if (isUserCancelled(error)) {
      process.exit(0);
    }
    throw error;
  }
}
