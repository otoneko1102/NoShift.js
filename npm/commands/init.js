import { writeFile, access } from "fs/promises";
import path from "path";

const DEFAULT_CONFIG = {
  compilerOptions: {
    rootDir: "src",
    outDir: "build",
  },
};

export default async function init() {
  const configPath = path.join(process.cwd(), "nsjsconfig.json");

  try {
    await access(configPath);
    console.error("error NS4: nsjsconfig.json already exists in the current directory.");
    process.exit(1);
  } catch {
    // ファイルが存在しないのが正常
  }

  await writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
  console.log("Created nsjsconfig.json.");
  console.log("\n  compilerOptions.rootDir : src");
  console.log("  compilerOptions.outDir  : build\n");
}
