#!/usr/bin/env node

import readline from "readline/promises";
import { spawnSync } from "child_process";

const isTTY = process.stdout.isTTY;
const c = {
  bold: (s) => (isTTY ? `\x1b[1m${s}\x1b[0m` : s),
  dim: (s) => (isTTY ? `\x1b[2m${s}\x1b[0m` : s),
  cyan: (s) => (isTTY ? `\x1b[36m${s}\x1b[0m` : s),
};

async function main() {
  const argName = process.argv[2];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("");
  console.log(c.bold(c.cyan("  create-noshift.js")));
  console.log(c.dim("  Scaffold a new NoShift.js project\n"));

  rl.on("SIGINT", () => {
    console.log("\n  Cancelled.");
    process.exit(0);
  });

  try {
    const answer = await rl.question(`  Version ${c.dim("(latest)")}: `);
    const version = answer.trim() || "latest";
    rl.close();

    console.log("");
    let cmd = `npx noshift.js@${version} create`;
    if (argName) cmd += ` ${argName}`;
    console.log(c.dim(`  Running: ${cmd}`));
    console.log("");

    const args = [`noshift.js@${version}`, "create"];
    if (argName) args.push(argName);
    const result = spawnSync("npx", args, { stdio: "inherit", shell: true });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  } catch (err) {
    rl.close();
    if (err.code === "ERR_USE_AFTER_CLOSE") {
      process.exit(0);
    }
    console.error(`\n  Error: ${err.message}`);
    process.exit(1);
  }
}

main();
