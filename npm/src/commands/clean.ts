import { rm, access } from "fs/promises";
import path from "path";
import { loadConfig } from "../config.js";
import { handleSigint } from "../signal-handler.js";
import * as logger from "../logger.js";

export default async function clean(): Promise<void> {
  handleSigint();

  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    logger.errorCode("NS0", (e as Error).message);
    process.exit(1);
  }

  const outDir = path.resolve(cwd, config.compileroptions.outdir);

  try {
    await access(outDir);
  } catch {
    logger.info(
      `Nothing to clean (${logger.highlight(config.compileroptions.outdir)} does not exist).`,
    );
    return;
  }

  await rm(outDir, { recursive: true, force: true });
  logger.success(`Deleted ${logger.highlight(config.compileroptions.outdir)}`);
}
