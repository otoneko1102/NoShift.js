// ======
// NoShift.js 構文エラー診断モジュール (VS Code 拡張機能用)
// npm/src/convert.cjs の diagnose() と同じロジックのスタンドアロン版
// ======

// 有効な ^X シーケンス (^3 大文字化を含む)
const validCaretKeys = new Set([
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "-", "^", "\\", "@", "[", "]", ";", ":", ",", ".", "/",
]);

/**
 * NoShift.js ソースコードの構文エラーを検出する。
 *
 * @param {string} nsjsCode
 * @returns {{ line: number, column: number, endColumn: number, message: string }[]}
 */
function diagnose(nsjsCode) {
  const errors = [];
  const lines = nsjsCode.split("\n");

  let state = "NORMAL";
  const stateStack = [];
  const openPositions = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    if (state === "LINE_COMMENT") {
      state = stateStack.pop() || "NORMAL";
    }

    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const next = col + 1 < line.length ? line[col + 1] : undefined;
      const next2 = col + 2 < line.length ? line[col + 2] : undefined;

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
            openPositions.push({ line: lineNum, column: col, length: 4, type: "TEMPLATE_EXPR" });
            state = "TEMPLATE_EXPR";
            col += 3;
          } else if (next2 === "[") {
            stateStack.push(state);
            openPositions.push({ line: lineNum, column: col, length: 3, type: "TEMPLATE_EXPR" });
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

      if (ch === "/" && next === "/") {
        stateStack.push(state);
        state = "LINE_COMMENT";
        break;
      }

      if (ch === "/" && next === "^" && next2 === ":") {
        stateStack.push(state);
        openPositions.push({ line: lineNum, column: col, length: 3, type: "BLOCK_COMMENT" });
        state = "BLOCK_COMMENT";
        col += 2;
        continue;
      }

      if (ch === "^" && next === "2") {
        stateStack.push(state);
        openPositions.push({ line: lineNum, column: col, length: 2, type: "DQ" });
        state = "DQ";
        col += 1;
        continue;
      }

      if (ch === "^" && next === "7") {
        stateStack.push(state);
        openPositions.push({ line: lineNum, column: col, length: 2, type: "SQ" });
        state = "SQ";
        col += 1;
        continue;
      }

      if (ch === "^" && next === "@") {
        stateStack.push(state);
        openPositions.push({ line: lineNum, column: col, length: 2, type: "BT" });
        state = "BT";
        col += 1;
        continue;
      }

      if (ch === "^" && next === "3") {
        if (col + 2 >= line.length && lineNum === lines.length - 1) {
          errors.push({
            line: lineNum,
            column: col,
            endColumn: col + 2,
            message: "^3 at end of file with no following character to capitalize.",
          });
        }
        col += 2;
        continue;
      }

      if (ch === "^" && next !== undefined) {
        if (!validCaretKeys.has(next)) {
          errors.push({
            line: lineNum,
            column: col,
            endColumn: col + 2,
            message: `Unknown sequence '^${next}'.`,
          });
        }
        col += 1;
        continue;
      }

      if (ch === "^" && next === undefined && lineNum === lines.length - 1) {
        errors.push({
          line: lineNum,
          column: col,
          endColumn: col + 1,
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
      endColumn: pos.column + pos.length,
      message: `Unclosed ${labels[pos.type] || pos.type}.`,
    });
  }

  return errors;
}

module.exports = { diagnose };
