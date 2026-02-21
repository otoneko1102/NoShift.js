[![npm](https://img.shields.io/npm/v/prettier-plugin-noshift.js)](https://www.npmjs.com/package/prettier-plugin-noshift.js) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# prettier-plugin-noshift.js

<div align="center">
  <img src="https://raw.githubusercontent.com/otoneko1102/NoShift.js/refs/heads/main/icon.png" alt="noshift.js" width="128" height="128">
</div>

<div align="center">

[English](./README.md) | **日本語**

</div>

> [NoShift.js](https://github.com/otoneko1102/NoShift.js) (`.nsjs`) ファイルをフォーマットする [Prettier](https://prettier.io/) プラグイン

[Prettier](https://prettier.io/) はコードフォーマッターです。このプラグインは、Shift キーを押さずに JavaScript を書ける Joke 言語 [NoShift.js](https://github.com/otoneko1102/NoShift.js) の `.nsjs` ファイルに対応します。

---

## インストール

```bash
npm install --save-dev prettier prettier-plugin-noshift.js
```

---

## 使い方

`.prettierrc` にプラグインを追加します:

```json
{
  "plugins": ["prettier-plugin-noshift.js"]
}
```

`.nsjs` ファイルをフォーマット:

```bash
npx prettier --write "**/*.nsjs"
```

> **ヒント:** `nsc create` でプロジェクトを作成すると、Prettier とこのプラグインが自動的にインストール・設定されます。

---

## 仕組み

プラグインは3段階のパイプラインでフォーマットします:

1. **`.nsjs` → JavaScript** — NoShift.js 構文を JavaScript に変換
2. **JavaScript → フォーマット済み JavaScript** — Prettier の組み込み babel パーサーでフォーマット
3. **フォーマット済み JavaScript → `.nsjs`** — NoShift.js 構文に逆変換

標準の Prettier オプションはすべてステージ 2 に転送されるため、既存の設定（`semi`、`singleQuote`、`tabWidth` など）がそのまま適用されます。

---

## 例

**フォーマット前** (`src/index.nsjs`):

```text
const  x  =  1  ;
function greet^8name^9 ^[
  const msg=^2^3hello, ^2^;name;
console.log^8msg^9 ;
  return  msg ;
^]
```

**フォーマット後** `npx prettier --write`:

```text
const x ^- 1;
function greet^8name^9 ^[
  const msg ^- ^2^3hello, ^2 ^; name;
  console.log^8msg^9;
  return msg;
^]
```

---

## 対応オプション

すべての標準 Prettier オプションがサポートされています。主なもの:

| オプション | デフォルト | 説明 |
|---|---|---|
| `semi` | `true` | 文末にセミコロンを付ける |
| `singleQuote` | `false` | シングルクォートを使う |
| `tabWidth` | `2` | インデント幅 |
| `trailingComma` | `"all"` | 末尾カンマ |
| `printWidth` | `80` | 1行の最大文字数 |
| `bracketSpacing` | `true` | オブジェクト括弧内のスペース |
| `arrowParens` | `"always"` | アロー関数の括弧 |
| `endOfLine` | `"lf"` | 改行スタイル |

---

## 関連リンク / エコシステム

- [noshift.js (npm)](https://www.npmjs.com/package/noshift.js) — コアコンパイラ CLI
- [@noshift.js/lint (npm)](https://www.npmjs.com/package/@noshift.js/lint) — 公式リンター
- [prettier-plugin-noshift.js (npm)](https://www.npmjs.com/package/prettier-plugin-noshift.js) — 公式 Prettier プラグイン
- [VS Code 拡張機能](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode) — エディタサポート（シンタックスハイライト、スニペット等）
- [ウェブサイト・プレイグラウンド](https://noshift.js.org)
- [リポジトリ](https://github.com/otoneko1102/NoShift.js)

---

## ライセンス

[MIT](./LICENSE) © [otoneko.](https://github.com/otoneko1102)
