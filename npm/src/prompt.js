/**
 * 対話式プロンプトユーティリティ
 */
import readline from "readline/promises";

/**
 * ユーザーにテキスト入力を求める
 * @param {string} question
 * @param {string} [defaultValue]
 * @returns {Promise<string>}
 */
export async function askInput(question, defaultValue) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  try {
    const answer = await rl.question(`${question}${suffix}: `);
    return answer.trim() || defaultValue || "";
  } finally {
    rl.close();
  }
}

/**
 * ユーザーに Yes/No を尋ねる
 * @param {string} question
 * @param {boolean} [defaultYes=true]
 * @returns {Promise<boolean>}
 */
export async function askConfirm(question, defaultYes = true) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const hint = defaultYes ? "Y/n" : "y/N";
  try {
    const answer = await rl.question(`${question} (${hint}): `);
    const trimmed = answer.trim().toLowerCase();
    if (trimmed === "") return defaultYes;
    return trimmed === "y" || trimmed === "yes";
  } finally {
    rl.close();
  }
}
