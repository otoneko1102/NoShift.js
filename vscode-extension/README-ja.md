# NoShift.js — VS Code 拡張機能

> `.nsjs` ファイルの構文ハイライト・補完・アイコン対応 VS Code 拡張機能

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![en](https://img.shields.io/badge/lang-English_version-blue)](README.md)

---

## 機能

### 構文ハイライト

`.nsjs` ファイルに完全な構文ハイライトを提供します。

- **キーワード**: `const`, `let`, `function`, `class`, `if`, `for`, `return` など
- **NoShift シーケンス**: `^2`, `^[`, `^-` などの記号シーケンスを演算子・区切り文字として着色
- **文字列リテラル**: `^2...^2` (ダブルクォート)、`^7...^7` (シングルクォート)、`^@...^@` (テンプレートリテラル)
- **テンプレート式**: `^4^[...^]` 内をネストされたコードとして着色
- **組み込みオブジェクト**: `console`, `Math`, `Promise`, `Array` など
- **コメント**: `//` 行コメント・`/* */` ブロックコメント

### ファイルアイコン

`.nsjs` ファイルには専用のファイルアイコン (`↓js`) が表示されます。

- VS Code 1.79 以降でタブ・エクスプローラーに表示
- **[vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) インストール時**: 起動時に自動で `.nsjs` および `nsjsconfig.json` のアイコン関連付けを設定

### 自動補完

`^[` を入力すると対応する `^]` が自動挿入され、カーソルは `^[` と `^]` の間に移動します。

```
入力: ^[
結果: ^[|^]   (| = カーソル位置)
```

### コードスニペット

| プレフィックス | 挿入内容 |
|--------|----------|
| `^[`   | `^[${1}^]` |

---

## 必要環境

- VS Code `1.70.0` 以上
- （任意）[vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) — ファイルアイコンを vscode-icons テーマと統合

---

## 言語サポート

| 機能 | 詳細 |
|---|---|
| 拡張子 | `.nsjs` |
| 言語 ID | `noshift` |
| 行コメント | `//` |
| ブロックコメント | `/* */` |
| ブラケットペア | `^[` / `^]`, `^8` / `^9`, `[` / `]` |
| 自動クローズ | `^2`, `^7`, `^@`, `^[`, `^8` |

---

## 関連リンク

- [noshift.js (npm)](https://www.npmjs.com/package/noshift.js) — コンパイラ CLI (`nsc`)
- [ウェブサイト](https://noshift.js.org)
- [リポジトリ](https://github.com/otoneko1102/NoShift.js)

---

## ライセンス

MIT © otoneko.
