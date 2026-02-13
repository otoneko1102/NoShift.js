# NoShift.js

> Shift キーを押さずに JavaScript を書ける Joke 言語

[![npm](https://img.shields.io/npm/v/noshift.js)](https://www.npmjs.com/package/noshift.js)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![en](https://img.shields.io/badge/lang-English-blue)](README.md)

---

記号を入力するときに Shift を押すのが面倒なので、Shift を押さずに JavaScript が書けるようにした Joke 言語です。
`^` プレフィックスのシーケンスで Shift が必要な記号を表現し、`.nsjs` ファイルは `nsc` CLI を使って JavaScript にコンパイルされます。

なお、記号の変換基準は作者のノートパソコンのキーボード配列 (JIS 配列) です。

---

## 記号マップ

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

テンプレート式: `^4^[` → `${`

---

## クイックスタート

```bash
npm install -g noshift.js@latest
nsc create
```

---

## サンプル

```nsjs
// src/index.nsjs
const name ^- ^2NoShift.js^2;
console.log^8^2Hello from ^2 ^; name ^; ^2!^2^9;
```

コンパイル後:

```js
const name = "NoShift.js";
console.log("Hello from " + name + "!");
```

---

## リンク

| | |
|---|---|
| **npm** | [noshift.js](https://www.npmjs.com/package/noshift.js) |
| **VS Code** | [NoShift.js — Marketplace](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode) |
| **ウェブサイト** | [noshift.js.org](https://noshift.js.org) |
| **リポジトリ** | [github.com/otoneko1102/NoShift.js](https://github.com/otoneko1102/NoShift.js) |

---

## ライセンス

MIT © otoneko
