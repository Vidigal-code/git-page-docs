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
    // Local docs mode: the specs exercise the docs shell (AI chat drawer,
    // overflow) at the site root, so repository search stays disabled.
    command: "pnpm dev:e2e",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
    // Specs navigate from the site root; force an empty base path so a local
    // GITPAGEDOCS_PATH override cannot mount the app under a subpath.
    env: { ...process.env, GITPAGEDOCS_BASE_PATH: "" },
  },
});
