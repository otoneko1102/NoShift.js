// ======
// NoShift.js → JavaScript 置換用マップ
// ======
const noShiftMap = {
  // "^@^@^@": "```", // マルチバックチック
  "^4^[": "${", // テンプレート式展開開始
  "^0": "^",
  "^1": "!",
  "^2": '"',
  "^4": "$",
  "^5": "%",
  "^6": "&",
  "^7": "'",
  "^8": "(",
  "^9": ")",
  "^-": "=",
  "^^": "~",
  "^\\": "|",
  "^@": "`",
  "^[": "{",
  "^]": "}",
  "^;": "+",
  "^:": "*",
  "^,": "<",
  "^.": ">",
  "^/": "?",
};

// 逆引きマップ: JavaScript 記号 → NoShift 表記（単一記号のみ）
const symbolToNoshift = Object.fromEntries(
  Object.entries(noShiftMap)
    .filter(([key, value]) => key.length === 2 && value.length === 1)
    .map(([key, value]) => [value, key]),
);

function convertNsjsToJs(nsjsCode, options = {}) {
  const capitalizeInStrings = options.capitalizeInStrings !== false;
  let jsCode = "";
  let i = 0;
  const len_ns = nsjsCode.length;

  // ======
  // 各種状態 (State) を定義
  // ======
  const STATE = {
    NORMAL: "NORMAL", // 普通のコード
    IN_DQ_STRING: "IN_DQ_STRING", // " … " の中
    IN_SQ_STRING: "IN_SQ_STRING", // ' … ' の中
    IN_BT_SINGLE_STRING: "IN_BT_SINGLE_STRING", // ` … ` の中
    IN_BT_MULTI_STRING: "IN_BT_MULTI_STRING", // ``` … ``` の中
    IN_TEMPLATE_EXPRESSION: "IN_TEMPLATE_EXPRESSION", // ${ … } の中
    RAW_DQ_IN_EXPR: "RAW_DQ_IN_EXPR", // テンプレート式内の " … " の中 （NoShift 変換なし）
    RAW_SQ_IN_EXPR: "RAW_SQ_IN_EXPR", // テンプレート式内の ' … ' の中 （NoShift 変換なし）
    IN_LINE_COMMENT: "IN_LINE_COMMENT", // // … の中
    IN_BLOCK_COMMENT: "IN_BLOCK_COMMENT", // /^: … ^:/ の中
  };

  let currentState = STATE.NORMAL;
  const stateStack = [];

  // マッピングキーは長いものからマッチさせる
  const sortedNsKeys = Object.keys(noShiftMap).sort(
    (a, b) => b.length - a.length,
  );

  /**
   * tryConsumeNsjsSequence:
   *  - カーソル i の位置に noShiftMap のキーまたは特殊シーケンスがあれば消費し、
   *    jsCode に出力して true を返す。なければ false を返す。
   *
   * 優先度:
   *  1) テンプレートリテラル中の式展開開始 (^4^[ / ^4[)
   *  2) テンプレート式中の式閉じ (^])
   *  3) 通常コード/テンプレート式外の文字列開閉 (^2, ^7, ^@^@^@, ^@)
   *  4) テンプレート式中の JS 文字列開閉 (^2, ^7 → RAW_DQ_IN_EXPR / RAW_SQ_IN_EXPR)
   *  5) RAW_DQ_IN_EXPR/RAW_SQ_IN_EXPR 内の終端 (^2 / ^7 → 戻る)
   *  6) 通常の NoShift 置換 (NORMAL または IN_TEMPLATE_EXPRESSION のとき)
   */
  function tryConsumeNsjsSequence() {
    let allowGeneral = false;
    if (
      currentState === STATE.NORMAL ||
      currentState === STATE.IN_TEMPLATE_EXPRESSION
    ) {
      allowGeneral = true;
    }

    for (const nsKey of sortedNsKeys) {
      if (!nsjsCode.startsWith(nsKey, i)) continue;

      // ======
      // 1) テンプレートリテラル中の式展開開始
      // ======
      if (
        (nsKey === "^4^[" || nsjsCode.startsWith("^4[", i)) &&
        (currentState === STATE.IN_BT_SINGLE_STRING ||
          currentState === STATE.IN_BT_MULTI_STRING)
      ) {
        jsCode += "${";
        i += nsKey === "^4^[" ? nsKey.length : 3;
        stateStack.push(currentState);
        currentState = STATE.IN_TEMPLATE_EXPRESSION;
        return true;
      }

      // ======
      // 2) テンプレート式中の式閉じ
      // ======
      if (nsKey === "^]" && currentState === STATE.IN_TEMPLATE_EXPRESSION) {
        jsCode += "}";
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }

      // ======
      // 3) 通常コード/テンプレート式外の文字列開閉
      // ======

      // 3-1) "^2": ダブルクォート開閉
      if (nsKey === "^2" && currentState === STATE.NORMAL) {
        jsCode += '"';
        i += nsKey.length;
        stateStack.push(currentState);
        currentState = STATE.IN_DQ_STRING;
        return true;
      }
      if (nsKey === "^2" && currentState === STATE.IN_DQ_STRING) {
        jsCode += '"';
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }

      // 3-2) "^7": シングルクォート開閉
      if (nsKey === "^7" && currentState === STATE.NORMAL) {
        jsCode += "'";
        i += nsKey.length;
        stateStack.push(currentState);
        currentState = STATE.IN_SQ_STRING;
        return true;
      }
      if (nsKey === "^7" && currentState === STATE.IN_SQ_STRING) {
        jsCode += "'";
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }

      // このブロックを削除
      // 3-3) "^@^@^@": マルチバックチック開閉
      /*
      if (
        nsKey === "^@^@^@" &&
        (currentState === STATE.NORMAL ||
          currentState === STATE.IN_TEMPLATE_EXPRESSION)
      ) {
        jsCode += "```";
        i += nsKey.length;
        stateStack.push(currentState);
        currentState = STATE.IN_BT_MULTI_STRING;
        return true;
      }
      if (nsKey === "^@^@^@" && currentState === STATE.IN_BT_MULTI_STRING) {
        jsCode += "```";
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }
      */

      // 3-4) "^@": シングルバックチック開閉
      if (
        nsKey === "^@" &&
        (currentState === STATE.NORMAL ||
          currentState === STATE.IN_TEMPLATE_EXPRESSION)
      ) {
        jsCode += "`";
        i += nsKey.length;
        stateStack.push(currentState);
        currentState = STATE.IN_BT_SINGLE_STRING;
        return true;
      }
      if (nsKey === "^@" && currentState === STATE.IN_BT_SINGLE_STRING) {
        jsCode += "`";
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }

      // ======
      // 4) テンプレート式中の JS 文字列開閉
      // ======
      if (nsKey === "^2" && currentState === STATE.IN_TEMPLATE_EXPRESSION) {
        jsCode += '"';
        i += nsKey.length;
        stateStack.push(currentState);
        currentState = STATE.RAW_DQ_IN_EXPR;
        return true;
      }
      if (nsKey === "^7" && currentState === STATE.IN_TEMPLATE_EXPRESSION) {
        jsCode += "'";
        i += nsKey.length;
        stateStack.push(currentState);
        currentState = STATE.RAW_SQ_IN_EXPR;
        return true;
      }

      // ======
      // 5) RAW_DQ_IN_EXPR / RAW_SQ_IN_EXPR 内の終端
      // ======
      if (nsKey === "^2" && currentState === STATE.RAW_DQ_IN_EXPR) {
        jsCode += '"';
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }
      if (nsKey === "^7" && currentState === STATE.RAW_SQ_IN_EXPR) {
        jsCode += "'";
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }

      // ======
      // 6) 通常の NoShift 置換 (NORMAL or IN_TEMPLATE_EXPRESSION のとき)
      // ======
      if (allowGeneral) {
        jsCode += noShiftMap[nsKey];
        i += nsKey.length;
        return true;
      }
    }

    return false;
  }

  // ======
  // メインループ
  // ======
  while (i < len_ns) {
    let consumed = false;

    // ======
    // ステップ1: 文字列内でのエスケープ処理
    // ======

    // (A) IN_DQ_STRING 内 (" … ")
    if (currentState === STATE.IN_DQ_STRING) {
      if (nsjsCode.startsWith("\\^3", i)) {
        jsCode += "^3"; // "\^3" を文字列中のリテラル "^3" として出力
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\^2", i)) {
        jsCode += "^2"; // "\^2" を文字列中の "^2" として出力
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\"; // "\\" を JSコード内で "\\\\" に出力
        i += 2;
        consumed = true;
      }
    }
    // (B) IN_SQ_STRING 内 (' … ')
    else if (currentState === STATE.IN_SQ_STRING) {
      if (nsjsCode.startsWith("\\^3", i)) {
        jsCode += "^3";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\^7", i)) {
        jsCode += "^7";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      }
    }
    // (C) RAW_DQ_IN_EXPR 内 (テンプレート式中の " … ")
    else if (currentState === STATE.RAW_DQ_IN_EXPR) {
      if (nsjsCode.startsWith("\\^3", i)) {
        jsCode += "^3";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\^2", i)) {
        jsCode += "^2";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      } else if (nsjsCode.startsWith("^2", i)) {
        jsCode += '"'; // 終端
        i += 2;
        currentState = stateStack.pop();
        consumed = true;
      }
      if (consumed) {
        continue; // 生文字扱いなので NoShift 変換せず次へ
      } else {
        jsCode += nsjsCode[i];
        i += 1;
        continue;
      }
    }
    // (D) RAW_SQ_IN_EXPR 内 (テンプレート式中の ' … ')
    else if (currentState === STATE.RAW_SQ_IN_EXPR) {
      if (nsjsCode.startsWith("\\^3", i)) {
        jsCode += "^3";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\^7", i)) {
        jsCode += "^7";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      } else if (nsjsCode.startsWith("^7", i)) {
        jsCode += "'";
        i += 2;
        currentState = stateStack.pop();
        consumed = true;
      }
      if (consumed) {
        continue;
      } else {
        jsCode += nsjsCode[i];
        i += 1;
        continue;
      }
    }
    // (E) IN_BT_SINGLE_STRING 内 (` … `)
    else if (currentState === STATE.IN_BT_SINGLE_STRING) {
      if (nsjsCode.startsWith("\\^3", i)) {
        jsCode += "^3";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\^@", i)) {
        jsCode += "^@";
        i += 3;
        consumed = true;
      } else if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      }
    }
    // (F) IN_BT_MULTI_STRING 内 (``` … ```)
    else if (currentState === STATE.IN_BT_MULTI_STRING) {
      /* if (nsjsCode.startsWith("\\^@^@^@", i)) {
        jsCode += "^@^@^@";
        i += 7;
        consumed = true;
      } else */
      if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      }
    }

    // ======
    // ステップ2: ^3 大文字化モディファイア (RAW 状態とコメント以外で動作)
    //   - コード上 (NORMAL, IN_TEMPLATE_EXPRESSION) では常に有効
    //   - 文字列内は capitalizeInStrings オプションに従う
    // ======
    if (
      !consumed &&
      currentState !== STATE.RAW_DQ_IN_EXPR &&
      currentState !== STATE.RAW_SQ_IN_EXPR &&
      currentState !== STATE.IN_LINE_COMMENT &&
      currentState !== STATE.IN_BLOCK_COMMENT
    ) {
      if (nsjsCode.startsWith("^3", i)) {
        const inString =
          currentState === STATE.IN_DQ_STRING ||
          currentState === STATE.IN_SQ_STRING ||
          currentState === STATE.IN_BT_SINGLE_STRING ||
          currentState === STATE.IN_BT_MULTI_STRING;
        if (!inString || capitalizeInStrings) {
          i += 2;
          if (i < len_ns) {
            jsCode += nsjsCode[i].toUpperCase();
            i += 1;
          }
          consumed = true;
        }
      }
    }

    // ======
    // ステップ2.5: コメントの処理
    // ======
    if (!consumed) {
      // 行コメント開始 (//)
      if (currentState === STATE.NORMAL && nsjsCode.startsWith("//", i)) {
        jsCode += "//";
        i += 2;
        stateStack.push(currentState);
        currentState = STATE.IN_LINE_COMMENT;
        consumed = true;
      }
      // 行コメント終了 (改行)
      else if (currentState === STATE.IN_LINE_COMMENT) {
        if (nsjsCode[i] === "\n") {
          jsCode += "\n";
          i += 1;
          currentState = stateStack.pop();
        } else {
          jsCode += nsjsCode[i];
          i += 1;
        }
        consumed = true;
      }
      // ブロックコメント開始 (/^:)
      else if (currentState === STATE.NORMAL && nsjsCode.startsWith("/^:", i)) {
        jsCode += "/*";
        i += 3;
        stateStack.push(currentState);
        currentState = STATE.IN_BLOCK_COMMENT;
        consumed = true;
      }
      // ブロックコメント終了 (^:/)
      else if (
        currentState === STATE.IN_BLOCK_COMMENT &&
        nsjsCode.startsWith("^:/", i)
      ) {
        jsCode += "*/";
        i += 3;
        currentState = stateStack.pop();
        consumed = true;
      }
      // ブロックコメント内の文字 (そのまま出力)
      else if (currentState === STATE.IN_BLOCK_COMMENT) {
        jsCode += nsjsCode[i];
        i += 1;
        consumed = true;
      }
    }

    // ======
    // ステップ3: NoShift シーケンスや文字列/テンプレートの開閉、式展開を試す
    // ======
    if (!consumed) {
      consumed = tryConsumeNsjsSequence();
    }

    // ======
    // ステップ4: 何も消費しなかったら文字をそのまま出力
    // ======
    if (!consumed) {
      jsCode += nsjsCode[i];
      i += 1;
    }
  }

  // スタックに残りがあればリテラル/テンプレートの閉じ忘れ
  if (stateStack.length > 0) {
    // diagnostics モードでない場合のみ警告を出す
    if (!options._silent) {
      console.warn(
        `Warning: Unmatched literal/templating states. Final state: ${currentState}, Remaining stack: ${stateStack.join(
          ", ",
        )}`,
      );
    }
  }
  return jsCode;
}

/**
 * ソースコード内の大文字、_, $, # の使用を警告する。
 * コメント内は無視する。
 * capitalizeInStrings が true の場合、文字列内の大文字も警告する。
 * @param {string} nsjsCode
 * @param {{ capitalizeInStrings?: boolean }} [options={}]
 * @returns {{ line: number, column: number, char: string, message: string }[]}
 */
function checkUppercaseWarnings(nsjsCode, options = {}) {
  const capitalizeInStrings = options.capitalizeInStrings !== false;
  const warnings = [];
  const lines = nsjsCode.split("\n");

  // シンプルな状態追跡（文字列・コメント内を除外）
  let inDQ = false; // ^2...^2
  let inSQ = false; // ^7...^7
  let inBT = false; // ^@...^@
  let inLineComment = false;
  let inBlockComment = false;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    inLineComment = false; // 行コメントは行ごとにリセット

    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const next = line[col + 1];

      // エスケープ (\^2, \^7, \^@) をスキップ
      if (ch === "\\" && next === "^") {
        col += 2;
        continue;
      }

      // ブロックコメント終了 (^:/)
      if (
        inBlockComment &&
        ch === "^" &&
        next === ":" &&
        line[col + 2] === "/"
      ) {
        inBlockComment = false;
        col += 2;
        continue;
      }
      if (inBlockComment) continue;

      // 行コメント開始
      if (!inDQ && !inSQ && !inBT && ch === "/" && next === "/") {
        inLineComment = true;
        break;
      }
      // ブロックコメント開始 (/^:)
      if (
        !inDQ &&
        !inSQ &&
        !inBT &&
        ch === "/" &&
        next === "^" &&
        line[col + 2] === ":"
      ) {
        inBlockComment = true;
        col += 2;
        continue;
      }

      if (inLineComment) continue;

      // ^3 モディファイア → 次の文字はスキップ（意図的な大文字化）
      if (ch === "^" && next === "3") {
        col += 2; // ^3 と次の文字をスキップ
        continue;
      }

      // 文字列リテラルの開閉
      if (ch === "^" && next === "2") {
        inDQ = !inDQ;
        col += 1;
        continue;
      }
      if (ch === "^" && next === "7") {
        inSQ = !inSQ;
        col += 1;
        continue;
      }
      if (ch === "^" && next === "@") {
        inBT = !inBT;
        col += 1;
        continue;
      }

      // 文字列内の処理
      if (inDQ || inSQ || inBT) {
        // capitalizeInStrings が有効なら、文字列内の大文字も警告
        if (capitalizeInStrings && /[A-Z]/.test(ch)) {
          warnings.push({
            line: lineNum + 1,
            column: col + 1,
            char: ch,
            message: `Uppercase letter '${ch}' found in string. Use ^3${ch.toLowerCase()} instead.`,
          });
        }
        continue;
      }

      // 他の ^X シーケンスをスキップ
      if (ch === "^" && next && /[0-9\-^\\@\[\];:,./]/.test(next)) {
        col += 1;
        continue;
      }

      // 大文字の警告
      if (/[A-Z]/.test(ch)) {
        warnings.push({
          line: lineNum + 1,
          column: col + 1,
          char: ch,
          message: `Uppercase letter '${ch}' found. Use ^3${ch.toLowerCase()} instead.`,
        });
      }
      // Shift キーが必要な記号の警告
      else if (symbolToNoshift[ch]) {
        warnings.push({
          line: lineNum + 1,
          column: col + 1,
          char: ch,
          message: `Symbol '${ch}' found. Use ${symbolToNoshift[ch]} instead.`,
        });
      }
      // _, # の警告
      else if (ch === "_") {
        warnings.push({
          line: lineNum + 1,
          column: col + 1,
          char: ch,
          message: "Underscore '_' found in code.",
        });
      } else if (ch === "#") {
        warnings.push({
          line: lineNum + 1,
          column: col + 1,
          char: ch,
          message: "Hash '#' found in code.",
        });
      }
    }
  }

  return warnings;
}

module.exports = convertNsjsToJs;
module.exports.checkUppercaseWarnings = checkUppercaseWarnings;
module.exports.diagnose = diagnose;

// ======
// 有効な ^X シーケンスの一覧（^3 は別扱い）
// ======
const validCaretKeys = new Set(Object.keys(noShiftMap).map((k) => k[1]));
// ^3 (capitalize) も有効
validCaretKeys.add("3");

/**
 * NoShift.js ソースコードの構文エラーを検出する。
 *
 * 検出するエラー:
 *   - 閉じられていない文字列リテラル (^2, ^7, ^@)
 *   - 閉じられていないブロックコメント (/^:)
 *   - 閉じられていないテンプレート式 (^4^[)
 *   - ファイル末尾の ^3 (大文字化対象の文字がない)
 *   - 不明な ^ シーケンス
 *
 * @param {string} nsjsCode
 * @returns {{ line: number, column: number, message: string }[]}
 */
function diagnose(nsjsCode) {
  const errors = [];
  const lines = nsjsCode.split("\n");

  // 状態: "NORMAL" | "DQ" | "SQ" | "BT" | "BLOCK_COMMENT" | "LINE_COMMENT" | "TEMPLATE_EXPR"
  let state = "NORMAL";
  const stateStack = [];
  // 開始位置のスタック (エラー報告用)
  const openPositions = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // 行コメントは行ごとにリセット
    if (state === "LINE_COMMENT") {
      state = stateStack.pop() || "NORMAL";
    }

    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const next = col + 1 < line.length ? line[col + 1] : undefined;
      const next2 = col + 2 < line.length ? line[col + 2] : undefined;

      // エスケープ (\^X) をスキップ
      if (ch === "\\" && next === "^") {
        col += 2;
        continue;
      }
      // \\\\ をスキップ
      if (ch === "\\" && next === "\\") {
        col += 1;
        continue;
      }

      // ── ブロックコメント内 ──
      if (state === "BLOCK_COMMENT") {
        if (ch === "^" && next === ":" && next2 === "/") {
          state = stateStack.pop() || "NORMAL";
          openPositions.pop();
          col += 2;
        }
        continue;
      }

      // ── 行コメント内 ──
      if (state === "LINE_COMMENT") {
        continue; // 改行で自動リセット（上で処理済み）
      }

      // ── 文字列内 ──
      if (state === "DQ") {
        if (ch === "^" && next === "2") {
          state = stateStack.pop() || "NORMAL";
          openPositions.pop();
          col += 1;
        }
        continue;
      }
      if (state === "SQ") {
        if (ch === "^" && next === "7") {
          state = stateStack.pop() || "NORMAL";
          openPositions.pop();
          col += 1;
        }
        continue;
      }
      if (state === "BT") {
        // テンプレート式展開開始
        if (ch === "^" && next === "4" && (next2 === "^" || next2 === "[")) {
          if (next2 === "^" && col + 3 < line.length && line[col + 3] === "[") {
            stateStack.push(state);
            openPositions.push({
              line: lineNum + 1,
              column: col + 1,
              type: "TEMPLATE_EXPR",
            });
            state = "TEMPLATE_EXPR";
            col += 3;
          } else if (next2 === "[") {
            stateStack.push(state);
            openPositions.push({
              line: lineNum + 1,
              column: col + 1,
              type: "TEMPLATE_EXPR",
            });
            state = "TEMPLATE_EXPR";
            col += 2;
          }
          continue;
        }
        if (ch === "^" && next === "@") {
          state = stateStack.pop() || "NORMAL";
          openPositions.pop();
          col += 1;
        }
        continue;
      }

      // ── テンプレート式内 ──
      if (state === "TEMPLATE_EXPR") {
        if (ch === "^" && next === "]") {
          state = stateStack.pop() || "NORMAL";
          openPositions.pop();
          col += 1;
          continue;
        }
        // テンプレート式内の文字列もチェック → fall through to NORMAL logic
      }

      // ── NORMAL / TEMPLATE_EXPR 共通 ──

      // 行コメント開始
      if (ch === "/" && next === "/") {
        stateStack.push(state);
        state = "LINE_COMMENT";
        break; // 行末まで読み飛ばし
      }

      // ブロックコメント開始 (/^:)
      if (ch === "/" && next === "^" && next2 === ":") {
        stateStack.push(state);
        openPositions.push({
          line: lineNum + 1,
          column: col + 1,
          type: "BLOCK_COMMENT",
        });
        state = "BLOCK_COMMENT";
        col += 2;
        continue;
      }

      // ダブルクォート文字列開始 (^2)
      if (ch === "^" && next === "2") {
        stateStack.push(state);
        openPositions.push({ line: lineNum + 1, column: col + 1, type: "DQ" });
        state = "DQ";
        col += 1;
        continue;
      }

      // シングルクォート文字列開始 (^7)
      if (ch === "^" && next === "7") {
        stateStack.push(state);
        openPositions.push({ line: lineNum + 1, column: col + 1, type: "SQ" });
        state = "SQ";
        col += 1;
        continue;
      }

      // テンプレートリテラル開始 (^@)
      if (ch === "^" && next === "@") {
        stateStack.push(state);
        openPositions.push({ line: lineNum + 1, column: col + 1, type: "BT" });
        state = "BT";
        col += 1;
        continue;
      }

      // ^3 大文字化: 次の文字がなければエラー
      if (ch === "^" && next === "3") {
        if (col + 2 >= line.length && lineNum === lines.length - 1) {
          errors.push({
            line: lineNum + 1,
            column: col + 1,
            message:
              "^3 at end of file with no following character to capitalize.",
          });
        }
        col += 2; // ^3 + 次の1文字をスキップ
        continue;
      }

      // その他の ^X シーケンス: 有効性チェック
      if (ch === "^" && next !== undefined) {
        if (!validCaretKeys.has(next)) {
          errors.push({
            line: lineNum + 1,
            column: col + 1,
            message: `Unknown sequence '^${next}'.`,
          });
        }
        col += 1;
        continue;
      }

      // ファイル末尾の孤立 ^
      if (ch === "^" && next === undefined && lineNum === lines.length - 1) {
        errors.push({
          line: lineNum + 1,
          column: col + 1,
          message: "Lone '^' at end of file.",
        });
      }
    }
  }

  // ── 閉じられていない構造を報告 ──
  while (openPositions.length > 0) {
    const pos = openPositions.pop();
    const labels = {
      DQ: "string literal (^2...^2)",
      SQ: "string literal (^7...^7)",
      BT: "template literal (^@...^@)",
      BLOCK_COMMENT: "block comment (/^:...^:/)",
      TEMPLATE_EXPR: "template expression (^4^[...^])",
    };
    errors.push({
      line: pos.line,
      column: pos.column,
      message: `Unclosed ${labels[pos.type] || pos.type} opened here.`,
    });
  }

  return errors;
}
