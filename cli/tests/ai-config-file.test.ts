import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "node:os";
import path from "node:path";
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
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
    const repo = new AiConfigFileRepository({ configDir });
    expect(await repo.read()).toBeNull();
  });

  it("writes to the user config directory and round-trips through read", async () => {
    const repo = new AiConfigFileRepository({ configDir });
    await repo.write(VALID_CONFIG);

    expect(repo.getConfigPath()).toBe(path.join(configDir, AI_CLI_CONFIG_FILENAME));
    expect(existsSync(repo.getConfigPath())).toBe(true);
    expect(await repo.read()).toEqual(VALID_CONFIG);
  });

  it("restricts file permissions to the owner on POSIX", async (context) => {
    context.skip(process.platform === "win32", "File modes are not enforced on Windows.");
    const repo = new AiConfigFileRepository({ configDir });
    await repo.write(VALID_CONFIG);
    expect(statSync(repo.getConfigPath()).mode & 0o777).toBe(0o600);
  });

  it("ignores a .gitpagedocsconfig left in the working directory", async () => {
    writeFileSync(path.join(cwd, AI_CLI_CONFIG_FILENAME), JSON.stringify(VALID_CONFIG), "utf-8");
    const repo = new AiConfigFileRepository({ configDir });

    expect(await repo.read()).toBeNull();
    expect(existsSync(repo.getConfigPath())).toBe(false);
  });

  it("clear removes the stored config and wipes credentials", async () => {
    const repo = new AiConfigFileRepository({ configDir });
    await repo.write(VALID_CONFIG);

    const removed = await repo.clear();

    expect(removed).toEqual([path.resolve(repo.getConfigPath())]);
    expect(existsSync(repo.getConfigPath())).toBe(false);
    expect(await repo.read()).toBeNull();
  });

  it("clear returns an empty list when nothing is stored", async () => {
    const repo = new AiConfigFileRepository({ configDir });
    expect(await repo.clear()).toEqual([]);
  });

});
