[![npm](https://img.shields.io/npm/v/prettier-plugin-noshift.js)](https://www.npmjs.com/package/prettier-plugin-noshift.js) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# prettier-plugin-noshift.js

<div align="center">
  <img src="https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/icon.png" alt="noshift.js" width="128" height="128">
</div>

<div align="center">

**English** | [日本語](./README-ja.md)

</div>

> A [Prettier](https://prettier.io/) plugin for formatting [NoShift.js](https://github.com/otoneko1102/NoShift.js) (`.nsjs`) files.

[Prettier](https://prettier.io/) is an opinionated code formatter. This plugin adds support for `.nsjs` files — the [NoShift.js](https://github.com/otoneko1102/NoShift.js) joke language that lets you write JavaScript without pressing the Shift key.

---

## Install

```bash
npm install --save-dev prettier prettier-plugin-noshift.js
```

---

## Usage

Add the plugin to your `.prettierrc`:

```json
{
  "plugins": ["prettier-plugin-noshift.js"]
}
```

Then format your `.nsjs` files:

```bash
npx prettier --write "**/*.nsjs"
```

> **Tip:** If you scaffold a project with `nsc create`, Prettier and this plugin are automatically installed and configured.

---

## How It Works

The plugin uses a three-stage pipeline:

1. **`.nsjs` → JavaScript** — convert NoShift.js syntax to standard JS
2. **JavaScript → formatted JavaScript** — format with Prettier's built-in babel parser
3. **formatted JavaScript → `.nsjs`** — convert back to NoShift.js syntax

All standard Prettier formatting options are forwarded to stage 2, so your existing config (`semi`, `singleQuote`, `tabWidth`, etc.) just works.

---

## Example

**Before** (`src/index.nsjs`):

```text
const  x  =  1  ;
function greet^8name^9 ^[
  const msg=^2^3hello, ^2^;name;
console.log^8msg^9 ;
  return  msg ;
^]
```

**After** `npx prettier --write`:

```text
const x ^- 1;
function greet^8name^9 ^[
  const msg ^- ^2^3hello, ^2 ^; name;
  console.log^8msg^9;
  return msg;
^]
```

---

## Supported Options

All standard Prettier options are supported. Common ones:

| Option | Default | Description |
|---|---|---|
| `semi` | `true` | Add semicolons at the end of statements |
| `singleQuote` | `false` | Use single quotes instead of double quotes |
| `tabWidth` | `2` | Indentation width |
| `trailingComma` | `"all"` | Trailing commas |
| `printWidth` | `80` | Max line width |
| `bracketSpacing` | `true` | Spaces inside object braces |
| `arrowParens` | `"always"` | Arrow function parentheses |
| `endOfLine` | `"lf"` | Line ending style |

---

## Related

- [noshift.js](https://www.npmjs.com/package/noshift.js) — The NoShift.js compiler CLI
- [NoShift.js VS Code Extension](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode) — Syntax highlighting & snippets
- [Documentation](https://noshift.js.org/)

---

## License

[MIT](./LICENSE) © [otoneko.](https://github.com/otoneko1102)
