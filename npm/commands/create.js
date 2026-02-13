import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";

export default async function create(projectNameArg) {
  const cwd = process.cwd();

  // 言語選択
  const { lang } = await inquirer.prompt([
    {
      type: "list",
      name: "lang",
      message: "Select language / 言語を選んでください",
      choices: [
        { name: "English", value: "en" },
        { name: "日本語", value: "ja" },
      ],
    },
  ]);

  const t = (key) =>
    ({
      projectName: { en: "Project name:", ja: "プロジェクト名:" },
      creatingDir: {
        en: "Creating project directory:",
        ja: "プロジェクトディレクトリを作成:",
      },
      initializingNpm: { en: "Initializing npm...", ja: "npm を初期化中..." },
      creatingConfig: {
        en: "Created nsjsconfig.json",
        ja: "nsjsconfig.json を作成しました",
      },
      usePrettier: {
        en: "Format compiled output with Prettier?",
        ja: "コンパイル後のコードを Prettier で整形しますか?",
      },
      installingPrettier: {
        en: "Installing Prettier...",
        ja: "Prettier をインストール中...",
      },
      installingNoshift: {
        en: "Installing noshift.js...",
        ja: "noshift.js をインストール中...",
      },
      success: {
        en: "Project created successfully!",
        ja: "プロジェクトの作成が完了しました!",
      },
      nextSteps: {
        en: "Next: cd {name} && nsc compile",
        ja: "次のステップ: cd {name} && nsc compile",
      },
    })[key][lang];

  // プロジェクト名
  let projectName = projectNameArg;
  if (!projectName) {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: t("projectName"),
        default: "my-noshift-app",
      },
    ]);
    projectName = answer.projectName;
  }

  const projectPath = path.join(cwd, projectName);
  await fs.mkdir(projectPath, { recursive: true });
  console.log(`\n${t("creatingDir")} ${projectPath}`);

  process.chdir(projectPath);

  // npm init
  console.log(t("initializingNpm"));
  execSync("npm init -y", { stdio: "inherit" });

  // package.json に scripts を追加
  const pkgPath = path.join(projectPath, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  pkg.scripts = pkg.scripts ?? {};
  pkg.scripts.compile = "nsc compile";
  pkg.scripts.dev = "nsc dev";
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // nsjsconfig.json を作成
  const nsjsconfig = {
    compilerOptions: {
      rootDir: "src",
      outDir: "build",
    },
  };
  await fs.writeFile(
    "nsjsconfig.json",
    JSON.stringify(nsjsconfig, null, 2) + "\n",
  );
  console.log(t("creatingConfig"));

  // Prettier
  const { usePrettier } = await inquirer.prompt([
    {
      type: "confirm",
      name: "usePrettier",
      message: t("usePrettier"),
      default: true,
    },
  ]);

  if (usePrettier) {
    console.log(t("installingPrettier"));
    execSync("npm install --save-dev prettier", { stdio: "inherit" });
    await fs.writeFile(".prettierignore", "build/\nnode_modules/\n");
    await fs.writeFile(
      ".prettierrc",
      JSON.stringify(
        { semi: true, singleQuote: false, trailingComma: "es5" },
        null,
        2,
      ) + "\n",
    );
  }

  // noshift.js をインストール
  console.log(t("installingNoshift"));
  execSync("npm install noshift.js", { stdio: "inherit" });

  // src/index.nsjs
  await fs.mkdir("src", { recursive: true });
  await fs.writeFile("src/index.nsjs", "console.log^8^2Hello, World!^2^9;\n");

  // README.md
  const readme =
    lang === "ja"
      ? `# ${projectName}

[NoShift.js](https://github.com/otoneko1102/NoShift.js) プロジェクトです。

## コンパイル

\`\`\`bash
npm run compile
\`\`\`

## 開発 (出力確認)

\`\`\`bash
npm run dev
\`\`\`
`
      : `# ${projectName}

A [NoShift.js](https://github.com/otoneko1102/NoShift.js) project.

## Compile

\`\`\`bash
npm run compile
\`\`\`

## Dev (preview output)

\`\`\`bash
npm run dev
\`\`\`
`;

  await fs.writeFile("README.md", readme);

  console.log(`\n${t("success")}`);
  console.log(t("nextSteps").replace("{name}", projectName));
}
