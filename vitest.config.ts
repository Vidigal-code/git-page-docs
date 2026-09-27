import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig keeps jsx: "preserve" for Next.js; give Vitest a real JSX transform so
  // test files and imported .tsx modules parse (Vite config wins over tsconfig).
  oxc: {
    jsx: { runtime: "automatic", importSource: "react" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./frontend/src", import.meta.url)),
    },
  },
  test: {
    include: [
      "tools/tests/**/*.test.{ts,tsx}",
      "mcp/tests/**/*.test.{ts,tsx}",
      "cli/tests/**/*.test.{ts,tsx}",
      "frontend/tests/**/*.test.{ts,tsx}",
    ],
    environment: "node",
    coverage: {
      provider: "v8",
      // Every workspace package is measured (SonarQube imports the lcov); only
      // the shared core in tools/src has a hard floor, enforced by the glob
      // threshold below. UI components (.tsx) are covered by Playwright E2E.
      include: [
        "tools/src/**/*.ts",
        "cli/**/*.{ts,mts,mjs}",
        "frontend/src/**/*.ts",
        "mcp/src/**/*.ts",
      ],
      exclude: [
        "tools/src/**/index.ts",
        "tools/src/ports/**", // type-only contracts
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "cli/tests/**",
        "cli/node_modules/**",
        "cli/prebuilt/**",
      ],
      reporter: ["text-summary"],
      thresholds: {
        "tools/src/**/*.ts": {
          lines: 80,
          functions: 80,
          statements: 80,
          branches: 70,
        },
      },
    },
  },
});
