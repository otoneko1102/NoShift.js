/**
 * prettier-plugin-noshift.js テスト
 */

import * as prettier from "prettier";
import * as plugin from "../src/index.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTest(name, input, expected) {
  try {
    const output = await prettier.format(input, {
      parser: "noshift",
      plugins: [plugin],
      semi: true,
      tabWidth: 2,
      singleQuote: false,
    });
    const pass = expected ? output.trimEnd() === expected.trimEnd() : true;
    console.log(`${pass ? "PASS" : "FAIL"}: ${name}`);
    if (!pass && expected) {
      console.log("  Expected:", JSON.stringify(expected.trimEnd()));
      console.log("  Got:     ", JSON.stringify(output.trimEnd()));
    }
    return { name, output, pass };
  } catch (err) {
    console.log(`ERROR: ${name} — ${err.message}`);
    return { name, output: null, pass: false };
  }
}

async function main() {
  console.log("=== prettier-plugin-noshift.js Test Suite ===\n");

  // Test 1: Basic variable
  await runTest(
    "Basic variable formatting",
    "const  x  =  1  ;",
    "const x ^- 1;",
  );

  // Test 2: Function
  await runTest(
    "Function formatting",
    'function greet^8name^9 ^[\nconsole.log^8name^9 ;\n^]',
    "function greet^8name^9 ^[\n  console.log^8name^9;\n^]",
  );

  // Test 3: String with ^2 (double-quote)
  await runTest(
    "String delimiters",
    'const s ^- ^2hello^2 ;',
    'const s ^- ^2hello^2;',
  );

  // Test 4: ^3 capitalize
  await runTest(
    "Capitalize modifier ^3",
    'const ^3my^3var ^- ^2^3hello^2 ;',
    'const ^3my^3var ^- ^2^3hello^2;',
  );

  // Test 5: Template literals
  await runTest(
    "Template literal",
    'const msg ^- ^@hello ^4^[name^]^@ ;',
    'const msg ^- ^@hello ^4^[name^]^@;',
  );

  // Test 6: Block comment
  await runTest(
    "Block comment",
    '/^: this is a comment ^:/',
    '/^: this is a comment ^:/',
  );

  // Test 7: Fixture file
  const fixture = readFileSync(join(__dirname, "fixture.nsjs"), "utf-8");
  const result = await runTest("Fixture file formatting", fixture);
  console.log("\n--- Fixture output ---");
  console.log(result.output);

  console.log("\n=== Done ===");
}

main();
