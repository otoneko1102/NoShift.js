[![npm](https://img.shields.io/npm/v/noshift.js)](https://www.npmjs.com/package/noshift.js) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# NoShift.js

<div align="center">
  <img src="./icon.png" alt="NoShift.js" width="128" height="128">
</div>

<div align="center">

**English** | [日本語](./README-ja.md)

</div>

> A joke language that lets you write JavaScript without pressing the Shift key.

---

Typing shifted symbols (`!`, `"`, `(`, `)`, `{`, `}` …) is tiring.  
**NoShift.js** replaces every shift-required symbol with a `^`-prefixed sequence, so you can write JavaScript using only unshifted keys.  
`.nsjs` files compile directly to plain JavaScript via the `nsc` CLI.

---

## Symbol Map

> This symbol mapping is based on the NoShift.js developer's keyboard (JIS layout).

![Developer's Keyboard](https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/my-keyboard.jpg)

| NoShift | JS | | NoShift | JS |
|:-------:|:--:|---|:-------:|:--:|
| `^1`    | `!`        | | `^^`    | `~`        |
| `^2`    | `"`        | | `^\`    | `\|`       |
| `^3x`   | `X` (capitalize) | | `^@`    | `` ` ``    |
| `^4`    | `$`        | | `^[`    | `{`        |
| `^5`    | `%`        | | `^]`    | `}`        |
| `^6`    | `&`        | | `^;`    | `+`        |
| `^7`    | `'`        | | `^:`    | `*`        |
| `^8`    | `(`        | | `^,`    | `<`        |
| `^9`    | `)`        | | `^.`    | `>`        |
| `^-`    | `=`        | | `^/`    | `?`        |
| `^0`    | `^` (XOR)  | | | |

Template expression: `^4^[` → `${`

---

## Quick Start

```bash
npm install -g noshift.js@latest
nsc create
```

---

## Example

```nsjs
// src/index.nsjs
const name ^- ^2^3no^3shift.js^2;
console.log^8^2^3hello from ^2 ^; name ^; ^2!^2^9;
```

Compiles to:

```js
const name = "NoShift.js";
console.log("Hello from " + name + "!");
```

---

## Links

| | |
|---|---|
| **npm** | [noshift.js](https://www.npmjs.com/package/noshift.js) |
| **VS Code** | [NoShift.js - Marketplace](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode) |
| **Website** | [noshift.js.org](https://noshift.js.org) |
| **Repository** | [github.com/otoneko1102/NoShift.js](https://github.com/otoneko1102/NoShift.js) |

---

## License

MIT © otoneko.
