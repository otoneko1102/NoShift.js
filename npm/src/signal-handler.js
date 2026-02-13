// シグナルハンドリングユーティリティ

let isHandlerRegistered = false;
let cleanupCallbacks = [];

/**
 * Ctrl+C (SIGINT) を適切にハンドリングする
 * @param {Function} cleanup - クリーンアップ時に実行する関数（オプション）
 */
export function handleSigint(cleanup) {
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
        } catch (e) {
          // エラーは無視
        }
      }

      process.exit(0);
    });
  }
}

/**
 * inquirer のキャンセルエラーをチェック
 * @param {Error} error
 * @returns {boolean}
 */
export function isUserCancelled(error) {
  return (
    error &&
    (error.name === "ExitPromptError" ||
      error.message === "User force closed the prompt")
  );
}
