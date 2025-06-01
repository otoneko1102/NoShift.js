# NoShift.js

## Setup
```bash
npm install -g noshift.js@latest
npx nsjs create
```

## English

### Language
NoShift.js

### Extension
`.nsjs`

### Summary
Typing symbols with Shift is tiring. NoShift.js is a JavaScript-like language that allows you to write JavaScript **without using the Shift key**.  
It compiles to plain JavaScript.

The mapping is based on the keyboard layout of the creator’s laptop.

## 日本語
### 言語名
NoShift.js

### 張子
.nsjs

### 概略
記号を入力するときに Shift を押すのが面倒なので、Shift を押さずに JavaScript が書ける言語を作りました。
NoShift.js は JavaScript に変換されます。

この記号変換の基準は、作者のノートパソコンのキーボード配列です。

```
! --> ^1
" --> ^2
$ --> ^4
% --> ^5
& --> ^6
' --> ^7
( --> ^8
) --> ^9
= --> ^-
~ --> ^^
| --> ^\
` --> ^@
{ --> ^[
} --> ^]
+ --> ^;
* --> ^:
< --> ^,
> --> ^.
? --> ^/
```

### Escaping in strings
Examples:
```nsjs
^2^5^2 --> "^5"
^7^5^7 --> '^5'
^@^5^@ --> `^5`
```
Template literals (${} syntax)

```nsjs
^@^5^4^[^2Hello World!^2^]^@ --> `^5${"Hello World!"}`
```
Hello World!
Example:

```nsjs
console.log^8^2Hello World!^2^9;
Result:
```
```js
console.log("Hello World!");
```
