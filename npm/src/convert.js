function convertNsjsToJs(nsjsCode) {
  let jsCode = "";
  let i = 0;
  const len_ns = nsjsCode.length;

  // ======
  // 各種状態 (State) を定義
  // ======
  const STATE = {
    NORMAL: "NORMAL",                     // 普通のコード
    IN_DQ_STRING: "IN_DQ_STRING",         // " … " の中
    IN_SQ_STRING: "IN_SQ_STRING",         // ' … ' の中
    IN_BT_SINGLE_STRING: "IN_BT_SINGLE_STRING", // ` … ` の中
    IN_BT_MULTI_STRING: "IN_BT_MULTI_STRING",   // ``` … ``` の中
    IN_TEMPLATE_EXPRESSION: "IN_TEMPLATE_EXPRESSION", // ${ … } の中
    RAW_DQ_IN_EXPR: "RAW_DQ_IN_EXPR",     // テンプレート式内の " … " の中 （NoShift 変換なし）
    RAW_SQ_IN_EXPR: "RAW_SQ_IN_EXPR",     // テンプレート式内の ' … ' の中 （NoShift 変換なし）
  };

  let currentState = STATE.NORMAL;
  const stateStack = [];

  // ======
  // NoShift.js → JavaScript 置換用マップ
  // ======
  const noShiftMap = {
    "^@^@^@": "```", // マルチバックチック
    "^4^[": "${",    // テンプレート式展開開始
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

  // マッピングキーは長いものからマッチさせる
  const sortedNsKeys = Object.keys(noShiftMap).sort((a, b) => b.length - a.length);

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
    if (currentState === STATE.NORMAL || currentState === STATE.IN_TEMPLATE_EXPRESSION) {
      allowGeneral = true;
    }

    for (const nsKey of sortedNsKeys) {
      if (!nsjsCode.startsWith(nsKey, i)) continue;

      // ======
      // 1) テンプレートリテラル中の式展開開始
      // ======
      if (
        (nsKey === "^4^[" || nsjsCode.startsWith("^4[", i)) &&
        (currentState === STATE.IN_BT_SINGLE_STRING || currentState === STATE.IN_BT_MULTI_STRING)
      ) {
        jsCode += "${";
        i += (nsKey === "^4^[") ? nsKey.length : 3;
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

      // 3-3) "^@^@^@": マルチバックチック開閉
      if (
        nsKey === "^@^@^@" &&
        (currentState === STATE.NORMAL || currentState === STATE.IN_TEMPLATE_EXPRESSION)
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

      // 3-4) "^@": シングルバックチック開閉
      if (
        nsKey === "^@" &&
        (currentState === STATE.NORMAL || currentState === STATE.IN_TEMPLATE_EXPRESSION)
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
      if (nsjsCode.startsWith("\\^2", i)) {
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
      if (nsjsCode.startsWith("\\^7", i)) {
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
      if (nsjsCode.startsWith("\\^2", i)) {
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
      if (nsjsCode.startsWith("\\^7", i)) {
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
      if (nsjsCode.startsWith("\\^@", i)) {
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
      if (nsjsCode.startsWith("\\^@^@^@", i)) {
        jsCode += "^@^@^@";
        i += 7;
        consumed = true;
      } else if (nsjsCode.startsWith("\\\\", i)) {
        jsCode += "\\\\\\\\";
        i += 2;
        consumed = true;
      }
    }

    // ======
    // ステップ2: NoShift シーケンスや文字列/テンプレートの開閉、式展開を試す
    // ======
    if (!consumed) {
      consumed = tryConsumeNsjsSequence();
    }

    // ======
    // ステップ3: 何も消費しなかったら文字をそのまま出力
    // ======
    if (!consumed) {
      jsCode += nsjsCode[i];
      i += 1;
    }
  }

  // スタックに残りがあればリテラル/テンプレートの閉じ忘れ
  if (stateStack.length > 0) {
    console.warn(
      `Warning: Unmatched literal/templating states. Final state: ${currentState}, Remaining stack: ${stateStack.join(
        ", "
      )}`
    );
  }
  return jsCode;
}

export default convertNsjsToJs;
