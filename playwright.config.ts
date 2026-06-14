import { defineConfig, devices } from "@playwright/test";

/**
 * Frontend E2E. Starts `next dev` (local docs mode) and runs specs in a desktop
 * and a mobile project so responsiveness (no horizontal overflow) is covered.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // One retry absorbs the dev server's first-hit JIT compile (a cold-compile
  // layout settle can momentarily trip the no-overflow assertion).
  retries: 1,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
