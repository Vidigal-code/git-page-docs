import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

/**
 * End-to-end exercise of the real CLI bin (node cli/index.mjs) for the
 * read-only informational commands. These spawn the full stack — clack imports,
 * @gitpagedocs/tools resolution, command dispatch — without generating files.
 * (No-arg / generation flows are covered by smoke:cli + flag-contract.)
 */
function runCli(args: string[]): string {
  return execFileSync(process.execPath, ["cli/index.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

describe("CLI e2e (read-only commands)", () => {
  it("version prints name + node version", () => {
    expect(runCli(["version"])).toMatch(/gitpagedocs \d+\.\d+\.\d+ \(node v\d+/);
  });

  it("provider lists all 14 providers incl. anthropic", () => {
    const out = runCli(["provider"]);
    expect(out).toContain("AI providers (14)");
    expect(out).toContain("anthropic");
  });

  it("provider <id> shows the latest claude default model", () => {
    expect(runCli(["provider", "anthropic"])).toContain("claude-sonnet-4-6");
  });

  it("models lists catalog models", () => {
    expect(runCli(["models", "groq"])).toContain("llama-3.3-70b-versatile");
  });

  it("doctor reports environment checks", () => {
    const out = runCli(["doctor"]);
    expect(out).toContain("gitpagedocs doctor");
    expect(out).toMatch(/node/);
  });

  it("config summarizes the resolved config", () => {
    // Runs against the repo's own gitpagedocs/config.json.
    expect(runCli(["config"]).toLowerCase()).toMatch(/config|language/);
  });
}, 60_000);
