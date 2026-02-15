/**
 * NoShift.js Public API
 *
 * Programmatic interface for compiling NoShift.js code to JavaScript.
 *
 * @example
 * import { compile } from "noshift.js";
 *
 * const result = compile('console.log^8^2^3hello^2^9;');
 * console.log(result.outputText);
 * // => console.log("Hello");
 *
 * @example
 * // With options
 * const result = compile(code, { capitalizeInStrings: false });
 */

import convertNsjsToJs, { diagnose as _diagnose } from "./convert.js";

/**
 * Compile NoShift.js source code to JavaScript.
 *
 * @param {string} source - NoShift.js source code
 * @param {object} [options={}] - Compiler options
 * @param {boolean} [options.capitalizeInStrings=true] - Enable ^3 capitalize modifier inside string literals
 * @returns {{ outputText: string }} Compilation result
 */
export function compile(source, options = {}) {
  const outputText = convertNsjsToJs(source, {
    capitalizeInStrings: options.capitalizeInStrings !== false,
  });
  return { outputText };
}

/**
 * Diagnose NoShift.js source code for syntax errors.
 *
 * @param {string} source - NoShift.js source code
 * @returns {{ line: number, column: number, message: string }[]} Array of diagnostic errors
 */
export function diagnose(source) {
  return _diagnose(source);
}

export default compile;
