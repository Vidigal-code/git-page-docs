#!/usr/bin/env node
import { spawn } from "child_process";

const env = { ...process.env, GITPAGEDOCS_REPOSITORY_SEARCH: "true" };
// The Next app lives in frontend/, so `next build` emits to frontend/.next —
// point `next start` at the same directory (matches `next build frontend`).
const child = spawn("npx", ["next", "start", "frontend"], {
  stdio: "inherit",
  env,
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
