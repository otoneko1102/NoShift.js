[![npm](https://img.shields.io/npm/v/noshift.js)](https://www.npmjs.com/package/noshift.js) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# NoShift.js

<div align="center">
  <img src="https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/icon.png" alt="noshift.js" width="128" height="128">
</div>

<div align="center">

**English** | [日本語](./README-ja.md)

</div>

> A joke language that lets you write JavaScript without pressing the Shift key.

Typing shifted symbols (`!`, `"`, `(`, `)`, `{`, `}` …) is tiring.  
**NoShift.js** replaces every shift-required symbol with a `^`-prefixed sequence, so you can write JavaScript using only unshifted keys.  
`.nsjs` files compile directly to plain JavaScript via the `nsc` CLI.

---

## Installation

### Global Install

```bash
npm install -g noshift.js@latest
```

### Local Install

```bash
npm install -D noshift.js@latest
```

---

## Getting Started

```bash
# Create a new project

# Global
nsc create my-project

# Local
npx nsc create my-project

# Or initialize only a nsjsconfig.json in the current directory

# Global
nsc init

# Local
npx nsc init
```

---

## CLI Reference

`nsc` is designed to feel like TypeScript's `tsc`.

| Command | Alias | Description |
|---|---|---|
| `nsc` / `npx nsc` | | Compile `.nsjs` → `.js` using `nsjsconfig.json` |
| `nsc watch` / `npx nsc watch` | `nsc -w` `nsc --watch` | Watch for changes and recompile automatically |
| `nsc init` / `npx nsc init` | `nsc --init` | Create `nsjsconfig.json` in the current directory |
| `nsc clean` / `npx nsc clean` | `nsc --clean` | Delete the output directory (`outdir`) |
| `nsc run <file>` / `npx nsc run <file>` | `nsc -r <file>` `nsc --run <file>` | Run a `.nsjs` file directly |
| `nsc create [name]` / `npx nsc create [name]` | `nsc --create [name]` | Scaffold a new project (`--no-prettier` to skip Prettier) |
| `nsc version` / `npx nsc version` | `nsc -v` `nsc --version` | Show version |
| `nsc help` / `npx nsc help` | `nsc -h` `nsc --help` | Show help |

---

## nsjsconfig.json

Place a `nsjsconfig.json` at the project root to configure compilation.
Generated automatically by `nsc init` or `nsc create`.

```json
{
  "compileroptions": {
    "rootdir": "src",
    "outdir": "dist",
    "warnuppercase": true,
    "capitalizeinstrings": true
  }
}
```

| Option | Default | Description |
|---|---|---|
| `compileroptions.rootdir` | `"src"` | Source directory |
| `compileroptions.outdir` | `"dist"` | Output directory |
| `compileroptions.warnuppercase` | `true` | Warn about uppercase characters in source code |
| `compileroptions.capitalizeinstrings` | `true` | Enable `^3` capitalize modifier inside string literals |

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

## Syntax Examples

### Hello World

```nsjs
console.log^8^2^3hello, ^3world!^2^9;
```

```js
console.log("Hello, World!");
```

### Capitalize Modifier

`^3` capitalizes the next character:

```nsjs
class ^3animal ^[
^]
```

```js
class Animal {
}
```

### Comments

```nsjs
// line comment

/^: block comment ^:/

/^:
  multi-line
  block comment
^:/
```

```js
// line comment

/* block comment */

/*
  multi-line
  block comment
*/
```

### Variables & Arrow Functions

```nsjs
const add ^- ^8a, b^9 ^-^. a ^; b;

const result ^- add^85, 3^9;
console.log^8result^9; // 8
```

```js
const add = (a, b) => a + b;

const result = add(5, 3);
console.log(result); // 8
```

### Strings

```nsjs
// Double-quote string
const s1 ^- ^2^3hello^2;

// Single-quote string
const s2 ^- ^7^3world^7;

// Template literal
const s3 ^- ^@^4^[s1^] ^4^[s2^]^@;

// Escape: \^2 inside ^2...^2 yields a literal ^2 in the output
const s4 ^- ^2quote: \^2^2;
```

```js
const s1 = "Hello";
const s2 = 'World';
const s3 = `${s1} ${s2}`;
const s4 = "quote: ^2";
```

### Objects & Arrays

```nsjs
const obj ^- ^[
  name: ^2NoShift^2,
  version: 1,
  isJoke: true
^];

const arr ^- [1, 2, 3];
```

```js
const obj = {
  name: "NoShift",
  version: 1,
  isJoke: true
};

const arr = [1, 2, 3];
```

### Classes

```nsjs
class ^3animal ^[
  constructor^8name^9 ^[
    this.name ^- name;
  ^]

  speak^8^9 ^[
    console.log^8^@^4^[this.name^] speaks.^@^9;
  ^]
^]

const dog ^- new ^3animal^8^2^3dog^2^9;
dog.speak^8^9;
```

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} speaks.`);
  }
}

const dog = new Animal("Dog");
dog.speak();
```

### Conditionals & Loops

```nsjs
const x ^- 10;

if ^8x ^. 5^9 ^[
  console.log^8^2big^2^9;
^] else ^[
  console.log^8^2small^2^9;
^]

for ^8let i ^- 0; i ^, 3; i^;^;^9 ^[
  console.log^8i^9;
^]
```

```js
const x = 10;

if (x > 5) {
  console.log("big");
} else {
  console.log("small");
}

for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

---

## File Naming

Files starting with `_` are excluded from compilation (useful for partials/utilities).

```
src/
  index.nsjs       ← compiled
  _helpers.nsjs    ← skipped
```

---

## Links

- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode)
- [Website](https://noshift.js.org)
- [Repository](https://github.com/otoneko1102/NoShift.js)

---

## License

MIT © otoneko.
