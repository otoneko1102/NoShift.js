/**
 * prettier-plugin-noshift.js
 *
 * Prettier plugin for NoShift.js (.nsjs) files.
 *
 * Pipeline:
 *  1. nsjs → js  (convertNsjsToJs)
 *  2. js → formatted js  (Prettier babel parser)
 *  3. formatted js → nsjs  (convertJsToNsjs)
 */

import * as prettier from "prettier";
import { convertNsjsToJs } from "./convert.js";
import { convertJsToNsjs } from "./reverse.js";

// ======
// Language 定義
// ======
export const languages = [
  {
    name: "NoShift.js",
    parsers: ["noshift"],
    extensions: [".nsjs"],
    vscodeLanguageIds: ["noshift"],
  },
];

// ======
// 汎用のフォーマットオプションだけ転送する
// ======
const FORWARD_OPTIONS = [
  "tabWidth",
  "useTabs",
  "semi",
  "singleQuote",
  "trailingComma",
  "bracketSpacing",
  "arrowParens",
  "printWidth",
  "endOfLine",
  "quoteProps",
  "jsxSingleQuote",
  "singleAttributePerLine",
];

function pickFormatOptions(options) {
  const picked = {};
  for (const key of FORWARD_OPTIONS) {
    if (key in options) {
      picked[key] = options[key];
    }
  }
  return picked;
}

// ======
// Parser 定義
// ======
export const parsers = {
  noshift: {
    parse: async (text, options) => {
      // 1) nsjs → js
      const jsCode = convertNsjsToJs(text);

      // 2) Prettier で js をフォーマット
      const fmtOptions = {
        ...pickFormatOptions(options),
        parser: "babel",
        plugins: [],
      };
      const formatted = await prettier.format(jsCode, fmtOptions);

      // 3) フォーマット済み js → nsjs
      const nsjsFormatted = convertJsToNsjs(formatted.trimEnd());

      return {
        type: "NoshiftProgram",
        body: nsjsFormatted,
      };
    },
    astFormat: "noshift-ast",
    locStart: () => 0,
    locEnd: (node) => (node.body ? node.body.length : 0),
  },
};

// ======
// Printer 定義
// ======
export const printers = {
  "noshift-ast": {
    print: (path) => {
      const node = path.getValue();
      return node.body + "\n";
    },
  },
};

export default { languages, parsers, printers };
