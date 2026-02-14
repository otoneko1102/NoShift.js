import { writeFile, access } from "fs/promises";
import path from "path";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

const DEFAULT_CONFIG = {
  compileroptions: {
    rootdir: "src",
    outdir: "dist",
    warnuppercase: true,
    capitalizeinstrings: true,
  },
};

export default async function init() {
  handleSigint();

  const configPath = path.join(process.cwd(), "nsjsconfig.json");

  try {
    await access(configPath);
    logger.errorCode(
      "NS4",
      "nsjsconfig.json already exists in the current directory.",
    );
    process.exit(1);
  } catch {
    // ファイルが存在しないのが正常
  }

  await writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
  logger.success("Created nsjsconfig.json");
  logger.dim(
    `  compileroptions.rootdir : ${DEFAULT_CONFIG.compileroptions.rootdir}`,
  );
  logger.dim(
    `  compileroptions.outdir  : ${DEFAULT_CONFIG.compileroptions.outdir}`,
  );
  console.log("");
}
