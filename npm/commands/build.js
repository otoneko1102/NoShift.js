import { promises as fs } from "fs";
import path from "path";
import convert from "../src/convert.js";

// ✅ ユーザープロジェクトの ./src, ./build を参照
const srcDir = path.join(process.cwd(), "src");
const buildDir = path.join(process.cwd(), "build");

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

async function writeToBuild(originalPath, jsCode) {
  const relative = path.relative(srcDir, originalPath);
  const destPath = path.join(buildDir, relative).replace(/\.nsjs$/, ".js");

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, jsCode, "utf-8");
}

const files = await findNsjsFiles(srcDir);
await fs.mkdir(buildDir, { recursive: true });

for (const file of files) {
  const code = await fs.readFile(file, "utf-8");
  const js = convert(code);
  await writeToBuild(file, js);
  console.log(`✅ Converted: ${file}`);
}
