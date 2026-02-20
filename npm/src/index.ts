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
import { addHeader } from "./header.js";
import type { DiagnosticError } from "./convert.js";

export type { DiagnosticError } from "./convert.js";
export type { UppercaseWarning } from "./convert.js";

export interface CompileOptions {
  capitalizeInStrings?: boolean;
  noHeader?: boolean;
}

export interface CompileResult {
  outputText: string;
}

/**
 * Compile NoShift.js source code to JavaScript.
 *
 * @param source - NoShift.js source code
 * @param options - Compiler options
 * @returns Compilation result
 */
export function compile(
  source: string,
  options: CompileOptions = {},
): CompileResult {
  let outputText = convertNsjsToJs(source, {
    capitalizeInStrings: options.capitalizeInStrings !== false,
  });
  if (!options.noHeader && outputText.length > 0) {
    outputText = addHeader(outputText);
  }
  return { outputText };
}

/**
 * Diagnose NoShift.js source code for syntax errors.
 *
 * @param source - NoShift.js source code
 * @returns Array of diagnostic errors
 */
export function diagnose(source: string): DiagnosticError[] {
  return _diagnose(source);
}

export default compile;
