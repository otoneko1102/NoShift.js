import { describe, it, expect } from "vitest";
import convert from "../convert.js";

// ======
// 1. シンボルマッピング (Symbol Map)
// ======
describe("convert: Symbol Mapping", () => {
  it("^1 → !", () => {
    expect(convert("^1")).toBe("!");
  });

  it("^2...^2 → double-quoted string", () => {
    expect(convert("^2hello^2")).toBe('"hello"');
  });

  it("^4 → $", () => {
    expect(convert("^4")).toBe("$");
  });

  it("^5 → %", () => {
    expect(convert("^5")).toBe("%");
  });

  it("^6 → &", () => {
    expect(convert("^6")).toBe("&");
  });

  it("^7...^7 → single-quoted string", () => {
    expect(convert("^7hello^7")).toBe("'hello'");
  });

  it("^8 → (", () => {
    expect(convert("^8")).toBe("(");
  });

  it("^9 → )", () => {
    expect(convert("^9")).toBe(")");
  });

  it("^- → =", () => {
    expect(convert("^-")).toBe("=");
  });

  it("^0 → ^ (XOR)", () => {
    expect(convert("^0")).toBe("^");
  });

  it("^^ → ~", () => {
    expect(convert("^^")).toBe("~");
  });

  it("^\\ → |", () => {
    expect(convert("^\\")).toBe("|");
  });

  it("^@ → ` (backtick)", () => {
    // ^@ opens a template literal, needs closing ^@
    expect(convert("^@hello^@")).toBe("`hello`");
  });

  it("^[ → {", () => {
    expect(convert("^[")).toBe("{");
  });

  it("^] → }", () => {
    expect(convert("^]")).toBe("}");
  });

  it("^; → +", () => {
    expect(convert("^;")).toBe("+");
  });

  it("^: → *", () => {
    expect(convert("^:")).toBe("*");
  });

  it("^, → <", () => {
    expect(convert("^,")).toBe("<");
  });

  it("^. → >", () => {
    expect(convert("^.")).toBe(">");
  });

  it("^/ → ?", () => {
    expect(convert("^/")).toBe("?");
  });
});

// ======
// 2. 大文字化モディファイア (^3)
// ======
describe("convert: Capitalize Modifier (^3)", () => {
  it("^3x → X", () => {
    expect(convert("^3x")).toBe("X");
  });

  it("^3a^3b^3c → ABC", () => {
    expect(convert("^3a^3b^3c")).toBe("ABC");
  });

  it("capitalizes inside strings when option is true (default)", () => {
    expect(convert("^2^3hello^2")).toBe('"Hello"');
  });

  it("does NOT capitalize inside strings when capitalizeInStrings is false", () => {
    expect(convert("^2^3hello^2", { capitalizeInStrings: false })).toBe(
      '"^3hello"',
    );
  });

  it("capitalizes in template literals", () => {
    expect(convert("^@^3hello^@")).toBe("`Hello`");
  });

  it("does not capitalize inside comments", () => {
    // ^3 inside a line comment should be output literally
    expect(convert("// ^3hello")).toBe("// ^3hello");
  });
});

// ======
// 3. 文字列リテラル
// ======
describe("convert: String Literals", () => {
  it("double-quoted string ^2...^2", () => {
    expect(convert("^2hello world^2")).toBe('"hello world"');
  });

  it("single-quoted string ^7...^7", () => {
    expect(convert("^7hello^7")).toBe("'hello'");
  });

  it("template literal ^@...^@", () => {
    expect(convert("^@hello^@")).toBe("`hello`");
  });

  it("escape \\^2 inside double-quoted string → literal ^2", () => {
    expect(convert("^2quote: \\^2^2")).toBe('"quote: ^2"');
  });

  it("escape \\^7 inside single-quoted string → literal ^7", () => {
    expect(convert("^7quote: \\^7^7")).toBe("'quote: ^7'");
  });

  it("escape \\^@ inside template literal → literal ^@", () => {
    expect(convert("^@backtick: \\^@^@")).toBe("`backtick: ^@`");
  });
});

// ======
// 4. コメント
// ======
describe("convert: Comments", () => {
  it("line comment // stays as is", () => {
    expect(convert("// this is a comment")).toBe("// this is a comment");
  });

  it("block comment /^: ... ^:/ → /* ... */", () => {
    expect(convert("/^: block comment ^:/")).toBe("/* block comment */");
  });

  it("multi-line block comment", () => {
    const input = "/^:\n  multi-line\n  comment\n^:/";
    const expected = "/*\n  multi-line\n  comment\n*/";
    expect(convert(input)).toBe(expected);
  });

  it("no NoShift conversion inside comments", () => {
    expect(convert("// ^1 ^2 ^3x")).toBe("// ^1 ^2 ^3x");
  });

  it("no conversion inside block comments", () => {
    expect(convert("/^: ^1 ^2 ^3x ^:/")).toBe("/* ^1 ^2 ^3x */");
  });
});

// ======
// 5. テンプレート式展開
// ======
describe("convert: Template Expressions", () => {
  it("^4^[ → ${ and ^] → } inside template", () => {
    expect(convert("^@^4^[name^]^@")).toBe("`${name}`");
  });

  it("template expression with code inside", () => {
    expect(convert("^@hello ^4^[name^]^@")).toBe("`hello ${name}`");
  });

  it("multiple template expressions", () => {
    expect(convert("^@^4^[a^] ^4^[b^]^@")).toBe("`${a} ${b}`");
  });

  it("nested strings inside template expression", () => {
    // ^2...^2 inside ^4^[...^] should be raw JS strings
    expect(convert("^@^4^[^2hello^2^]^@")).toBe('`${"hello"}`');
  });
});

// ======
// 6. README の例
// ======
describe("convert: README Examples", () => {
  it("Hello World", () => {
    expect(convert("console.log^8^2^3hello, ^3world!^2^9;")).toBe(
      'console.log("Hello, World!");',
    );
  });

  it("Capitalize Modifier — class", () => {
    expect(convert("class ^3animal ^[\n^]")).toBe("class Animal {\n}");
  });

  it("Variables & Arrow Functions", () => {
    expect(convert("const add ^- ^8a, b^9 ^-^. a ^; b;")).toBe(
      "const add = (a, b) => a + b;",
    );
  });

  it("Strings — all types", () => {
    expect(convert("const s1 ^- ^2^3hello^2;")).toBe('const s1 = "Hello";');
    expect(convert("const s2 ^- ^7^3world^7;")).toBe("const s2 = 'World';");
    expect(convert("const s3 ^- ^@^4^[s1^] ^4^[s2^]^@;")).toBe(
      "const s3 = `${s1} ${s2}`;",
    );
    expect(convert("const s4 ^- ^2quote: \\^2^2;")).toBe(
      'const s4 = "quote: ^2";',
    );
  });

  it("Objects & Arrays", () => {
    const input =
      "const obj ^- ^[\n  name: ^2^3no^3shift^2,\n  version: 1\n^];";
    const expected = 'const obj = {\n  name: "NoShift",\n  version: 1\n};';
    expect(convert(input)).toBe(expected);
  });

  it("Conditionals — if/else", () => {
    const input =
      "if ^8x ^. 5^9 ^[\n  console.log^8^2big^2^9;\n^] else ^[\n  console.log^8^2small^2^9;\n^]";
    const expected =
      'if (x > 5) {\n  console.log("big");\n} else {\n  console.log("small");\n}';
    expect(convert(input)).toBe(expected);
  });

  it("For loop", () => {
    const input =
      "for ^8let i ^- 0; i ^, 3; i^;^;^9 ^[\n  console.log^8i^9;\n^]";
    const expected = "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}";
    expect(convert(input)).toBe(expected);
  });

  it("Class with constructor and method", () => {
    const input = [
      "class ^3animal ^[",
      "  constructor^8name^9 ^[",
      "    this.name ^- name;",
      "  ^]",
      "",
      "  speak^8^9 ^[",
      "    console.log^8^@^4^[this.name^] speaks.^@^9;",
      "  ^]",
      "^]",
    ].join("\n");
    const expected = [
      "class Animal {",
      "  constructor(name) {",
      "    this.name = name;",
      "  }",
      "",
      "  speak() {",
      "    console.log(`${this.name} speaks.`);",
      "  }",
      "}",
    ].join("\n");
    expect(convert(input)).toBe(expected);
  });
});

// ======
// 7. エッジケース
// ======
describe("convert: Edge Cases", () => {
  it("empty string input", () => {
    expect(convert("")).toBe("");
  });

  it("plain text without any ^ sequences", () => {
    expect(convert("console.log")).toBe("console.log");
  });

  it("multiple symbols in a row", () => {
    expect(convert("^8^9")).toBe("()");
  });

  it("^-^. → => (arrow function)", () => {
    expect(convert("^-^.")).toBe("=>");
  });

  it("^;^; → ++ (increment)", () => {
    expect(convert("^;^;")).toBe("++");
  });

  it("mixed code with comments and strings", () => {
    const input = "const x ^- ^2text^2; // comment\nconst y ^- 1;";
    const expected = 'const x = "text"; // comment\nconst y = 1;';
    expect(convert(input)).toBe(expected);
  });
});
