import { describe, it, expect } from "vitest";
import { compile, diagnose } from "../index.js";
import type { CompileResult, CompileOptions, DiagnosticError } from "../index.js";

describe("Public API: compile()", () => {
  it("returns CompileResult with outputText", () => {
    const result: CompileResult = compile("const x ^- 1;", { noHeader: true });
    expect(result).toHaveProperty("outputText");
    expect(result.outputText).toBe("const x = 1;");
  });

  it("compiles Hello World example", () => {
    const result = compile("console.log^8^2^3hello^2^9;", { noHeader: true });
    expect(result.outputText).toBe('console.log("Hello");');
  });

  it("accepts capitalizeInStrings option", () => {
    const opts: CompileOptions = { capitalizeInStrings: false, noHeader: true };
    const result = compile("^2^3hello^2", opts);
    expect(result.outputText).toBe('"^3hello"');
  });

  it("defaults capitalizeInStrings to true", () => {
    const result = compile("^2^3hello^2", { noHeader: true });
    expect(result.outputText).toBe('"Hello"');
  });

  it("compiles empty string", () => {
    const result = compile("", { noHeader: true });
    expect(result.outputText).toBe("");
  });

  it("compiles complex code", () => {
    const nsjs = "const add ^- ^8a, b^9 ^-^. a ^; b;";
    const result = compile(nsjs, { noHeader: true });
    expect(result.outputText).toBe("const add = (a, b) => a + b;");
  });
});

describe("Public API: diagnose()", () => {
  it("returns empty array for valid code", () => {
    const errors: DiagnosticError[] = diagnose("const x ^- 1;");
    expect(errors).toEqual([]);
  });

  it("returns errors for invalid code", () => {
    const errors = diagnose("^2unclosed");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("each error has line, column, and message", () => {
    const errors = diagnose("^2unclosed");
    expect(errors[0]).toHaveProperty("line");
    expect(errors[0]).toHaveProperty("column");
    expect(errors[0]).toHaveProperty("message");
    expect(typeof errors[0].line).toBe("number");
    expect(typeof errors[0].column).toBe("number");
    expect(typeof errors[0].message).toBe("string");
  });
});
