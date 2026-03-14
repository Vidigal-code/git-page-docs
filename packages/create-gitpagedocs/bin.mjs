#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = __dirname;
const binDir = path.join(pkgRoot, "node_modules", ".bin");
const pathEnv = binDir + path.delimiter + (process.env.PATH || "");

const child = spawn(
  process.platform === "win32" ? "gitpagedocs.cmd" : "gitpagedocs",
  process.argv.slice(2),
  {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, PATH: pathEnv },
  }
);

child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
