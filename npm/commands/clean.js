import { rm, access } from "fs/promises";
import path from "path";
import { loadConfig } from "../src/config.js";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

export default async function clean() {
  handleSigint();

  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    logger.errorCode("NS0", e.message);
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
