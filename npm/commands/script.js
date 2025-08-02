import { promises as fs } from "fs";
import path from "path";
import convert from "../src/convert.js";

// ✅ ユーザープロジェクトの ./src を参照
const srcDir = path.join(process.cwd(), "src");

async function findNsjsFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findNsjsFiles(fullPath)));
    } else if (
      entry.name.endsWith(".nsjs") &&
      !entry.name.startsWith("_")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = await findNsjsFiles(srcDir);
for (const file of files) {
  const code = await fs.readFile(file, "utf-8");
  const js = convert(code);
  console.log(`\n--- Running: ${file} ---\n`);
  await eval(js);
  console.log("\n");
}
