import { describe, it, expect } from "vitest";
import { checkUppercaseWarnings } from "../convert.js";

describe("checkUppercaseWarnings", () => {
  it("warns about uppercase letters in code", () => {
    const warnings = checkUppercaseWarnings("const X = 1;");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.char === "X")).toBe(true);
  });

  it("does not warn about ^3 capitalized characters", () => {
    // ^3x is an intentional capitalization, should not warn
    const warnings = checkUppercaseWarnings("^3x");
    expect(
      warnings.filter((w) => w.char === "X" || w.char === "x"),
    ).toHaveLength(0);
  });

  it("warns about symbols that need shift", () => {
    const warnings = checkUppercaseWarnings("!");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.char === "!")).toBe(true);
  });

  it("does not warn inside line comments", () => {
    const warnings = checkUppercaseWarnings("// Hello World");
    expect(warnings.filter((w) => w.char === "H" || w.char === "W")).toHaveLength(0);
  });

  it("does not warn inside block comments", () => {
    const warnings = checkUppercaseWarnings("/^: Hello ^:/");
    expect(warnings.filter((w) => w.char === "H")).toHaveLength(0);
  });

  it("warns about uppercase in strings when capitalizeInStrings is true", () => {
    const warnings = checkUppercaseWarnings("^2Hello^2", {
      capitalizeInStrings: true,
    });
    expect(warnings.some((w) => w.char === "H")).toBe(true);
  });

  it("does not warn about uppercase in strings when capitalizeInStrings is false", () => {
    const warnings = checkUppercaseWarnings("^2Hello^2", {
      capitalizeInStrings: false,
    });
    expect(warnings.filter((w) => w.char === "H")).toHaveLength(0);
  });

  it("warns about underscores", () => {
    const warnings = checkUppercaseWarnings("my_var");
    expect(warnings.some((w) => w.char === "_")).toBe(true);
  });

  it("warns about hash #", () => {
    const warnings = checkUppercaseWarnings("#field");
    expect(warnings.some((w) => w.char === "#")).toBe(true);
  });

  it("returns empty for clean code", () => {
    const warnings = checkUppercaseWarnings("const x ^- 1;");
    expect(warnings).toHaveLength(0);
  });

  it("each warning has line, column, char, and message", () => {
    const warnings = checkUppercaseWarnings("A");
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toHaveProperty("line");
    expect(warnings[0]).toHaveProperty("column");
    expect(warnings[0]).toHaveProperty("char");
    expect(warnings[0]).toHaveProperty("message");
  });
});
