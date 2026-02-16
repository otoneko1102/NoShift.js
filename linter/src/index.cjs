/**
 * @noshift.js/lint Public API (CJS)
 *
 * @example
 * const { lint, createDefaultConfig, getRuleNames } = require("@noshift.js/lint");
 *
 * const messages = lint(source);
 * for (const m of messages) {
 *   console.log(`${m.line}:${m.column} [${m.severity}] ${m.message} (${m.rule})`);
 * }
 */

"use strict";

const { lint, createDefaultConfig, getDefaultRules, getRuleNames, loadConfigSync } = require("./rules.cjs");

module.exports = { lint, createDefaultConfig, getDefaultRules, getRuleNames, loadConfigSync };
