import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { AiConfigFileRepository } from "../ai/infrastructure/ai-config-file";
import { AI_CLI_CONFIG_FILENAME, type AiCliConfig } from "../ai/core/models/ai-cli-config";

const VALID_CONFIG: AiCliConfig = {
  version: 1,
  ai: {
    provider: "openai",
    model: "gpt-4o-mini",
    apiKey: "test-key",
    paths: ["src"],
    languages: ["en", "pt"],
    outputDir: "gitpagedocs/docs",
    filePrefix: "ai",
    contextPrompt: "Describe the code.",
  },
};

describe("AiConfigFileRepository", () => {
  let cwd: string;
  let configDir: string;

  beforeEach(() => {
    cwd = mkdtempSync(path.join(os.tmpdir(), "gpd-ai-cwd-"));
    configDir = path.join(mkdtempSync(path.join(os.tmpdir(), "gpd-ai-cfg-")), "gitpagedocs");
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
    rmSync(path.dirname(configDir), { recursive: true, force: true });
  });

  it("returns null when no config exists anywhere", async () => {
    const repo = new AiConfigFileRepository({ cwd, configDir });
    expect(await repo.read()).toBeNull();
  });

  it("writes to the user config directory and round-trips through read", async () => {
    const repo = new AiConfigFileRepository({ cwd, configDir });
    await repo.write(VALID_CONFIG);

    expect(repo.getConfigPath()).toBe(path.join(configDir, AI_CLI_CONFIG_FILENAME));
    expect(existsSync(repo.getConfigPath())).toBe(true);
    expect(existsSync(repo.getLegacyConfigPath())).toBe(false);
    expect(await repo.read()).toEqual(VALID_CONFIG);
  });

  it("restricts file permissions to the owner on POSIX", async () => {
    if (process.platform === "win32") return;
    const repo = new AiConfigFileRepository({ cwd, configDir });
    await repo.write(VALID_CONFIG);
    expect(statSync(repo.getConfigPath()).mode & 0o777).toBe(0o600);
  });

  it("migrates a legacy <cwd>/.gitpagedocsconfig into the user config directory", async () => {
    const legacyPath = path.join(cwd, AI_CLI_CONFIG_FILENAME);
    writeFileSync(legacyPath, JSON.stringify(VALID_CONFIG), "utf-8");
    const migrations: Array<{ from: string; to: string }> = [];
    const repo = new AiConfigFileRepository({
      cwd,
      configDir,
      onMigrate: (from, to) => migrations.push({ from, to }),
    });

    expect(await repo.read()).toEqual(VALID_CONFIG);
    expect(existsSync(legacyPath)).toBe(false);
    const migrated = JSON.parse(await readFile(repo.getConfigPath(), "utf-8")) as AiCliConfig;
    expect(migrated).toEqual(VALID_CONFIG);
    expect(migrations).toEqual([{ from: legacyPath, to: repo.getConfigPath() }]);
  });

  it("ignores an invalid legacy config without migrating it", async () => {
    const legacyPath = path.join(cwd, AI_CLI_CONFIG_FILENAME);
    writeFileSync(legacyPath, JSON.stringify({ version: 2, ai: {} }), "utf-8");
    const repo = new AiConfigFileRepository({ cwd, configDir });

    expect(await repo.read()).toBeNull();
    expect(existsSync(legacyPath)).toBe(true);
    expect(existsSync(repo.getConfigPath())).toBe(false);
  });

  it("clear removes the stored config from both locations and wipes credentials", async () => {
    const repo = new AiConfigFileRepository({ cwd, configDir });
    await repo.write(VALID_CONFIG);
    writeFileSync(path.join(cwd, AI_CLI_CONFIG_FILENAME), JSON.stringify(VALID_CONFIG), "utf-8");

    const removed = await repo.clear();

    const expected = [repo.getConfigPath(), repo.getLegacyConfigPath()].map((p) => path.resolve(p)).sort();
    expect([...removed].sort()).toEqual(expected);
    expect(existsSync(repo.getConfigPath())).toBe(false);
    expect(existsSync(repo.getLegacyConfigPath())).toBe(false);
    expect(await repo.read()).toBeNull();
  });

  it("clear returns an empty list when nothing is stored", async () => {
    const repo = new AiConfigFileRepository({ cwd, configDir });
    expect(await repo.clear()).toEqual([]);
  });

  it("prefers the user config directory over a legacy file", async () => {
    const repo = new AiConfigFileRepository({ cwd, configDir });
    await repo.write(VALID_CONFIG);
    const legacyConfig: AiCliConfig = {
      ...VALID_CONFIG,
      ai: { ...VALID_CONFIG.ai, model: "legacy-model" },
    };
    writeFileSync(path.join(cwd, AI_CLI_CONFIG_FILENAME), JSON.stringify(legacyConfig), "utf-8");

    const loaded = await repo.read();
    expect(loaded?.ai.model).toBe(VALID_CONFIG.ai.model);
  });
});
