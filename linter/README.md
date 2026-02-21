[![npm](https://img.shields.io/npm/v/@noshift.js/lint)](https://www.npmjs.com/package/@noshift.js/lint) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# @noshift.js/lint

<div align="center">
  <img src="https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/icon.png" alt="noshift.js" width="128" height="128">
</div>

<div align="center">

**English** | [日本語](./README-ja.md)

</div>

> A linter for NoShift.js (.nsjs) files

---

## Installation

```bash
npm install -D @noshift.js/lint
```

Or globally:

```bash
npm install -g @noshift.js/lint
```

---

## CLI Usage

```bash
# Lint all .nsjs files in rootdir (reads nsjsconfig.json)
nslint

# Lint specific files
nslint src/index.nsjs src/utils.nsjs

# Create nsjslinter.json with default rules
nslint init
```

| Command | Alias | Description |
|---|---|---|
| `nslint` | | Lint all `.nsjs` files in rootdir |
| `nslint <file> [file...]` | | Lint specific files |
| `nslint init` | `nslint create` | Create `nsjslinter.json` with defaults |
| `nslint version` | `nslint -v` | Show version |
| `nslint help` | `nslint -h` | Show help |

---

## Configuration

Create a `nsjslinter.json` at the project root (or run `nslint init`):

```json
{
  "rules": {
    "unclosed-string": "error",
    "unclosed-comment": "error",
    "unclosed-template-expr": "error",
    "unknown-caret-sequence": "error",
    "lone-caret": "error",
    "capitalize-eof": "error",
    "uppercase-in-code": "warning",
    "trailing-whitespace": "off",
    "no-consecutive-blank-lines": "off"
  }
}
```

Each rule can be set to `"error"`, `"warning"`, or `"off"`.

---

## Rules

| Rule | Default | Description |
|---|---|---|
| `unclosed-string` | error | Unclosed string literal (`^2`, `^7`, `^@`) |
| `unclosed-comment` | error | Unclosed block comment (`/^:...^:/`) |
| `unclosed-template-expr` | error | Unclosed template expression (`^4^[...^]`) |
| `unknown-caret-sequence` | error | Unknown `^X` sequence |
| `lone-caret` | error | Lone `^` at end of file |
| `capitalize-eof` | error | `^3` at end of file with no character to capitalize |
| `uppercase-in-code` | warning | Uppercase letter in code (use `^3` instead) |
| `trailing-whitespace` | off | Trailing whitespace at end of line |
| `no-consecutive-blank-lines` | off | Consecutive blank lines |

---

## Programmatic API

### ESM

```js
import { lint, createDefaultConfig, getRuleNames } from "@noshift.js/lint";

const messages = lint(source);
for (const m of messages) {
  console.log(`${m.line}:${m.column} [${m.severity}] ${m.message} (${m.rule})`);
}
```

### CJS

```js
const { lint, createDefaultConfig, getRuleNames } = require("@noshift.js/lint");

const messages = lint(source);
for (const m of messages) {
  console.log(`${m.line}:${m.column} [${m.severity}] ${m.message} (${m.rule})`);
}
```

### API Reference

| Function | Description |
|---|---|
| `lint(source, config?)` | Lint source code. Returns `{ line, column, message, severity, rule }[]` |
| `createDefaultConfig()` | Returns a default `nsjslinter.json` config object |
| `getDefaultRules()` | Returns the default rules map |
| `getRuleNames()` | Returns an array of all rule names |
| `loadConfigSync(path)` | Load and parse a `nsjslinter.json` file |

---

## Ecosystem / Links

- [noshift.js (npm)](https://www.npmjs.com/package/noshift.js) — The Core Compiler CLI
- [@noshift.js/lint (npm)](https://www.npmjs.com/package/@noshift.js/lint) — The Official Linter
- [prettier-plugin-noshift.js (npm)](https://www.npmjs.com/package/prettier-plugin-noshift.js) — The Official Prettier Plugin
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode) — Editor Support (Syntax Highlighting, Snippets)
- [Website & Playground](https://noshift.js.org)
- [Repository](https://github.com/otoneko1102/NoShift.js)

---

## License

MIT © otoneko.
