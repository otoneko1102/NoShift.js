/**
 * NoShift.js → JavaScript 変換器 (self-contained)
 * prettier-plugin-noshift.js 用のスタンドアロン版
 */

// ======
// NoShift.js → JavaScript 置換用マップ
// ======
const noShiftMap = {
  "^4^[": "${", // テンプレート式展開開始
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

/**
 * NoShift.js コードを JavaScript コードに変換する。
 * @param {string} nsjsCode
 * @param {{ capitalizeInStrings?: boolean }} [options={}]
 * @returns {string}
 */
export function convertNsjsToJs(nsjsCode, options = {}) {
  const capitalizeInStrings = options.capitalizeInStrings !== false;
  let jsCode = "";
  let i = 0;
  const len_ns = nsjsCode.length;

  const STATE = {
    NORMAL: "NORMAL",
    IN_DQ_STRING: "IN_DQ_STRING",
    IN_SQ_STRING: "IN_SQ_STRING",
    IN_BT_SINGLE_STRING: "IN_BT_SINGLE_STRING",
    IN_BT_MULTI_STRING: "IN_BT_MULTI_STRING",
    IN_TEMPLATE_EXPRESSION: "IN_TEMPLATE_EXPRESSION",
    RAW_DQ_IN_EXPR: "RAW_DQ_IN_EXPR",
    RAW_SQ_IN_EXPR: "RAW_SQ_IN_EXPR",
    IN_LINE_COMMENT: "IN_LINE_COMMENT",
    IN_BLOCK_COMMENT: "IN_BLOCK_COMMENT",
  };

  let currentState = STATE.NORMAL;
  const stateStack = [];

  const sortedNsKeys = Object.keys(noShiftMap).sort(
    (a, b) => b.length - a.length,
  );

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

      // テンプレートリテラル中の式展開開始
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

      // テンプレート式中の式閉じ
      if (nsKey === "^]" && currentState === STATE.IN_TEMPLATE_EXPRESSION) {
        jsCode += "}";
        i += nsKey.length;
        currentState = stateStack.pop();
        return true;
      }

      // ダブルクォート開閉
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

      // シングルクォート開閉
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

      // バックチック開閉
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

      // テンプレート式中の文字列開閉
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

      // RAW 文字列終端
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

      // 通常の置換
      if (allowGeneral) {
        jsCode += noShiftMap[nsKey];
        i += nsKey.length;
        return true;
      }
    }

    return false;
  }

  // メインループ
  while (i < len_ns) {
    let consumed = false;

    // エスケープ処理
    if (currentState === STATE.IN_DQ_STRING) {
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
      }
    } else if (currentState === STATE.IN_SQ_STRING) {
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
    } else if (currentState === STATE.RAW_DQ_IN_EXPR) {
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
        jsCode += '"';
        i += 2;
        currentState = stateStack.pop();
        consumed = true;
      }
      if (consumed) continue;
      jsCode += nsjsCode[i];
      i += 1;
      continue;
    } else if (currentState === STATE.RAW_SQ_IN_EXPR) {
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
      if (consumed) continue;
      jsCode += nsjsCode[i];
      i += 1;
      continue;
    } else if (currentState === STATE.IN_BT_SINGLE_STRING) {
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
    } else if (currentState === STATE.IN_BT_MULTI_STRING) {
      if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      }
    }

    // ^3 大文字化モディファイア
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

    // コメント処理
    if (!consumed) {
      if (currentState === STATE.NORMAL && nsjsCode.startsWith("//", i)) {
        jsCode += "//";
        i += 2;
        stateStack.push(currentState);
        currentState = STATE.IN_LINE_COMMENT;
        consumed = true;
      } else if (currentState === STATE.IN_LINE_COMMENT) {
        if (nsjsCode[i] === "\n") {
          jsCode += "\n";
          i += 1;
          currentState = stateStack.pop();
        } else {
          jsCode += nsjsCode[i];
          i += 1;
        }
        consumed = true;
      } else if (
        currentState === STATE.NORMAL &&
        nsjsCode.startsWith("/^:", i)
      ) {
        jsCode += "/*";
        i += 3;
        stateStack.push(currentState);
        currentState = STATE.IN_BLOCK_COMMENT;
        consumed = true;
      } else if (
        currentState === STATE.IN_BLOCK_COMMENT &&
        nsjsCode.startsWith("^:/", i)
      ) {
        jsCode += "*/";
        i += 3;
        currentState = stateStack.pop();
        consumed = true;
      } else if (currentState === STATE.IN_BLOCK_COMMENT) {
        jsCode += nsjsCode[i];
        i += 1;
        consumed = true;
      }
    }

    // NoShift シーケンス
    if (!consumed) {
      consumed = tryConsumeNsjsSequence();
    }

    // そのまま出力
    if (!consumed) {
      jsCode += nsjsCode[i];
      i += 1;
    }
  }

  if (stateStack.length > 0) {
    console.warn(
      `Warning: Unmatched literal/templating states. Final state: ${currentState}, Remaining stack: ${stateStack.join(", ")}`,
    );
  }
  return jsCode;
}
