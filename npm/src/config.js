import { promises as fs } from "fs";
import path from "path";

const DEFAULT_CONFIG = {
  compileroptions: {
    rootdir: "src",
    outdir: "dist",
    warnuppercase: true,
    capitalizeinstrings: true,
  },
};

/**
 * プロジェクトルートの nsjsconfig.json を読み込む。
 * ファイルが存在しない場合はデフォルト設定を返す。
 */
export async function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "nsjsconfig.json");

  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const userConfig = JSON.parse(raw);

    return {
      compileroptions: {
        ...DEFAULT_CONFIG.compileroptions,
        ...(userConfig.compileroptions ?? {}),
      },
    };
  } catch (e) {
    if (e.code === "ENOENT") {
      return DEFAULT_CONFIG;
    }
    throw new Error(`Failed to parse nsjsconfig.json: ${e.message}`);
  }
}
