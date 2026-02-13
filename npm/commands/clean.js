import { rm, access } from "fs/promises";
import path from "path";
import { loadConfig } from "../src/config.js";

export default async function clean() {
  const cwd = process.cwd();

  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    console.error(`error NS0: ${e.message}`);
    process.exit(1);
  }

  const outDir = path.resolve(cwd, config.compilerOptions.outDir);

  try {
    await access(outDir);
  } catch {
    console.log(`Nothing to clean ('${config.compilerOptions.outDir}' does not exist).`);
    return;
  }

  await rm(outDir, { recursive: true, force: true });
  console.log(`Deleted '${config.compilerOptions.outDir}'.`);
}
