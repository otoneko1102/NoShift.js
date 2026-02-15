# NoShift.js - VS Code Extension

> Syntax highlighting, auto-complete, and file icons for `.nsjs` files

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![ja](https://img.shields.io/badge/lang-日本語_バージョン-red)](README-ja.md)

---

## Features

### Syntax Highlighting

Full syntax highlighting for `.nsjs` files.

- **Keywords**: `const`, `let`, `function`, `class`, `if`, `for`, `return`, etc.
- **NoShift sequences**: `^2`, `^[`, `^-` and other symbol sequences colored as operators/punctuation
- **String literals**: `^2...^2` (double-quote), `^7...^7` (single-quote), `^@...^@` (template literal)
- **Template expressions**: Code inside `^4^[...^]` highlighted as nested expressions
- **Built-in objects**: `console`, `Math`, `Promise`, `Array`, etc.
- **Comments**: `//` line comments and `/* */` block comments

### File Icon

`.nsjs` files display a dedicated file icon (`↓js`).

- Shown in tabs and Explorer for VS Code 1.79+
- **When [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) is installed**: `.nsjs` and `nsjsconfig.json` icon associations are configured automatically on activation

### Auto-Complete

Typing `^[` automatically inserts the matching `^]` and places the cursor between them.

```
Input:  ^[
Result: ^[|^]   (| = cursor position)
```

### Code Snippets

| Prefix | Inserted |
|--------|----------|
| `^[`   | `^[${1}^]` |

---

## Requirements

- VS Code `1.70.0` or later
- (Optional) [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) - integrates file icons with the vscode-icons theme

---

## Language Support

> This symbol mapping is based on the NoShift.js developer's keyboard (JIS layout).

![Developer's Keyboard](https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/my-keyboard.jpg)

| Feature | Details |
|---|---|
| Extension | `.nsjs` |
| Language ID | `noshift` |
| Line comment | `//` |
| Block comment | `/* */` |
| Bracket pairs | `^[` / `^]`, `^8` / `^9`, `[` / `]` |
| Auto-close | `^2`, `^7`, `^@`, `^[`, `^8` |

---

## Related

- [noshift.js (npm)](https://www.npmjs.com/package/noshift.js) - Compiler CLI (`nsc`)
- [Website](https://noshift.js.org)
- [Repository](https://github.com/otoneko1102/NoShift.js)

---

## License

MIT © otoneko.
