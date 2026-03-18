#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const tsEntry = path.join(scriptDir, "presentation", "index.ts");

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", tsEntry, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  },
);

if (result.error) {
  console.warn("[gitpagedocs] TypeScript runtime unavailable; falling back to legacy CLI.");
  await import("./index.legacy.mjs");
} else if (typeof result.status === "number" && result.status !== 0) {
  process.exitCode = result.status;
}
