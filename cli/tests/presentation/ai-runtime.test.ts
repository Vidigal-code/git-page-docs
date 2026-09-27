import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AiMessage, GenerateRequest, ProviderConfig } from "@gitpagedocs/tools/ports";
import type { AiCliConfig, AiCliRunPlan } from "../../ai/core/models/ai-cli-config";
import type { ILLMProvider } from "../../ai/core/ports/illm-provider";

const aiPrompts = vi.hoisted(() => ({
  runAiInteractivePrompt: vi.fn<(existing?: AiCliConfig | null) => Promise<AiCliRunPlan>>(),
  promptMissingDirectories: vi.fn<(missing: string[]) => Promise<{ replacementPaths: string[]; abort: boolean }>>(),
}));
vi.mock("../../ai/presentation/ai-prompts", () => aiPrompts);

const llm = vi.hoisted(() => ({
  generate: vi.fn<(request: GenerateRequest, config: ProviderConfig) => Promise<{ text: string; model: string }>>(),
}));
vi.mock("@gitpagedocs/tools/ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@gitpagedocs/tools/ai")>();
  return {
    ...actual,
    createDefaultFactory: () => ({ create: () => ({ generate: llm.generate }) }),
  };
});

import { executeAiRunPlan, runAiCliCommand } from "../../ai/application/run-ai-cli-command";
import { createAiProvider } from "../../ai/application/ai-provider-factory";
import { AiCommandService } from "../../ai/application/ai-command";
import { ToolsLlmProvider } from "../../ai/infrastructure/llm/tools-llm-provider";
import { FileSystemAdapter } from "../../ai/infrastructure/file-system-adapter";
import { writeVersionDocs } from "../../ai/infrastructure/version-docs-writer";
import { AiConfigFileRepository } from "../../ai/infrastructure/ai-config-file";
import { AI_KEY_VAULT_FILENAME, AiKeyVault } from "../../ai/infrastructure/ai-key-vault";
import { resolveChatCredentials } from "../../ai/application/resolve-chat-credentials";
import { AI_CLI_CONFIG_FILENAME } from "../../ai/core/models/ai-cli-config";
import { DEFAULT_AI_DOC_PROMPT } from "../../ai/config";

const CONFIG: AiCliConfig = {
  version: 1,
  ai: {
    provider: "openai",
    model: "gpt-4o-mini",
    apiKey: "sk-test",
    paths: ["missing-dir"],
    languages: ["en"],
    outputDir: "gitpagedocs/docs",
    filePrefix: "ai",
    contextPrompt: "",
  },
};

/** Provider that records prompts and never produces pages (empty scan paths keep it idle). */
class IdleProvider implements ILLMProvider {
  readonly calls: string[] = [];
  async generateDocumentation(): Promise<string> {
    this.calls.push("generate");
    return "";
  }
  async chat(): Promise<string> {
    return "";
  }
}

const temporaryRoots: string[] = [];

function makeRoot(prefix: string): string {
  const root = mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

beforeEach(() => {
  aiPrompts.runAiInteractivePrompt.mockReset();
  aiPrompts.promptMissingDirectories.mockReset();
  llm.generate.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("runAiCliCommand", () => {
  it("migrates a legacy config, saves the plan, scaffolds first and runs the plan", async () => {
    const cwd = makeRoot("gpd-ai-cmd-");
    const configDir = path.join(makeRoot("gpd-ai-cmd-cfg-"), "gitpagedocs");
    vi.stubEnv("GITPAGEDOCS_CONFIG_DIR", configDir);
    writeFileSync(path.join(cwd, AI_CLI_CONFIG_FILENAME), JSON.stringify(CONFIG), "utf-8");

    const plan: AiCliRunPlan = { config: { ...CONFIG, ai: { ...CONFIG.ai, model: "gpt-4o" } }, saveConfig: true, runConfigScaffold: true };
    aiPrompts.runAiInteractivePrompt.mockResolvedValue(plan);
    aiPrompts.promptMissingDirectories.mockResolvedValue({ replacementPaths: [], abort: true });
    const messages: string[] = [];
    const onScaffold = vi.fn(async () => {
      messages.push("scaffold");
    });

    const passwordPrompt = { create: vi.fn(async () => "vault-pw"), unlock: vi.fn(async () => "vault-pw") };
    const result = await runAiCliCommand({ cwd, onInfo: (message) => messages.push(message), onScaffold, passwordPrompt, env: {} });

    expect(aiPrompts.runAiInteractivePrompt).toHaveBeenCalledWith(CONFIG);
    expect(messages[0]).toContain("[gitpagedocs:ai] Moved configuration from");
    const vaultPath = path.join(configDir, AI_KEY_VAULT_FILENAME);
    expect(messages).toContain(
      `[gitpagedocs:ai] Configuration saved to ${path.join(configDir, AI_CLI_CONFIG_FILENAME)} (API key encrypted in ${vaultPath})`,
    );
    expect(messages).toContain("[gitpagedocs] Generating base gitpagedocs structure...");
    expect(messages.indexOf("[gitpagedocs] Generating base gitpagedocs structure...")).toBeLessThan(messages.indexOf("scaffold"));
    expect(onScaffold).toHaveBeenCalledTimes(1);
    // First run: the password is created once, and the file never holds the key in clear.
    expect(passwordPrompt.create).toHaveBeenCalledTimes(1);
    expect(passwordPrompt.unlock).not.toHaveBeenCalled();
    const saved = JSON.parse(readFileSync(path.join(configDir, AI_CLI_CONFIG_FILENAME), "utf-8")) as AiCliConfig;
    expect(saved.ai.model).toBe("gpt-4o");
    expect(saved.ai.apiKey).toBeUndefined();
    expect(saved.ai.apiKeyEncrypted).toBe(true);
    expect(readFileSync(vaultPath, "utf-8")).not.toContain("sk-test");
    expect(await new AiKeyVault({ configDir }).getKey("vault-pw", "openai")).toBe("sk-test");
    expect(existsSync(path.join(cwd, AI_CLI_CONFIG_FILENAME))).toBe(false);
    expect(result).toEqual({
      summary: { scannedDirectories: [], skippedDirectories: ["missing-dir"], scannedFilesCount: 0, outputs: [] },
      runConfigScaffold: true,
    });
    expect(llm.generate).not.toHaveBeenCalled();
  });

  it("neither saves nor scaffolds when the plan says not to, and works without callbacks", async () => {
    const cwd = makeRoot("gpd-ai-cmd-");
    const configDir = path.join(makeRoot("gpd-ai-cmd-cfg-"), "gitpagedocs");
    vi.stubEnv("GITPAGEDOCS_CONFIG_DIR", configDir);
    aiPrompts.runAiInteractivePrompt.mockResolvedValue({ config: CONFIG, saveConfig: false, runConfigScaffold: false });
    aiPrompts.promptMissingDirectories.mockResolvedValue({ replacementPaths: [], abort: false });

    const result = await runAiCliCommand({ cwd });

    expect(aiPrompts.runAiInteractivePrompt).toHaveBeenCalledWith(null);
    expect(existsSync(path.join(configDir, AI_CLI_CONFIG_FILENAME))).toBe(false);
    expect(result.runConfigScaffold).toBe(false);
    expect(result.summary.skippedDirectories).toEqual(["missing-dir"]);
  });

  it("asks the vault password when reusing a stored config whose key is encrypted", async () => {
    const cwd = makeRoot("gpd-ai-cmd-");
    const configDir = path.join(makeRoot("gpd-ai-cmd-cfg-"), "gitpagedocs");
    vi.stubEnv("GITPAGEDOCS_CONFIG_DIR", configDir);
    const vault = new AiKeyVault({ configDir });
    await vault.initialize("vault-pw");
    await vault.setKey("vault-pw", "openai", "sk-test");
    const { apiKey: _plain, ...aiWithoutKey } = CONFIG.ai;
    await new AiConfigFileRepository({ cwd, configDir }).write({ ...CONFIG, ai: { ...aiWithoutKey, apiKeyEncrypted: true } });
    aiPrompts.runAiInteractivePrompt.mockImplementation(async (existing) => ({
      config: existing as AiCliConfig,
      saveConfig: false,
      runConfigScaffold: false,
    }));
    aiPrompts.promptMissingDirectories.mockResolvedValue({ replacementPaths: [], abort: false });
    const passwordPrompt = { create: vi.fn(async () => "never"), unlock: vi.fn(async () => "vault-pw") };

    const result = await runAiCliCommand({ cwd, passwordPrompt, env: {} });

    expect(aiPrompts.runAiInteractivePrompt).toHaveBeenCalledWith(expect.objectContaining({ ai: expect.objectContaining({ apiKeyEncrypted: true }) }));
    expect(passwordPrompt.unlock).toHaveBeenCalledTimes(1);
    expect(passwordPrompt.create).not.toHaveBeenCalled();
    expect(result.summary.skippedDirectories).toEqual(["missing-dir"]);
    // The file still carries no key after the run.
    const stored = JSON.parse(readFileSync(path.join(configDir, AI_CLI_CONFIG_FILENAME), "utf-8")) as AiCliConfig;
    expect(stored.ai.apiKey).toBeUndefined();
  });
});

describe("executeAiRunPlan missing-directory recovery", () => {
  it("re-scans the replacement paths the user typed", async () => {
    const cwd = makeRoot("gpd-ai-plan-");
    mkdirSync(path.join(cwd, "fixed"));
    aiPrompts.promptMissingDirectories.mockResolvedValue({ replacementPaths: ["fixed"], abort: false });
    const provider = new IdleProvider();

    const summary = await executeAiRunPlan({ config: CONFIG, saveConfig: false, runConfigScaffold: false }, cwd, () => provider);

    expect(aiPrompts.promptMissingDirectories).toHaveBeenCalledWith(["missing-dir"]);
    expect(summary).toEqual({ scannedDirectories: ["fixed"], skippedDirectories: [], scannedFilesCount: 0, outputs: [] });
    expect(provider.calls).toEqual([]);
  });

  it("keeps the files already found when the user skips the rest", async () => {
    const cwd = makeRoot("gpd-ai-plan-");
    mkdirSync(path.join(cwd, "src"));
    aiPrompts.promptMissingDirectories.mockResolvedValue({ replacementPaths: [], abort: false });
    const plan: AiCliRunPlan = {
      config: { ...CONFIG, ai: { ...CONFIG.ai, paths: ["src", "missing-dir"] } },
      saveConfig: false,
      runConfigScaffold: false,
    };

    const summary = await executeAiRunPlan(plan, cwd, () => new IdleProvider());

    expect(summary.scannedDirectories).toEqual(["src"]);
    expect(summary.skippedDirectories).toEqual(["missing-dir"]);
  });
});

describe("ToolsLlmProvider and the provider factory", () => {
  it("creates a tools-backed provider for the legacy provider id", () => {
    const provider = createAiProvider({ provider: "claude", model: "m", apiKey: "k", baseUrl: "http://x" });
    expect(provider).toBeInstanceOf(ToolsLlmProvider);
  });

  it("maps system messages into the request system field and forwards the config", async () => {
    llm.generate.mockResolvedValue({ text: "answer", model: "m" });
    const provider = new ToolsLlmProvider("claude", { model: "claude-x", apiKey: "k", baseUrl: "http://proxy" });

    const reply = await provider.chat([
      { role: "system", content: "rule one" },
      { role: "system", content: "rule two" },
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);

    expect(reply).toBe("answer");
    const [request, config] = llm.generate.mock.calls[0];
    expect(request.system).toBe("rule one\nrule two");
    expect(request.maxTokens).toBe(4000);
    expect(request.messages).toEqual<AiMessage[]>([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
    expect(config).toEqual({ providerId: "anthropic", model: "claude-x", apiKey: "k", baseUrl: "http://proxy" });
  });

  it("uses the default documentation prompt when no context is given and an empty model", async () => {
    llm.generate.mockResolvedValue({ text: "docs", model: "m" });
    const provider = new ToolsLlmProvider("openai", {});

    await provider.generateDocumentation("file body");
    await provider.generateDocumentation("file body", "custom prompt");

    expect(llm.generate.mock.calls[0][0].system).toBe(DEFAULT_AI_DOC_PROMPT);
    expect(llm.generate.mock.calls[0][0].messages).toEqual([{ role: "user", content: "file body" }]);
    expect(llm.generate.mock.calls[0][1].model).toBe("");
    expect(llm.generate.mock.calls[1][0].system).toBe("custom prompt");
  });

  it("omits the system field when no system message is present", async () => {
    llm.generate.mockResolvedValue({ text: "x", model: "m" });
    await new ToolsLlmProvider("gemini", { model: "g" }).chat([{ role: "user", content: "q" }]);
    expect(llm.generate.mock.calls[0][0].system).toBeUndefined();
  });
});

describe("AiCommandService", () => {
  it("wraps a chat prompt as a single user message", async () => {
    const chat = vi.fn(async () => "reply");
    const service = new AiCommandService({ generateDocumentation: async () => "", chat });
    await expect(service.runChat("question")).resolves.toBe("reply");
    expect(chat).toHaveBeenCalledWith([{ role: "user", content: "question" }]);
  });
});

describe("FileSystemAdapter", () => {
  it("treats files and unreadable paths as missing directories", () => {
    const cwd = makeRoot("gpd-fs-");
    writeFileSync(path.join(cwd, "file.ts"), "x", "utf-8");
    mkdirSync(path.join(cwd, "dir"));
    expect(new FileSystemAdapter(cwd).splitExistingDirectories(["dir", "file.ts", "nope"])).toEqual({
      existing: ["dir"],
      missing: ["file.ts", "nope"],
    });
  });

  it("skips dependency folders and non-source extensions while reading recursively", async () => {
    const cwd = makeRoot("gpd-fs-");
    mkdirSync(path.join(cwd, "src", "node_modules", "dep"), { recursive: true });
    writeFileSync(path.join(cwd, "src", "node_modules", "dep", "index.js"), "ignored", "utf-8");
    writeFileSync(path.join(cwd, "src", "keep.ts"), "kept", "utf-8");
    writeFileSync(path.join(cwd, "src", "image.png"), "binary", "utf-8");

    const files = await new FileSystemAdapter(cwd).readDirectoryRecursively("src");

    expect(files.map((file) => path.basename(file.filePath))).toEqual(["keep.ts"]);
    expect(files[0].content).toBe("kept");
    await expect(new FileSystemAdapter(cwd).readDirectoryRecursively("absent")).resolves.toEqual([]);
  });

  it("writes documentation output relative to its base directory", async () => {
    const cwd = makeRoot("gpd-fs-");
    const adapter = new FileSystemAdapter(cwd);
    await adapter.writeDocumentationOutput("# Docs", path.join("nested", "out.md"));
    await adapter.writeDocumentationOutput("# Default");
    expect(readFileSync(path.join(cwd, "nested", "out.md"), "utf-8")).toBe("# Docs");
    expect(readFileSync(path.join(cwd, "documentation-output.md"), "utf-8")).toBe("# Default");
  });
});

describe("writeVersionDocs guards", () => {
  it("refuses to write without pages", async () => {
    await expect(writeVersionDocs({ cwd: makeRoot("gpd-vdw-"), versionId: "v1", pagesByLang: { en: [] } })).rejects.toThrow(
      "No AI pages to write.",
    );
  });

  it("explains a missing version config after writing the markdown", async () => {
    const cwd = makeRoot("gpd-vdw-");
    await expect(
      writeVersionDocs({ cwd, versionId: "v1", pagesByLang: { en: [{ slug: "a", title: "A", body: "x" }] } }),
    ).rejects.toThrow("Version config not found at gitpagedocs/docs/versions/v1/config.json");
    expect(existsSync(path.join(cwd, "gitpagedocs", "docs", "versions", "v1", "pt", "a.md"))).toBe(true);
  });
});

describe("AiConfigFileRepository defaults", () => {
  it("resolves the user config directory and cwd when no options are given", () => {
    const configDir = path.join(makeRoot("gpd-cfg-default-"), "gitpagedocs");
    vi.stubEnv("GITPAGEDOCS_CONFIG_DIR", configDir);
    const repo = new AiConfigFileRepository();
    expect(repo.getConfigPath()).toBe(path.join(configDir, AI_CLI_CONFIG_FILENAME));
    expect(repo.getLegacyConfigPath()).toBe(path.join(process.cwd(), AI_CLI_CONFIG_FILENAME));
  });

  it("never migrates when the legacy and secure paths coincide", async () => {
    const cwd = makeRoot("gpd-cfg-same-");
    const repo = new AiConfigFileRepository({ cwd, configDir: cwd });
    await expect(repo.read()).resolves.toBeNull();
  });
});

describe("resolveChatCredentials default provider", () => {
  it("assumes openai when nothing is configured, and therefore needs a key", async () => {
    const creds = await resolveChatCredentials({ cwd: "/tmp", configRepo: { read: async () => null }, env: {} });
    expect(creds).toBeNull();
  });

  it("survives a config repository failure", async () => {
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      configRepo: { read: async () => Promise.reject(new Error("disk")) },
      env: { OPENAI_API_KEY: "k" },
    });
    expect(creds?.providerId).toBe("openai");
  });
});
