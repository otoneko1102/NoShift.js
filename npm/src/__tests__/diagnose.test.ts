import { describe, it, expect } from "vitest";
import { diagnose } from "../convert.js";

describe("diagnose: Valid Code", () => {
  it("returns empty array for valid code", () => {
    expect(diagnose("const x ^- 1;")).toEqual([]);
  });

  it("returns empty for valid string literals", () => {
    expect(diagnose("^2hello^2")).toEqual([]);
  });

  it("returns empty for valid comments", () => {
    expect(diagnose("// comment")).toEqual([]);
    expect(diagnose("/^: block ^:/")).toEqual([]);
  });

  it("returns empty for valid template literal", () => {
    expect(diagnose("^@hello ^4^[name^]^@")).toEqual([]);
  });

  it("returns empty for capitalization modifier", () => {
    expect(diagnose("^3x")).toEqual([]);
  });

  it("returns empty for all valid symbols", () => {
    const input = "^0 ^1 ^4 ^5 ^6 ^8 ^9 ^- ^^ ^\\ ^[ ^] ^; ^: ^, ^. ^/";
    expect(diagnose(input)).toEqual([]);
  });
});

describe("diagnose: Unclosed Strings", () => {
  it("detects unclosed double-quoted string", () => {
    const errors = diagnose("^2hello");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Unclosed"))).toBe(true);
  });

  it("detects unclosed single-quoted string", () => {
    const errors = diagnose("^7hello");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Unclosed"))).toBe(true);
  });

  it("detects unclosed template literal", () => {
    const errors = diagnose("^@hello");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Unclosed"))).toBe(true);
  });
});

describe("diagnose: Unclosed Comments", () => {
  it("detects unclosed block comment", () => {
    const errors = diagnose("/^: this is not closed");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Unclosed"))).toBe(true);
  });
});

describe("diagnose: Unclosed Template Expressions", () => {
  it("detects unclosed template expression", () => {
    const errors = diagnose("^@^4^[name^@");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Unclosed"))).toBe(true);
  });
});

describe("diagnose: Unknown Sequences", () => {
  it("detects unknown caret sequence", () => {
    const errors = diagnose("^x");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Unknown sequence"))).toBe(
      true,
    );
  });

  it("^3 is valid (capitalize modifier)", () => {
    expect(diagnose("^3a")).toEqual([]);
  });
});

describe("diagnose: Edge Cases", () => {
  it("lone ^ at end of file", () => {
    const errors = diagnose("hello ^");
    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.some((e) => e.message.includes("Lone") || e.message.includes("^")),
    ).toBe(true);
  });

  it("^3 at end of file (no character to capitalize)", () => {
    const errors = diagnose("^3");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("^3"))).toBe(true);
  });

  it("empty input returns no errors", () => {
    expect(diagnose("")).toEqual([]);
  });

  it("escaped sequences are NOT flagged", () => {
    // \\^2 inside a string should not trigger unclosed string
    expect(diagnose("^2\\^2 hello^2")).toEqual([]);
  });

  it("error includes line and column", () => {
    const errors = diagnose("^2hello");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].line).toBeGreaterThan(0);
    expect(errors[0].column).toBeGreaterThan(0);
  });
});
