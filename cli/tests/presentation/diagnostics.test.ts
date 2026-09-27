import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const exec = vi.hoisted(() => ({
  runExecutableCapture: vi.fn<(name: string, args: readonly string[]) => string>(),
}));
vi.mock("../../runtime/exec.mjs", () => exec);

import { runVersion, runDoctor, runUpdate } from "../../presentation/commands/diagnostics";
import type { CommandContext } from "../../presentation/commands/run-command";

const temporaryRoots: string[] = [];
let logged: string[];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-diag-"));
  temporaryRoots.push(root);
  return root;
}

function writePackage(pkgRoot: string, pkg: Record<string, unknown>): void {
  writeFileSync(path.join(pkgRoot, "package.json"), JSON.stringify(pkg), "utf-8");
}

function context(overrides: Partial<CommandContext> = {}): CommandContext {
  return { argv: [], args: [], pkgRoot: makeRoot(), cwd: makeRoot(), ...overrides };
}

function output(): string {
  return logged.join("\n");
}

/** A fetch stub answering the npm `latest` dist-tag lookup. */
function stubRegistry(status: number, body: unknown = {}): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
  exec.runExecutableCapture.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("runVersion", () => {
  it("prints the package version and the node version", async () => {
    const ctx = context();
    writePackage(ctx.pkgRoot, { name: "@gitpagedocs/cli", version: "9.9.9" });
    await runVersion(ctx);
    expect(output()).toBe(`gitpagedocs 9.9.9 (node ${process.version})`);
  });

  it("reports an unknown version when package.json is missing or has no version", async () => {
    await runVersion(context());
    const withoutVersion = context();
    writePackage(withoutVersion.pkgRoot, { name: "x" });
    await runVersion(withoutVersion);
    expect(logged).toEqual([
      `gitpagedocs unknown (node ${process.version})`,
      `gitpagedocs unknown (node ${process.version})`,
    ]);
  });
});

describe("runDoctor", () => {
  function probeResults(results: Record<string, string | Error>): void {
    exec.runExecutableCapture.mockImplementation((name) => {
      const result = results[name];
      if (result instanceof Error) throw result;
      return result ?? "";
    });
  }

  it("lists every probe and reports missing config and docs folder", async () => {
    probeResults({ git: "git version 2.45.0\nnoise", gh: new Error("not on PATH"), pnpm: "10.0.0" });
    const ctx = context();

    await runDoctor(ctx);

    expect(exec.runExecutableCapture).toHaveBeenCalledWith("git", ["--version"], expect.anything());
    expect(exec.runExecutableCapture).toHaveBeenCalledWith("gh", ["--version"], expect.anything());
    expect(exec.runExecutableCapture).toHaveBeenCalledWith("pnpm", ["--version"], expect.anything());
    const text = output();
    expect(text).toContain("gitpagedocs doctor");
    expect(text).toContain(`[ok] ${"node".padEnd(22)} ${process.version}`);
    expect(text).toContain(`[ok] ${"git".padEnd(22)} git version 2.45.0`);
    expect(text).not.toContain("noise");
    expect(text).toContain(`[x]  ${"gh (GitHub CLI)".padEnd(22)} not found`);
    expect(text).toContain(`[ok] ${"pnpm".padEnd(22)} 10.0.0`);
    expect(text).toContain("not found (run `gitpagedocs init`)");
    expect(text).toContain(`[x]  ${"gitpagedocs/ directory".padEnd(22)} missing`);
    // gh is optional: only config + directory count as failures.
    expect(text).toContain("2 check(s) need attention.");
  });

  it("passes when the config and docs folder exist, ignoring a missing gh", async () => {
    probeResults({ git: "git version 2.45.0", gh: new Error("missing"), pnpm: "10.0.0" });
    const ctx = context();
    mkdirSync(path.join(ctx.cwd, "gitpagedocs"));
    writeFileSync(path.join(ctx.cwd, "gitpagedocs", "config.json"), "{}", "utf-8");

    await runDoctor(ctx);

    const text = output();
    expect(text).toContain(`[ok] ${"gitpagedocs config".padEnd(22)} ${path.join("gitpagedocs", "config.json")}`);
    expect(text).toContain(`[ok] ${"gitpagedocs/ directory".padEnd(22)} present`);
    expect(text).toContain("All required checks passed.");
  });

  it("counts a missing git as a failure", async () => {
    probeResults({ git: new Error("missing"), gh: "gh 2.0", pnpm: "10.0.0" });
    const ctx = context();
    mkdirSync(path.join(ctx.cwd, "gitpagedocs"));
    writeFileSync(path.join(ctx.cwd, "gitpagedocs", "config.json"), "{}", "utf-8");

    await runDoctor(ctx);

    expect(output()).toContain("1 check(s) need attention.");
  });
});

describe("runUpdate", () => {
  function scopedPackage(version: string): CommandContext {
    const ctx = context();
    writePackage(ctx.pkgRoot, { name: "@gitpagedocs/cli", version });
    return ctx;
  }

  it("suggests the install commands when a newer version is published", async () => {
    const fetchMock = stubRegistry(200, { version: "1.2.0" });
    await runUpdate(scopedPackage("1.1.0"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://registry.npmjs.org/%40gitpagedocs/cli/latest");
    const text = output();
    expect(text).toContain("Installed: gitpagedocs 1.1.0  (@gitpagedocs/cli)");
    expect(text).toContain("Latest:    1.2.0");
    expect(text).toContain("npm i -g @gitpagedocs/cli@1.2.0");
    expect(text).toContain("pnpm add -D @gitpagedocs/cli@1.2.0");
  });

  it("honours a configured npm registry, without a trailing slash", async () => {
    vi.stubEnv("npm_config_registry", "https://mirror.example.test/npm/");
    const fetchMock = stubRegistry(200, { version: "1.0.0" });
    await runUpdate(scopedPackage("1.0.0"));
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://mirror.example.test/npm/%40gitpagedocs/cli/latest");
  });

  it.each([
    ["1.2.0", "1.2.0"],
    ["1.3.0", "1.2.0"],
    ["2.0.0-beta.1", "1.9.9"],
    ["1.2", "1.2.0"],
  ])("says %s is current when latest is %s", async (installed, latest) => {
    stubRegistry(200, { version: latest });
    await runUpdate(scopedPackage(installed));
    expect(output()).toContain("Already on the latest published version.");
    expect(output()).not.toContain("npm i -g");
  });

  it("explains an unpublished package instead of suggesting an install", async () => {
    stubRegistry(404);
    await runUpdate(scopedPackage("1.0.0"));
    const text = output();
    expect(text).toContain("Latest:    unavailable — the registry has no published @gitpagedocs/cli");
    expect(text).toContain("Nothing can be installed under that name.");
    expect(text).not.toContain("npm i -g");
  });

  it.each([
    ["a server error", () => stubRegistry(500)],
    ["a body without a version", () => stubRegistry(200, { name: "x" })],
    ["a network failure", () => vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))))],
  ])("falls back to @latest on %s", async (_label, arrange) => {
    arrange();
    await runUpdate(scopedPackage("1.0.0"));
    const text = output();
    expect(text).toContain("Latest:    unknown — could not reach the npm registry");
    expect(text).toContain("npm i -g @gitpagedocs/cli@latest");
  });

  it("prints only the bin name when the package is the bin itself", async () => {
    stubRegistry(200, { version: "1.0.0" });
    const ctx = context();
    writePackage(ctx.pkgRoot, { name: "gitpagedocs", version: "1.0.0" });
    await runUpdate(ctx);
    expect(output()).toContain("Installed: gitpagedocs 1.0.0\n");
    expect(output()).not.toContain("(gitpagedocs)");
  });

  it("uses the published package name when package.json is unreadable", async () => {
    stubRegistry(200, { version: "1.0.0" });
    await runUpdate(context());
    const text = output();
    expect(text).toContain("Installed: gitpagedocs unknown  (@gitpagedocs/cli)");
    expect(text).toContain("npm i -g @gitpagedocs/cli@1.0.0");
  });

  it("falls back to the published name when package.json has an empty name", async () => {
    stubRegistry(200, { version: "0.0.1" });
    const ctx = context();
    writePackage(ctx.pkgRoot, { name: "", version: "0.0.1" });
    await runUpdate(ctx);
    expect(output()).toContain("Installed: gitpagedocs 0.0.1  (@gitpagedocs/cli)");
  });
});
