import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import convert from "../src/convert.js";
import { loadConfig } from "../src/config.js";
import { handleSigint } from "../src/signal-handler.js";
import * as logger from "../src/logger.js";

export default async function run(file) {
  handleSigint();

  const cwd = process.cwd();
  let config;
  try {
    config = await loadConfig(cwd);
  } catch {
    config = { compileroptions: {} };
  }

  const convertOptions = {
    capitalizeInStrings: config.compileroptions.capitalizeinstrings !== false,
  };

  const filePath = path.resolve(cwd, file);

  let code;
  try {
    code = await fs.readFile(filePath, "utf-8");
  } catch {
    logger.errorCode("NS2", `File not found: ${filePath}`);
    process.exit(1);
  }

  const js = convert(code, convertOptions);

  // ソースファイルと同じディレクトリに一時ファイルを作成する。
  // これにより、コンパイル後コード内の相対 import が正しく解決される。
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ".nsjs");
  const tempFile = path.join(dir, `${base}.__nsc_tmp__.mjs`);

  try {
    await fs.writeFile(tempFile, js, "utf-8");

    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [tempFile], {
        stdio: "inherit",
        env: process.env,
      });
      child.on("close", (code) => {
        if (code === 0) resolve();
        else
          reject(
            Object.assign(new Error(`Process exited with code ${code}`), {
              code,
            }),
          );
      });
      child.on("error", reject);
    });
  } catch (e) {
    if (e.code !== 0) {
      // 子プロセスのエラーメッセージは stdio: "inherit" で既に表示済み
      process.exit(typeof e.code === "number" ? e.code : 1);
    }
  } finally {
    await fs.unlink(tempFile).catch(() => {});
  }
}
