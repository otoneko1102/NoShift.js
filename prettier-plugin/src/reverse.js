/**
 * JavaScript → NoShift.js 逆変換器
 * Prettierでフォーマット済みのJSコードをNoShift.js構文に変換する。
 *
 * 変換ルール:
 * - コード内のShift記号 → ^X 表記
 * - 大文字 → ^3 + 小文字
 * - 文字列の区切り: " → ^2, ' → ^7, ` → ^@
 * - 文字列内容はそのまま（^3 による大文字化は保持）
 * - ブロックコメント: /* → /^:, *​/ → ^:/
 * - テンプレート式展開: ${ → ^4^[, } → ^]
 */

// JavaScript 記号 → NoShift.js 表記
const jsToNsMap = {
  "!": "^1",
  '"': "^2",
  $: "^4",
  "%": "^5",
  "&": "^6",
  "'": "^7",
  "(": "^8",
  ")": "^9",
  "=": "^-",
  "~": "^^",
  "|": "^\\",
  "`": "^@",
  "{": "^[",
  "}": "^]",
  "+": "^;",
  "*": "^:",
  "<": "^,",
  ">": "^.",
  "?": "^/",
  "^": "^0",
};

const STATE = {
  NORMAL: "NORMAL",
  IN_DQ_STRING: "IN_DQ_STRING",
  IN_SQ_STRING: "IN_SQ_STRING",
  IN_TEMPLATE: "IN_TEMPLATE",
  IN_TEMPLATE_EXPR: "IN_TEMPLATE_EXPR",
  IN_LINE_COMMENT: "IN_LINE_COMMENT",
  IN_BLOCK_COMMENT: "IN_BLOCK_COMMENT",
  IN_REGEX: "IN_REGEX",
};

/**
 * フォーマット済みJSをNoShift.js構文に変換する。
 * @param {string} jsCode - Prettierでフォーマット済みのJSコード
 * @param {{ capitalizeInStrings?: boolean }} [options={}]
 * @returns {string} NoShift.jsコード
 */
export function convertJsToNsjs(jsCode, options = {}) {
  const capitalizeInStrings = options.capitalizeInStrings !== false;
  let nsCode = "";
  let i = 0;
  const len = jsCode.length;

  let currentState = STATE.NORMAL;
  const stateStack = [];
  let templateDepth = 0;
  // テンプレートリテラルのネスト深度を追跡するスタック
  const templateBraceDepth = [];

  while (i < len) {
    const ch = jsCode[i];
    const next = jsCode[i + 1];

    // ======
    // 行コメント
    // ======
    if (currentState === STATE.IN_LINE_COMMENT) {
      if (ch === "\n") {
        nsCode += "\n";
        currentState = stateStack.pop();
      } else {
        nsCode += ch;
      }
      i++;
      continue;
    }

    // ======
    // ブロックコメント
    // ======
    if (currentState === STATE.IN_BLOCK_COMMENT) {
      if (ch === "*" && next === "/") {
        nsCode += "^:/";
        i += 2;
        currentState = stateStack.pop();
      } else {
        nsCode += ch;
        i++;
      }
      continue;
    }

    // ======
    // ダブルクォート文字列
    // ======
    if (currentState === STATE.IN_DQ_STRING) {
      if (ch === "\\" && i + 1 < len) {
        // エスケープシーケンスはそのまま
        nsCode += ch + next;
        i += 2;
      } else if (ch === '"') {
        nsCode += "^2";
        currentState = stateStack.pop();
        i++;
      } else if (capitalizeInStrings && /[A-Z]/.test(ch)) {
        nsCode += "^3" + ch.toLowerCase();
        i++;
      } else {
        nsCode += ch;
        i++;
      }
      continue;
    }

    // ======
    // シングルクォート文字列
    // ======
    if (currentState === STATE.IN_SQ_STRING) {
      if (ch === "\\" && i + 1 < len) {
        nsCode += ch + next;
        i += 2;
      } else if (ch === "'") {
        nsCode += "^7";
        currentState = stateStack.pop();
        i++;
      } else if (capitalizeInStrings && /[A-Z]/.test(ch)) {
        nsCode += "^3" + ch.toLowerCase();
        i++;
      } else {
        nsCode += ch;
        i++;
      }
      continue;
    }

    // ======
    // テンプレートリテラル
    // ======
    if (currentState === STATE.IN_TEMPLATE) {
      if (ch === "\\" && i + 1 < len) {
        nsCode += ch + next;
        i += 2;
      } else if (ch === "$" && next === "{") {
        nsCode += "^4^[";
        i += 2;
        stateStack.push(currentState);
        currentState = STATE.IN_TEMPLATE_EXPR;
        templateBraceDepth.push(0);
      } else if (ch === "`") {
        nsCode += "^@";
        currentState = stateStack.pop();
        i++;
      } else if (capitalizeInStrings && /[A-Z]/.test(ch)) {
        nsCode += "^3" + ch.toLowerCase();
        i++;
      } else {
        nsCode += ch;
        i++;
      }
      continue;
    }

    // ======
    // テンプレート式内 (${ ... })
    // ======
    if (currentState === STATE.IN_TEMPLATE_EXPR) {
      // テンプレート式内の { } のネスト追跡
      if (ch === "{") {
        templateBraceDepth[templateBraceDepth.length - 1]++;
        nsCode += "^[";
        i++;
        continue;
      }
      if (ch === "}") {
        const depth = templateBraceDepth[templateBraceDepth.length - 1];
        if (depth === 0) {
          // テンプレート式の終了
          templateBraceDepth.pop();
          nsCode += "^]";
          currentState = stateStack.pop();
          i++;
          continue;
        } else {
          templateBraceDepth[templateBraceDepth.length - 1]--;
          nsCode += "^]";
          i++;
          continue;
        }
      }
      // テンプレート式内は通常コードと同じ変換を適用
      // (以下のNORMAL処理にフォールスルー)
    }

    // ======
    // NORMAL + IN_TEMPLATE_EXPR 共通処理
    // ======
    if (
      currentState === STATE.NORMAL ||
      currentState === STATE.IN_TEMPLATE_EXPR
    ) {
      // 行コメント
      if (ch === "/" && next === "/") {
        nsCode += "//";
        i += 2;
        stateStack.push(currentState);
        currentState = STATE.IN_LINE_COMMENT;
        continue;
      }

      // ブロックコメント
      if (ch === "/" && next === "*") {
        nsCode += "/^:";
        i += 2;
        stateStack.push(currentState);
        currentState = STATE.IN_BLOCK_COMMENT;
        continue;
      }

      // ダブルクォート文字列開始
      if (ch === '"') {
        nsCode += "^2";
        i++;
        stateStack.push(currentState);
        currentState = STATE.IN_DQ_STRING;
        continue;
      }

      // シングルクォート文字列開始
      if (ch === "'") {
        nsCode += "^7";
        i++;
        stateStack.push(currentState);
        currentState = STATE.IN_SQ_STRING;
        continue;
      }

      // テンプレートリテラル開始
      if (ch === "`") {
        nsCode += "^@";
        i++;
        stateStack.push(currentState);
        currentState = STATE.IN_TEMPLATE;
        continue;
      }

      // 大文字
      if (/[A-Z]/.test(ch)) {
        nsCode += "^3" + ch.toLowerCase();
        i++;
        continue;
      }

      // Shift 記号
      if (jsToNsMap[ch]) {
        nsCode += jsToNsMap[ch];
        i++;
        continue;
      }

      // その他（小文字、数字、スペース、改行など）
      nsCode += ch;
      i++;
      continue;
    }

    // フォールバック
    nsCode += ch;
    i++;
  }

  return nsCode;
}
