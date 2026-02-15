/**
 * NoShift.js Public API (CommonJS)
 *
 * @example
 * const { compile } = require("noshift.js");
 *
 * const result = compile('console.log^8^2^3hello^2^9;');
 * console.log(result.outputText);
 * // => console.log("Hello");
 */

"use strict";

const convertNsjsToJs = require("./convert.cjs");

/**
 * Compile NoShift.js source code to JavaScript.
 *
 * @param {string} source - NoShift.js source code
 * @param {object} [options={}] - Compiler options
 * @param {boolean} [options.capitalizeInStrings=true] - Enable ^3 capitalize modifier inside string literals
 * @returns {{ outputText: string }} Compilation result
 */
function compile(source, options = {}) {
  const outputText = convertNsjsToJs(source, {
    capitalizeInStrings: options.capitalizeInStrings !== false,
  });
  return { outputText };
}

module.exports = { compile };
