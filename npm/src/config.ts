import { promises as fs } from "fs";
import path from "path";

export interface CompilerOptions {
  rootdir: string;
  outdir: string;
  warnuppercase: boolean;
  capitalizeinstrings: boolean;
}

export interface NsjsConfig {
  compileroptions: CompilerOptions;
}

const DEFAULT_CONFIG: NsjsConfig = {
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
export async function loadConfig(cwd: string = process.cwd()): Promise<NsjsConfig> {
  const configPath = path.join(cwd, "nsjsconfig.json");

  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const userConfig = JSON.parse(raw) as Partial<NsjsConfig>;

    return {
      compileroptions: {
        ...DEFAULT_CONFIG.compileroptions,
        ...(userConfig.compileroptions ?? {}),
      },
    };
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return DEFAULT_CONFIG;
    }
    throw new Error(
      `Failed to parse nsjsconfig.json: ${(e as Error).message}`,
    );
  }
}
