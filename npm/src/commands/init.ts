import { writeFile, readFile, access } from "fs/promises";
import path from "path";
import { handleSigint } from "../signal-handler.js";
import * as logger from "../logger.js";
import { askConfirm } from "../prompt.js";

const DEFAULT_CONFIG = {
  compileroptions: {
    rootdir: "src",
    outdir: "dist",
    warnuppercase: true,
    capitalizeinstrings: true,
    noheader: false,
  },
};

/** .prettierrc 系のファイル名（優先順） */
const PRETTIERRC_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
  ".prettierrc.json5",
  ".prettierrc.cjs",
  ".prettierrc.mjs",
  "prettier.config.js",
  "prettier.config.cjs",
  "prettier.config.mjs",
];

const PLUGIN_NAME = "prettier-plugin-noshift.js";

/**
 * 既存の .prettierrc / .prettierrc.json を読み込み plugins に追加する。
 * JSON 形式のみ自動編集可能。それ以外は手動追加を案内する。
 */
async function addPluginToExistingConfig(filePath: string): Promise<void> {
  const basename = path.basename(filePath);
  const isJson = basename === ".prettierrc" || basename === ".prettierrc.json";

  if (!isJson) {
    logger.warn(
      `Found ${basename} — please add "${PLUGIN_NAME}" to the plugins array manually.`,
    );
    return;
  }

  try {
    const raw = await readFile(filePath, "utf-8");
    const config = JSON.parse(raw) as Record<string, unknown>;
    const plugins = Array.isArray(config.plugins)
      ? (config.plugins as string[])
      : [];

    if (plugins.includes(PLUGIN_NAME)) {
      logger.info(`${basename} already contains "${PLUGIN_NAME}".`);
      return;
    }

    plugins.push(PLUGIN_NAME);
    config.plugins = plugins;
    await writeFile(filePath, JSON.stringify(config, null, 2) + "\n");
    logger.success(`Added "${PLUGIN_NAME}" to ${basename}`);
  } catch (err) {
    logger.error(`Failed to update ${basename}: ${(err as Error).message}`);
    logger.warn(`Please add "${PLUGIN_NAME}" to the plugins array manually.`);
  }
}

/**
 * 新しい .prettierrc を作成する
 */
async function createPrettierConfig(): Promise<void> {
  const prettierConfig = {
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    plugins: [PLUGIN_NAME],
  };
  await writeFile(
    ".prettierrc",
    JSON.stringify(prettierConfig, null, 2) + "\n",
  );
  logger.success("Created .prettierrc");
}

export default async function init(): Promise<void> {
  handleSigint();

  const cwd = process.cwd();
  const configPath = path.join(cwd, "nsjsconfig.json");

  // ── nsjsconfig.json ──
  let configExists = false;
  try {
    await access(configPath);
    configExists = true;
  } catch {
    // not found — OK
  }

  if (configExists) {
    logger.warn("nsjsconfig.json already exists in the current directory.");
    const overwrite = await askConfirm("Overwrite?", false);
    if (!overwrite) {
      logger.info("Skipped nsjsconfig.json");
    } else {
      await writeFile(
        configPath,
        JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n",
      );
      logger.success("Overwritten nsjsconfig.json");
    }
  } else {
    await writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
    logger.success("Created nsjsconfig.json");
  }

  logger.dim(
    `  compileroptions.rootdir : ${DEFAULT_CONFIG.compileroptions.rootdir}`,
  );
  logger.dim(
    `  compileroptions.outdir  : ${DEFAULT_CONFIG.compileroptions.outdir}`,
  );

  // ── Prettier ──
  const usePrettier = await askConfirm("Set up Prettier?", true);

  if (usePrettier) {
    // 既存の prettierrc 系ファイルを探す
    let existingFile: string | null = null;
    for (const name of PRETTIERRC_FILES) {
      try {
        await access(path.join(cwd, name));
        existingFile = name;
        break;
      } catch {
        // not found — continue
      }
    }

    if (existingFile) {
      await addPluginToExistingConfig(path.join(cwd, existingFile));
    } else {
      await createPrettierConfig();
    }

    // .prettierignore
    const ignorePath = path.join(cwd, ".prettierignore");
    let ignoreExists = false;
    try {
      await access(ignorePath);
      ignoreExists = true;
    } catch {
      // not found
    }
    if (!ignoreExists) {
      await writeFile(ignorePath, "dist/\nnode_modules/\n");
      logger.success("Created .prettierignore");
    }
  }

  console.log("");
}
