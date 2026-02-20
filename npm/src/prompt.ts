/**
 * 対話式プロンプトユーティリティ
 */
import readline from "readline/promises";

/**
 * ユーザーにテキスト入力を求める
 */
export async function askInput(
  question: string,
  defaultValue?: string,
): Promise<string> {
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
 */
export async function askConfirm(
  question: string,
  defaultYes: boolean = true,
): Promise<boolean> {
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
