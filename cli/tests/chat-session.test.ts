import { describe, it, expect } from "vitest";
import { ChatSession } from "../ai/core/chat-session";
import { resolveChatCredentials } from "../ai/application/resolve-chat-credentials";
import type { AiCliConfig } from "../ai/core/models/ai-cli-config";

describe("ChatSession", () => {
  it("keeps the system prompt out of the message history", () => {
    const session = new ChatSession("  be concise  ");
    session.addUser("hi");
    session.addAssistant("hello");
    expect(session.system).toBe("be concise");
    expect(session.buildRequestMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
    expect(session.turnCount).toBe(2);
  });

  it("treats a blank system prompt as none", () => {
    expect(new ChatSession("   ").system).toBeUndefined();
    expect(new ChatSession().system).toBeUndefined();
  });

  it("clears history but keeps the system prompt", () => {
    const session = new ChatSession("sys");
    session.addUser("a");
    session.clear();
    expect(session.turnCount).toBe(0);
    expect(session.buildRequestMessages()).toEqual([]);
    expect(session.system).toBe("sys");
  });
});

describe("resolveChatCredentials", () => {
  const emptyConfigRepo = { read: async (): Promise<AiCliConfig | null> => null };

  it("resolves from the stored config first", async () => {
    const stored: AiCliConfig = {
      version: 1,
      ai: {
        provider: "claude",
        model: "claude-sonnet-4-6",
        apiKey: "stored-key",
        paths: [],
        languages: ["en"],
        outputDir: "",
        filePrefix: "",
        contextPrompt: "",
      },
    };
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      configRepo: { read: async () => stored },
      env: {},
    });
    expect(creds).toEqual({
      providerId: "anthropic",
      model: "claude-sonnet-4-6",
      apiKey: "stored-key",
      baseUrl: undefined,
    });
  });

  it("falls back to a catalog-declared env var", async () => {
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      providerOverride: "openai",
      configRepo: emptyConfigRepo,
      env: { OPENAI_API_KEY: "env-key" },
    });
    expect(creds?.providerId).toBe("openai");
    expect(creds?.apiKey).toBe("env-key");
  });

  it("auto-detects the provider from whichever env key is set", async () => {
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      configRepo: emptyConfigRepo,
      env: { GROQ_API_KEY: "gk" },
    });
    expect(creds?.providerId).toBe("groq");
    expect(creds?.apiKey).toBe("gk");
  });

  it("returns null when a keyed provider has no key", async () => {
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      providerOverride: "openai",
      configRepo: emptyConfigRepo,
      env: {},
    });
    expect(creds).toBeNull();
  });

  it("allows keyless providers (ollama) without a key", async () => {
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      providerOverride: "ollama",
      configRepo: emptyConfigRepo,
      env: {},
    });
    expect(creds?.providerId).toBe("ollama");
    expect(creds?.apiKey).toBeUndefined();
  });

  it("honors model override over the provider default", async () => {
    const creds = await resolveChatCredentials({
      cwd: "/tmp",
      providerOverride: "openai",
      modelOverride: "gpt-4o",
      configRepo: emptyConfigRepo,
      env: { OPENAI_API_KEY: "k" },
    });
    expect(creds?.model).toBe("gpt-4o");
  });
});
