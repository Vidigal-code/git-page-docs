import { defineConfig, devices } from "@playwright/test";

/**
 * Frontend E2E. Starts `next dev` (local docs mode) and runs specs in a desktop
 * and a mobile project so responsiveness (no horizontal overflow) is covered.
 */
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

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
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
