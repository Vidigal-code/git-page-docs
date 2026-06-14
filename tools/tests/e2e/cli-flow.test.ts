import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, symlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";

const REPO = process.cwd();
const CLI = path.resolve(REPO, "cli/index.mjs");

/**
 * Give a temp project a node_modules junction to the repo's, replicating an
 * installed package so the bin's `node --import tsx` resolves tsx from the temp
 * cwd (as npx provides for real users).
 */
function linkNodeModules(cwd: string): void {
  symlinkSync(path.join(REPO, "node_modules"), path.join(cwd, "node_modules"), process.platform === "win32" ? "junction" : "dir");
}

interface RunResult {
  stdout: string;
  status: number;
}

/** Run the real CLI bin in a given cwd; never throws (captures exit status). */
function runCli(args: string[], cwd: string): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { stdout, status: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { stdout: (err.stdout ?? "") + (err.stderr ?? ""), status: err.status ?? 1 };
  }
}

describe("E2E: CLI bin in a temp project", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(os.tmpdir(), "gpd-e2e-cli-"));
    linkNodeModules(dir);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("config-only (no args, non-TTY) generates the gitpagedocs contract", () => {
    const res = runCli([], dir);
    expect(res.status).toBe(0);
    expect(existsSync(path.join(dir, "gitpagedocs", "config.json"))).toBe(true);
    expect(existsSync(path.join(dir, "gitpagedocs", "docs", "versions", "1.0.0", "config.json"))).toBe(true);
    const cfg = JSON.parse(readFileSync(path.join(dir, "gitpagedocs", "config.json"), "utf8"));
    expect(cfg.site).toBeTruthy();
    expect(cfg.VersionControl).toBeTruthy();
  });

  it("--layoutconfig emits local layout templates", () => {
    const res = runCli(["--layoutconfig"], dir);
    expect(res.status).toBe(0);
    expect(existsSync(path.join(dir, "gitpagedocs", "layouts"))).toBe(true);
    expect(res.stdout).toContain("Local layouts generated");
  });

  it("--push without owner/repo fails with a clear error (contract)", () => {
    const res = runCli(["--push"], dir);
    expect(res.status).not.toBe(0);
    expect(res.stdout.toLowerCase()).toContain("owner");
  });

  it("docs verb injects an idempotent managed region into README", () => {
    writeFileSync(path.join(dir, "README.md"), "# Temp\n\nManual.\n", "utf8");
    const first = runCli(["docs"], dir);
    expect(first.status).toBe(0);
    const readme = readFileSync(path.join(dir, "README.md"), "utf8");
    expect(readme).toContain("Manual.");
    expect(readme).toContain("Supported AI providers");
    const second = runCli(["docs"], dir);
    expect(second.stdout).toContain("already up to date");
  });
}, 120_000);
