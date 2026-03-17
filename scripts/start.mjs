#!/usr/bin/env node
import { spawn } from "child_process";

const env = { ...process.env, GITPAGEDOCS_REPOSITORY_SEARCH: "false" };
const child = spawn("npx", ["next", "start"], {
  stdio: "inherit",
  env,
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
