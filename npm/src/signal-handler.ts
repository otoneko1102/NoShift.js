// シグナルハンドリングユーティリティ

let isHandlerRegistered = false;
let cleanupCallbacks: (() => void | Promise<void>)[] = [];

/**
 * Ctrl+C (SIGINT) を適切にハンドリングする
 * @param cleanup - クリーンアップ時に実行する関数（オプション）
 */
export function handleSigint(cleanup?: () => void | Promise<void>): void {
  if (cleanup) {
    cleanupCallbacks.push(cleanup);
  }

  if (!isHandlerRegistered) {
    isHandlerRegistered = true;

    process.on("SIGINT", async () => {
      console.log("\n"); // 改行を追加してきれいに終了

      // すべてのクリーンアップコールバックを実行
      for (const cb of cleanupCallbacks) {
        try {
          await cb();
        } catch {
          // エラーは無視
        }
      }

      process.exit(0);
    });
  }
}

/**
 * inquirer のキャンセルエラーをチェック
 */
export function isUserCancelled(error: unknown): boolean {
  return (
    error != null &&
    typeof error === "object" &&
    (("name" in error && (error as Error).name === "ExitPromptError") ||
      ("message" in error &&
        (error as Error).message === "User force closed the prompt"))
  );
}
