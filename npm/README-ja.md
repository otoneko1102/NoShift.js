# noshift.js

> Shift キーを押さずに JavaScript を書ける Joke 言語

[![npm](https://img.shields.io/npm/v/noshift.js)](https://www.npmjs.com/package/noshift.js)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![en](https://img.shields.io/badge/lang-English_version-blue)](README.md)

---

## インストール

```bash
npm install -g noshift.js@latest
```

---

## はじめに

```bash
# インタラクティブなプロジェクトスキャフォールド
nsc create

# または、現在のディレクトリに nsjsconfig.json だけを作成
nsc --init
```

---

## CLI リファレンス

`nsc` は TypeScript の `tsc` に似た使い心地を目指しています。

| コマンド | 説明 |
|---|---|
| `nsc` | `nsjsconfig.json` を使って `.nsjs` → `.js` にコンパイル |
| `nsc -w` / `nsc --watch` | 変更を監視して自動的に再コンパイル |
| `nsc --init` | 現在のディレクトリに `nsjsconfig.json` を作成 |
| `nsc --clean` | 出力ディレクトリ (`outDir`) を削除 |
| `nsc run <file>` | `.nsjs` ファイルを直接実行 |
| `nsc create [name]` | インタラクティブに新しいプロジェクトを作成 |
| `nsc -V` | バージョンを表示 |
| `nsc -h` | ヘルプを表示 |

---

## nsjsconfig.json

プロジェクトルートに `nsjsconfig.json` を置くとコンパイル設定を行えます。
`nsc --init` または `nsc create` で自動生成されます。

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build"
  }
}
```

| オプション | デフォルト | 説明 |
|---|---|---|
| `compilerOptions.rootDir` | `"src"` | ソースディレクトリ |
| `compilerOptions.outDir` | `"build"` | 出力ディレクトリ |

---

## 記号マップ

> この変換表は NoShift.js 開発者のキーボード（JIS 配列）が基準です。

![開発者のキーボード](https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/my-keyboard.jpg)

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

## 構文サンプル

### Hello World

```nsjs
console.log^8^2Hello, World!^2^9;
```

```js
console.log("Hello, World!");
```

### 変数とアロー関数

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

### 文字列

```nsjs
// ダブルクォート文字列
const s1 ^- ^2Hello^2;

// シングルクォート文字列
const s2 ^- ^7World^7;

// テンプレートリテラル
const s3 ^- ^@^4^[s1^] ^4^[s2^]^@;

// エスケープ: ^2...^2 内の \^2 はリテラルの ^2 に展開される
const s4 ^- ^2quote: \^2^2;
```

```js
const s1 = "Hello";
const s2 = 'World';
const s3 = `Hello World`;
const s4 = "quote: ^2";
```

### オブジェクトと配列

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

### クラス

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

### 条件分岐とループ

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

## ファイル名の規則

`_` で始まるファイルはコンパイル対象から除外されます（パーシャル・ユーティリティ用途に便利）。

```
src/
  index.nsjs       ← コンパイルされる
  _helpers.nsjs    ← スキップされる
```

---

## リンク

- [VS Code 拡張機能](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode)
- [ウェブサイト](https://noshift.js.org)
- [リポジトリ](https://github.com/otoneko1102/NoShift.js)

---

## ライセンス

MIT © otoneko.
