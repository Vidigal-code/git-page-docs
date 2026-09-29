import { defineConfig, devices } from "@playwright/test";

/**
 * Frontend E2E. Starts two `next dev` servers and runs specs in a desktop and a
 * mobile project so responsiveness (no horizontal overflow) is covered:
 * - the docs server (local docs mode) for the docs shell specs;
 * - the guide server (repository-search mode, next port) for the
 *   introduction guide, which only exists in repository-search builds.
 */
const PORT = Number(process.env.PORT) || 3000;
const GUIDE_PORT = PORT + 1;
const BASE_URL = `http://localhost:${PORT}`;
const GUIDE_BASE_URL = `http://localhost:${GUIDE_PORT}`;
const GUIDE_SPEC = /introduction-guide\.spec\.ts/;

const DESKTOP = devices["Desktop Chrome"];
const MOBILE = devices["Pixel 5"];

/** Shared by both dev servers; specs navigate from the site root. */
const SERVER_DEFAULTS = {
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
  stdout: "ignore",
  stderr: "pipe",
} as const;

// Force an empty base path so a local GITPAGEDOCS_PATH override (or the
// repository-search base path) cannot mount the app under a subpath.
const serverEnv = (port: number) => ({ ...process.env, PORT: String(port), GITPAGEDOCS_BASE_PATH: "" });

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
    { name: "desktop", testIgnore: GUIDE_SPEC, use: { ...DESKTOP } },
    { name: "mobile", testIgnore: GUIDE_SPEC, use: { ...MOBILE } },
    { name: "guide-desktop", testMatch: GUIDE_SPEC, use: { ...DESKTOP, baseURL: GUIDE_BASE_URL } },
    { name: "guide-mobile", testMatch: GUIDE_SPEC, use: { ...MOBILE, baseURL: GUIDE_BASE_URL } },
  ],
  webServer: [
    { ...SERVER_DEFAULTS, command: "pnpm dev:e2e", url: BASE_URL, env: serverEnv(PORT) },
    // Waiting on the guide route itself compiles it before the first test starts.
    {
      ...SERVER_DEFAULTS,
      command: "pnpm dev:e2e:guide",
      url: `${GUIDE_BASE_URL}/introduction-guide/`,
      env: serverEnv(GUIDE_PORT),
    },
  ],
});
