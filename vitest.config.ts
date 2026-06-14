import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tools/tests/**/*.test.ts", "mcp/tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["tools/src/**/*.ts"],
      exclude: [
        "tools/src/**/index.ts",
        "tools/src/ports/**", // type-only contracts
        "tools/src/**/*.test.ts",
      ],
      reporter: ["text-summary", "text"],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
