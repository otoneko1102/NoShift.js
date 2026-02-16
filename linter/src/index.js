/**
 * @noshift.js/lint Public API (ESM)
 *
 * @example
 * import { lint, createDefaultConfig, getRuleNames } from "@noshift.js/lint";
 *
 * const messages = lint(source);
 * for (const m of messages) {
 *   console.log(`${m.line}:${m.column} [${m.severity}] ${m.message} (${m.rule})`);
 * }
 */

import rules from "./rules.cjs";

export const lint = rules.lint;
export const createDefaultConfig = rules.createDefaultConfig;
export const getDefaultRules = rules.getDefaultRules;
export const getRuleNames = rules.getRuleNames;
export const loadConfigSync = rules.loadConfigSync;
export default rules.lint;
