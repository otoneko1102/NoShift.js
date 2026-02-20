import { defineConfig } from "tsup";

export default defineConfig([
  // Library (public API)
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    outDir: "dist",
    splitting: false,
    sourcemap: true,
    outExtension({ format }) {
      return {
        js: format === "cjs" ? ".cjs" : ".mjs",
      };
    },
  },
  // CLI
  {
    entry: ["src/cli.ts"],
    format: ["cjs"],
    clean: false,
    outDir: "dist",
    splitting: false,
    sourcemap: true,
    // Mark all npm packages as external so only project code is bundled
    external: [/^[^./]/],
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
