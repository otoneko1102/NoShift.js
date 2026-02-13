# noshift.js

> A joke language that lets you write JavaScript without pressing the Shift key.

[![npm](https://img.shields.io/npm/v/noshift.js)](https://www.npmjs.com/package/noshift.js)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![ja](https://img.shields.io/badge/lang-日本語_バージョン-red)](README-ja.md)

---

## Installation

```bash
npm install -g noshift.js@latest
```

---

## Getting Started

```bash
# Interactive full project scaffold
nsc create

# Or initialize only a nsjsconfig.json in the current directory
nsc --init
```

---

## CLI Reference

`nsc` is designed to feel like TypeScript's `tsc`.

| Command | Description |
|---|---|
| `nsc` | Compile `.nsjs` → `.js` using `nsjsconfig.json` |
| `nsc -w` / `nsc --watch` | Watch for changes and recompile automatically |
| `nsc --init` | Create `nsjsconfig.json` in the current directory |
| `nsc --clean` | Delete the output directory (`outDir`) |
| `nsc run <file>` | Run a `.nsjs` file directly |
| `nsc create [name]` | Scaffold a new project interactively |
| `nsc -V` | Show version |
| `nsc -h` | Show help |

---

## nsjsconfig.json

Place a `nsjsconfig.json` at the project root to configure compilation.
Generated automatically by `nsc --init` or `nsc create`.

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build"
  }
}
```

| Option | Default | Description |
|---|---|---|
| `compilerOptions.rootDir` | `"src"` | Source directory |
| `compilerOptions.outDir` | `"build"` | Output directory |

---

## Symbol Map

| NoShift | JS | | NoShift | JS |
|:-------:|:--:|---|:-------:|:--:|
| `^1`    | `!`        | | `^^`    | `~`        |
| `^2`    | `"`        | | `^\`    | `\|`       |
| `^4`    | `$`        | | `^@`    | `` ` ``    |
| `^5`    | `%`        | | `^[`    | `{`        |
| `^6`    | `&`        | | `^]`    | `}`        |
| `^7`    | `'`        | | `^;`    | `+`        |
| `^8`    | `(`        | | `^:`    | `*`        |
| `^9`    | `)`        | | `^,`    | `<`        |
| `^-`    | `=`        | | `^.`    | `>`        |
|         |            | | `^/`    | `?`        |

Template expression: `^4^[` → `${`

---

## Syntax Examples

### Hello World

```nsjs
console.log^8^2Hello, World!^2^9;
```

```js
console.log("Hello, World!");
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
const s1 ^- ^2Hello^2;

// Single-quote string
const s2 ^- ^7World^7;

// Template literal
const s3 ^- ^@^4^[s1^] ^4^[s2^]^@;

// Escape: \^2 inside ^2...^2 yields a literal ^2 in the output
const s4 ^- ^2quote: \^2^2;
```

```js
const s1 = "Hello";
const s2 = 'World';
const s3 = `Hello World`;
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
class Animal ^[
  constructor^8name^9 ^[
    this.name ^- name;
  ^]

  speak^8^9 ^[
    console.log^8^@^4^[this.name^] speaks.^@^9;
  ^]
^]

const dog ^- new Animal^8^2Dog^2^9;
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
