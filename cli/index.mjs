#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const tsEntry = path.join(scriptDir, "presentation", "index.ts");

// Resolve tsx from THIS package's location, not the user's cwd. `node --import
// tsx` would otherwise resolve the bare "tsx" specifier relative to the current
// working directory, which fails when the CLI is installed globally and run
// from a project that doesn't depend on tsx (ERR_MODULE_NOT_FOUND 'tsx').
let tsxLoader = "tsx";
try {
  tsxLoader = import.meta.resolve("tsx");
} catch {
  // Older Node without a stable import.meta.resolve — fall back to the bare
  // specifier (works when tsx is resolvable from the cwd or globally).
}

const result = spawnSync(
  process.execPath,
  ["--import", tsxLoader, tsEntry, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  },
);

if (result.error) {
  console.error("[gitpagedocs] Failed to run TypeScript CLI runtime.", result.error);
  process.exitCode = 1;
} else if (typeof result.status === "number" && result.status !== 0) {
  process.exitCode = result.status;
}
