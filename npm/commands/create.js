import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_BUILD_DIR = "build";

export default async function create(projectNameArg) {
  const cwd = process.cwd();

  // 🌐 言語選択
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

  const t = (key) => {
    const messages = {
      projectName: {
        en: "Enter project name:",
        ja: "プロジェクト名を入力してください:",
      },
      creatingDir: {
        en: "📁 Creating project directory:",
        ja: "📁 プロジェクトディレクトリを作成:",
      },
      initializingNpm: {
        en: "📦 Initializing npm...",
        ja: "📦 npm 初期化中...",
      },
      creatingConfig: {
        en: "⚙️  Creating nsjs.config.js",
        ja: "⚙️  nsjs.config.js を作成",
      },
      usePrettier: {
        en: "Do you want to format compiled code with Prettier?",
        ja: "コンパイル後のコードを Prettier で整形しますか？",
      },
      installingPrettier: {
        en: "📦 Installing Prettier...",
        ja: "📦 Prettier をインストール中...",
      },
      installingNoshift: {
        en: "📦 Installing noshift.js...",
        ja: "📦 noshift.js をインストール中...",
      },
      success: {
        en: "🎉 Project created successfully!",
        ja: "🎉 プロジェクト作成が完了しました!",
      },
      nextSteps: {
        en: "👉 cd {name} && npm run dev",
        ja: "👉 cd {name} && npm run dev",
      },
    };
    return messages[key][lang];
  };

  // プロジェクト名取得
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

  console.log(t("initializingNpm"));
  execSync("npm init -y", { stdio: "inherit" });

  // package.json に scripts.dev / scripts.build を追加
  const pkgPath = path.join(projectPath, "package.json");
  const pkgRaw = await fs.readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw);

  pkg.scripts.dev = "node ./node_modules/noshift.js/commands/dev.js";
  pkg.scripts.build = "node ./node_modules/noshift.js/commands/build.js";

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  // nsjs.config.js を作成
  const configContent = `export default {
  build: "", // 空なら ./build にビルドされます
};
`;
  await fs.writeFile("nsjs.config.js", configContent);
  console.log(t("creatingConfig"));

  // Prettier の使用
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

    const prettierIgnore = `build/\nnode_modules/\n`;
    await fs.writeFile(".prettierignore", prettierIgnore);

    const prettierConfig = `{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5"
}`;
    await fs.writeFile(".prettierrc", prettierConfig);
  }

  console.log(t("installingNoshift"));
  execSync("npm install noshift.js", { stdio: "inherit" });

  await fs.mkdir("src", { recursive: true });
  await fs.writeFile("src/index.nsjs", "console.log^8^2Hello World!^2^9;");

  // README.md
  const readme =
    lang === "ja"
      ? `# ${projectName}

これは [noshift.js](https://github.com/otoneko1102/NoShift.js) プロジェクトです。

## 開発

\`\`\`bash
npm run dev
\`\`\`

## ビルド

\`\`\`bash
npm run build
\`\`\`
`
      : `# ${projectName}

This is a [NoShift.js](https://github.com/otoneko1102/NoShift.js) project.

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`;

  await fs.writeFile("README.md", readme);

  console.log(`\n${t("success")}`);
  console.log("\n" + t("nextSteps").replace("{name}", projectName));
}
