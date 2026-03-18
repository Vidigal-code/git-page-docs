#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { BASELINE_FILE, collectFileHashes, getBaselineTargets } from "./_baseline-common.mjs";

const root = process.cwd();

console.log("[baseline:create] Generating CLI artifacts...");
execSync("node cli/index.mjs", { cwd: root, stdio: "inherit" });

const targets = getBaselineTargets();
const hashes = collectFileHashes(root, targets);
const output = {
  generatedAt: new Date().toISOString(),
  targets,
  hashes,
};

const baselinePath = path.join(root, BASELINE_FILE);
mkdirSync(path.dirname(baselinePath), { recursive: true });
writeFileSync(baselinePath, `${JSON.stringify(output, null, 2)}\n`, "utf-8");

console.log(`[baseline:create] Snapshot saved at ${BASELINE_FILE}`);
