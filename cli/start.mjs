#!/usr/bin/env node
import { spawnExecutable } from "./runtime/exec.mjs";

const env = { ...process.env, GITPAGEDOCS_REPOSITORY_SEARCH: "true" };
// The Next app lives in frontend/, so `next build` emits to frontend/.next —
// point `next start` at the same directory (matches `next build frontend`).
let child;
try {
  child = spawnExecutable("npx", ["next", "start", "frontend"], { stdio: "inherit", env });
} catch (error) {
  console.error(`[gitpagedocs] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
child.on("exit", (code) => process.exit(code ?? 0));
