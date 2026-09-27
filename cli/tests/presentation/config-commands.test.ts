import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { runConfig } from "../../presentation/commands/config-info";
import { runConfigClear } from "../../presentation/commands/config-clear";
import { AI_CLI_CONFIG_FILENAME } from "../../ai/core/models/ai-cli-config";
import type { CommandContext } from "../../presentation/commands/run-command";

const temporaryRoots: string[] = [];
let logged: string[];

function makeRoot(prefix: string): string {
  const root = mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

function context(cwd: string, args: string[] = ["config"]): CommandContext {
  return { argv: ["node", "gitpagedocs", ...args], args, pkgRoot: cwd, cwd };
}

function writeSiteConfig(cwd: string, site: Record<string, unknown>): void {
  mkdirSync(path.join(cwd, "gitpagedocs"), { recursive: true });
  writeFileSync(path.join(cwd, "gitpagedocs", "config.json"), JSON.stringify({ site }), "utf-8");
}

function output(): string {
  return logged.join("\n");
}

beforeEach(() => {
  logged = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("runConfig", () => {
  it("summarizes site.languages toggles, splitting enabled and disabled", async () => {
    const cwd = makeRoot("gpd-cfg-");
    writeSiteConfig(cwd, { name: "Docs", defaultLanguage: "en", languages: { en: true, pt: false, es: true } });

    await runConfig(context(cwd));

    const text = output();
    expect(text).toContain(`Config: ${path.join("gitpagedocs", "config.json")} (.json)`);
    expect(text).toContain("site name        : Docs");
    expect(text).toContain("default language : en");
    expect(text).toContain("languages        : en, es");
    expect(text).toContain("disabled         : pt");
  });

  it("falls back to the legacy inline supportedLanguages list", async () => {
    const cwd = makeRoot("gpd-cfg-");
    writeSiteConfig(cwd, { name: "Docs", supportedLanguages: ["en", "es"] });

    await runConfig(context(cwd));

    expect(output()).toContain("languages        : en, es");
    expect(output()).toContain("disabled         : —");
  });

  it("falls back to the legacy langs.json manifest when config.json has no languages", async () => {
    const cwd = makeRoot("gpd-cfg-");
    writeSiteConfig(cwd, { name: "Docs" });
    writeFileSync(path.join(cwd, "gitpagedocs", "langs.json"), JSON.stringify({ languages: ["pt", "en"] }), "utf-8");

    await runConfig(context(cwd));

    expect(output()).toContain("languages        : pt, en");
  });

  it("prints unknown markers for missing or non-scalar values and no manifest", async () => {
    const cwd = makeRoot("gpd-cfg-");
    writeSiteConfig(cwd, { name: { nested: true }, defaultLanguage: 42 });

    await runConfig(context(cwd));

    const text = output();
    expect(text).toContain("site name        : —");
    expect(text).toContain("default language : 42");
    expect(text).toContain("languages        : —");
  });

  it("tolerates a config without a site section", async () => {
    const cwd = makeRoot("gpd-cfg-");
    mkdirSync(path.join(cwd, "gitpagedocs"));
    writeFileSync(path.join(cwd, "gitpagedocs", "config.json"), "{}", "utf-8");

    await runConfig(context(cwd));

    expect(output()).toContain("site name        : —");
  });

  it("guides the user to init when no config can be loaded", async () => {
    const cwd = makeRoot("gpd-cfg-");

    await runConfig(context(cwd));

    expect(output()).toContain("No usable config found: No config file found.");
    expect(output()).toContain("Run `gitpagedocs init` to generate one.");
  });

  it("reports a parse failure of an existing config", async () => {
    const cwd = makeRoot("gpd-cfg-");
    mkdirSync(path.join(cwd, "gitpagedocs"));
    writeFileSync(path.join(cwd, "gitpagedocs", "config.json"), "{ not json", "utf-8");

    await runConfig(context(cwd));

    expect(output()).toContain("No usable config found: SyntaxError");
  });
});

describe("runConfigClear", () => {
  it("reports when nothing is stored", async () => {
    const cwd = makeRoot("gpd-clear-cwd-");
    vi.stubEnv("GITPAGEDOCS_CONFIG_DIR", path.join(makeRoot("gpd-clear-cfg-"), "gitpagedocs"));

    await runConfigClear(context(cwd, ["config", "clear"]));

    expect(output()).toContain("No stored .gitpagedocsconfig found - nothing to clear.");
  });

  it("removes the stored and legacy config files and lists them", async () => {
    const cwd = makeRoot("gpd-clear-cwd-");
    const configDir = path.join(makeRoot("gpd-clear-cfg-"), "gitpagedocs");
    vi.stubEnv("GITPAGEDOCS_CONFIG_DIR", configDir);
    mkdirSync(configDir, { recursive: true });
    const stored = path.join(configDir, AI_CLI_CONFIG_FILENAME);
    const legacy = path.join(cwd, AI_CLI_CONFIG_FILENAME);
    writeFileSync(stored, "{}", "utf-8");
    writeFileSync(legacy, "{}", "utf-8");

    await runConfigClear(context(cwd, ["config", "clear"]));

    const text = output();
    expect(text).toContain("Stored AI configuration removed (credentials wiped):");
    expect(text).toContain(`    - ${path.resolve(stored)}`);
    expect(text).toContain(`    - ${path.resolve(legacy)}`);
    expect(existsSync(stored)).toBe(false);
    expect(existsSync(legacy)).toBe(false);
  });
});
