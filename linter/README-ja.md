[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# @noshift.js/lint

<div align="center">

[English](./README.md) | **日本語**

</div>

> NoShift.js (.nsjs) ファイル用リンター

---

## インストール

```bash
npm install -D @noshift.js/lint
```

グローバルインストール:

```bash
npm install -g @noshift.js/lint
```

---

## CLI の使い方

```bash
# rootdir 内のすべての .nsjs ファイルを lint (nsjsconfig.json を参照)
nslint

# 特定のファイルを lint
nslint src/index.nsjs src/utils.nsjs

# デフォルトルールで nsjslinter.json を作成
nslint init
```

| コマンド | エイリアス | 説明 |
|---|---|---|
| `nslint` | | rootdir 内のすべての `.nsjs` ファイルを lint |
| `nslint <file> [file...]` | | 特定のファイルを lint |
| `nslint init` | `nslint create` | デフォルト設定で `nsjslinter.json` を作成 |
| `nslint version` | `nslint -v` | バージョンを表示 |
| `nslint help` | `nslint -h` | ヘルプを表示 |

---

## 設定

プロジェクトルートに `nsjslinter.json` を作成します（または `nslint init` を実行）:

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

各ルールは `"error"`、`"warning"`、`"off"` のいずれかに設定できます。

---

## ルール一覧

| ルール | デフォルト | 説明 |
|---|---|---|
| `unclosed-string` | error | 閉じられていない文字列リテラル (`^2`, `^7`, `^@`) |
| `unclosed-comment` | error | 閉じられていないブロックコメント (`/^:...^:/`) |
| `unclosed-template-expr` | error | 閉じられていないテンプレート式 (`^4^[...^]`) |
| `unknown-caret-sequence` | error | 不明な `^X` シーケンス |
| `lone-caret` | error | ファイル末尾の孤立した `^` |
| `capitalize-eof` | error | 大文字化する文字がないファイル末尾の `^3` |
| `uppercase-in-code` | warning | コード内の大文字（`^3` を使用してください） |
| `trailing-whitespace` | off | 行末の空白 |
| `no-consecutive-blank-lines` | off | 連続する空行 |

---

## プログラマティック API

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

### API リファレンス

| 関数 | 説明 |
|---|---|
| `lint(source, config?)` | ソースコードを lint する。`{ line, column, message, severity, rule }[]` を返す |
| `createDefaultConfig()` | デフォルトの `nsjslinter.json` 設定オブジェクトを返す |
| `getDefaultRules()` | デフォルトのルールマップを返す |
| `getRuleNames()` | すべてのルール名の配列を返す |
| `loadConfigSync(path)` | `nsjslinter.json` ファイルを読み込んでパースする |

---

## リンク

- [noshift.js (npm)](https://www.npmjs.com/package/noshift.js) — コンパイラ CLI
- [VS Code 拡張機能](https://marketplace.visualstudio.com/items?itemName=otoneko1102.noshift-vscode)
- [ウェブサイト](https://noshift.js.org)
- [リポジトリ](https://github.com/otoneko1102/NoShift.js)

---

## ライセンス

MIT © otoneko.
