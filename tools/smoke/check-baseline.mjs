#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { BASELINE_FILE, collectFileHashes, getBaselineTargets } from "./_baseline-common.mjs";

const root = process.cwd();
const baselinePath = path.join(root, BASELINE_FILE);

if (!existsSync(baselinePath)) {
  throw new Error(`Baseline snapshot not found at ${BASELINE_FILE}. Run npm run baseline:create first.`);
}

const snapshot = JSON.parse(readFileSync(baselinePath, "utf-8"));
const targets = snapshot.targets ?? getBaselineTargets();

console.log("[baseline:check] Regenerating CLI artifacts...");
execSync("node cli/index.mjs", { cwd: root, stdio: "inherit" });

const current = collectFileHashes(root, targets);
const diffs = [];

for (const file of targets) {
  const previousHash = snapshot.hashes?.[file];
  const currentHash = current[file];
  if (previousHash !== currentHash) {
    diffs.push({ file, previousHash, currentHash });
  }
}

if (diffs.length > 0) {
  console.error("[baseline:check] Regression detected in generated artifacts:");
  for (const diff of diffs) {
    console.error(`- ${diff.file}`);
    console.error(`  expected: ${diff.previousHash}`);
    console.error(`  current : ${diff.currentHash}`);
  }
  process.exitCode = 1;
} else {
  console.log("[baseline:check] OK - generated artifacts match baseline snapshot.");
}
