// ======
// @noshift.js/lint — Lint rules for NoShift.js
// ======

"use strict";

// 有効な ^X シーケンス
const validCaretKeys = new Set([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "-",
  "^",
  "\\",
  "@",
  "[",
  "]",
  ";",
  ":",
  ",",
  ".",
  "/",
]);

// ── 組み込みルール一覧 ──

/**
 * @typedef {Object} LintMessage
 * @property {number} line     - 1-based line number
 * @property {number} column   - 1-based column number
 * @property {string} message  - Human-readable message
 * @property {"error"|"warning"} severity
 * @property {string} rule     - Rule name
 */

/**
 * @typedef {Object} LintConfig
 * @property {Object<string, "error"|"warning"|"off">} [rules]
 */

// デフォルトのルール設定
const defaultRules = {
  "unclosed-string": "error",
  "unclosed-comment": "error",
  "unclosed-template-expr": "error",
  "unknown-caret-sequence": "error",
  "lone-caret": "error",
  "capitalize-eof": "error",
  "uppercase-in-code": "warning",
  "trailing-whitespace": "off",
  "no-consecutive-blank-lines": "off",
};

/**
 * すべてのルール名を返す
 */
function getRuleNames() {
  return Object.keys(defaultRules);
}

/**
 * デフォルトのルール設定を返す
 */
function getDefaultRules() {
  return { ...defaultRules };
}

/**
 * デフォルトの nsjslinter.json 設定を生成する
 */
function createDefaultConfig() {
  return {
    rules: { ...defaultRules },
  };
}

/**
 * NoShift.js ソースコードを lint する
 *
 * @param {string} source - NoShift.js ソースコード
 * @param {LintConfig} [config] - ルール設定
 * @returns {LintMessage[]}
 */
function lint(source, config = {}) {
  const rules = { ...defaultRules, ...(config.rules || {}) };
  const messages = [];

  function report(rule, line, column, message) {
    const severity = rules[rule];
    if (!severity || severity === "off") return;
    messages.push({ line, column, message, severity, rule });
  }

  const lines = source.split("\n");

  // ── 構造チェック (状態マシン) ──
  let state = "NORMAL";
  const stateStack = [];
  const openPositions = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const lineNo = lineNum + 1;

    // 行コメントリセット
    if (state === "LINE_COMMENT") {
      state = stateStack.pop() || "NORMAL";
    }

    // ── trailing-whitespace ──
    if (rules["trailing-whitespace"] !== "off") {
      if (line.length > 0 && line !== line.trimEnd()) {
        report(
          "trailing-whitespace",
          lineNo,
          line.trimEnd().length + 1,
          "Trailing whitespace.",
        );
      }
    }

    // ── no-consecutive-blank-lines ──
    if (rules["no-consecutive-blank-lines"] !== "off") {
      if (
        lineNum > 0 &&
        line.trim() === "" &&
        lines[lineNum - 1].trim() === ""
      ) {
        report(
          "no-consecutive-blank-lines",
          lineNo,
          1,
          "Consecutive blank lines.",
        );
      }
    }

    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const next = col + 1 < line.length ? line[col + 1] : undefined;
      const next2 = col + 2 < line.length ? line[col + 2] : undefined;
      const colNo = col + 1;

      // エスケープをスキップ
      if (ch === "\\" && next === "^") {
        col += 2;
        continue;
      }
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
        continue;
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
        if (ch === "^" && next === "4" && (next2 === "^" || next2 === "[")) {
          if (next2 === "^" && col + 3 < line.length && line[col + 3] === "[") {
            stateStack.push(state);
            openPositions.push({
              line: lineNo,
              column: colNo,
              type: "TEMPLATE_EXPR",
            });
            state = "TEMPLATE_EXPR";
            col += 3;
          } else if (next2 === "[") {
            stateStack.push(state);
            openPositions.push({
              line: lineNo,
              column: colNo,
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
      }

      // ── NORMAL / TEMPLATE_EXPR 共通 ──

      // 行コメント
      if (ch === "/" && next === "/") {
        stateStack.push(state);
        state = "LINE_COMMENT";
        break;
      }

      // ブロックコメント
      if (ch === "/" && next === "^" && next2 === ":") {
        stateStack.push(state);
        openPositions.push({
          line: lineNo,
          column: colNo,
          type: "BLOCK_COMMENT",
        });
        state = "BLOCK_COMMENT";
        col += 2;
        continue;
      }

      // ダブルクォート文字列
      if (ch === "^" && next === "2") {
        stateStack.push(state);
        openPositions.push({ line: lineNo, column: colNo, type: "DQ" });
        state = "DQ";
        col += 1;
        continue;
      }

      // シングルクォート文字列
      if (ch === "^" && next === "7") {
        stateStack.push(state);
        openPositions.push({ line: lineNo, column: colNo, type: "SQ" });
        state = "SQ";
        col += 1;
        continue;
      }

      // テンプレートリテラル
      if (ch === "^" && next === "@") {
        stateStack.push(state);
        openPositions.push({ line: lineNo, column: colNo, type: "BT" });
        state = "BT";
        col += 1;
        continue;
      }

      // ^3 大文字化
      if (ch === "^" && next === "3") {
        if (col + 2 >= line.length && lineNum === lines.length - 1) {
          report(
            "capitalize-eof",
            lineNo,
            colNo,
            "^3 at end of file with no following character to capitalize.",
          );
        }
        col += 2;
        continue;
      }

      // uppercase-in-code: コード内の大文字をチェック
      if (rules["uppercase-in-code"] !== "off") {
        if (/[A-Z]/.test(ch)) {
          report(
            "uppercase-in-code",
            lineNo,
            colNo,
            `Uppercase letter '${ch}' in code. Use ^3 to capitalize.`,
          );
        }
      }

      // 不明な ^X シーケンス
      if (ch === "^" && next !== undefined) {
        if (!validCaretKeys.has(next)) {
          report(
            "unknown-caret-sequence",
            lineNo,
            colNo,
            `Unknown sequence '^${next}'.`,
          );
        }
        col += 1;
        continue;
      }

      // 末尾の孤立 ^
      if (ch === "^" && next === undefined && lineNum === lines.length - 1) {
        report("lone-caret", lineNo, colNo, "Lone '^' at end of file.");
      }
    }
  }

  // ── 閉じられていない構造 ──
  const labels = {
    DQ: "string literal (^2...^2)",
    SQ: "string literal (^7...^7)",
    BT: "template literal (^@...^@)",
    BLOCK_COMMENT: "block comment (/^:...^:/)",
    TEMPLATE_EXPR: "template expression (^4^[...^])",
  };

  const unclosedRules = {
    DQ: "unclosed-string",
    SQ: "unclosed-string",
    BT: "unclosed-string",
    BLOCK_COMMENT: "unclosed-comment",
    TEMPLATE_EXPR: "unclosed-template-expr",
  };

  while (openPositions.length > 0) {
    const pos = openPositions.pop();
    const ruleName = unclosedRules[pos.type] || "unclosed-string";
    report(
      ruleName,
      pos.line,
      pos.column,
      `Unclosed ${labels[pos.type] || pos.type}.`,
    );
  }

  // 行番号 → 列番号でソート
  messages.sort((a, b) => a.line - b.line || a.column - b.column);

  return messages;
}

/**
 * nsjslinter.json を読み込んでパースする
 * @param {string} configPath
 * @returns {LintConfig}
 */
function loadConfigSync(configPath) {
  const fs = require("fs");
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = {
  lint,
  createDefaultConfig,
  getDefaultRules,
  getRuleNames,
  loadConfigSync,
};
