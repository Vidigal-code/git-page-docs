#!/usr/bin/env node
/**
 * CLI command-surface smoke: runs every safe, non-interactive `gitpagedocs`
 * command end-to-end (real process, real output) and asserts its contract.
 * Interactive or mutating commands (ai, password, pages, docs, update, mcp)
 * are covered by their own suites and are intentionally not spawned here.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const CONFIG_FILENAME = ".gitpagedocsconfig";

function run(args, options = {}) {
  return execSync(`node ${JSON.stringify(path.join(root, "cli", "index.mjs"))} ${args}`, {
    cwd: options.cwd ?? root,
    env: { ...process.env, ...options.env },
    stdio: ["ignore", "pipe", "pipe"],
  }).toString();
}

function expectContains(label, output, marker) {
  if (!output.includes(marker)) {
    throw new Error(`[smoke:commands] ${label}: expected output to contain ${JSON.stringify(marker)}\n${output}`);
  }
  console.log(`  ok   ${label}`);
}

console.log("[smoke:commands] informational commands");
expectContains("version prints the package version", run("version"), "gitpagedocs ");
expectContains("doctor passes at the repo root", run("doctor"), "All required checks passed.");
expectContains("provider lists the catalog", run("provider"), "AI providers (14)");
expectContains("provider <id> shows details", run("provider anthropic"), "Anthropic");
expectContains("models <provider> lists models", run("models openai"), "gpt-");
expectContains("config summarizes the site config", run("config"), "Config:");

console.log("[smoke:commands] config clear (isolated credentials wipe)");
const workDir = mkdtempSync(path.join(os.tmpdir(), "gpd-clear-cwd-"));
const configDir = path.join(mkdtempSync(path.join(os.tmpdir(), "gpd-clear-cfg-")), "gitpagedocs");
const env = { GITPAGEDOCS_CONFIG_DIR: configDir };
try {
  expectContains(
    "config clear reports when nothing is stored",
    run("config clear", { cwd: workDir, env }),
    "nothing to clear",
  );

  const storedConfig = JSON.stringify({ version: 1, ai: { provider: "openai", model: "m", apiKey: "secret" } });
  mkdirSync(configDir, { recursive: true });
  writeFileSync(path.join(configDir, CONFIG_FILENAME), storedConfig, "utf-8");
  writeFileSync(path.join(workDir, CONFIG_FILENAME), storedConfig, "utf-8");

  expectContains(
    "config clear wipes stored credentials",
    run("config clear", { cwd: workDir, env }),
    "credentials wiped",
  );
  if (existsSync(path.join(configDir, CONFIG_FILENAME)) || existsSync(path.join(workDir, CONFIG_FILENAME))) {
    throw new Error("[smoke:commands] config clear left a .gitpagedocsconfig behind.");
  }
  console.log("  ok   both storage locations are empty after clear");
} finally {
  rmSync(workDir, { recursive: true, force: true });
  rmSync(path.dirname(configDir), { recursive: true, force: true });
}

console.log("\n[smoke:commands] OK - CLI command surface verified.");
