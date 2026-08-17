import { describe, it, expect } from "vitest";
import { parseAiCliConfig } from "../ai/core/models/parse-ai-cli-config";
import type { AiCliConfig } from "../ai/core/models/ai-cli-config";

const VALID: AiCliConfig = {
  version: 1,
  ai: {
    provider: "claude",
    model: "claude-3-5-sonnet-20240620",
    apiKey: "key",
    paths: ["src", "docs"],
    languages: ["en"],
    outputDir: "gitpagedocs/docs",
    filePrefix: "ai",
    contextPrompt: "",
  },
};

describe("parseAiCliConfig", () => {
  it("accepts a valid version-1 config unchanged", () => {
    expect(parseAiCliConfig(VALID)).toEqual(VALID);
  });

  it("accepts an Ollama config with baseUrl and no apiKey", () => {
    const ollama: AiCliConfig = {
      version: 1,
      ai: { ...VALID.ai, provider: "ollama", apiKey: undefined, baseUrl: "http://localhost:11434" },
    };
    const parsed = parseAiCliConfig(JSON.parse(JSON.stringify(ollama)));
    expect(parsed?.ai.baseUrl).toBe("http://localhost:11434");
    expect(parsed?.ai.apiKey).toBeUndefined();
  });

  it("strips unknown fields", () => {
    const parsed = parseAiCliConfig({ ...VALID, extra: true, ai: { ...VALID.ai, injected: "x" } });
    expect(parsed).toEqual(VALID);
    expect(parsed && "extra" in parsed).toBe(false);
    expect(parsed && "injected" in parsed.ai).toBe(false);
  });

  it("fills prompt defaults for a minimal hand-edited config", () => {
    const parsed = parseAiCliConfig({ version: 1, ai: { provider: "openai", apiKey: "k" } });
    expect(parsed).toEqual({
      version: 1,
      ai: {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: "k",
        paths: [],
        languages: ["en", "pt", "es"],
        outputDir: "gitpagedocs/docs",
        filePrefix: "ai-generated",
        contextPrompt: "",
      },
    });
  });

  it("coerces malformed optional fields instead of rejecting the config", () => {
    const parsed = parseAiCliConfig({
      version: 1,
      ai: {
        provider: "gemini",
        model: "  ",
        apiKey: 42,
        paths: "src",
        languages: ["fr", "pt"],
        outputDir: null,
        filePrefix: 7,
        contextPrompt: ["x"],
      },
    });
    expect(parsed?.ai).toEqual({
      provider: "gemini",
      model: "gemini-1.5-flash",
      paths: [],
      languages: ["pt"],
      outputDir: "gitpagedocs/docs",
      filePrefix: "ai-generated",
      contextPrompt: "",
    });
    expect(parsed?.ai.apiKey).toBeUndefined();
  });

  it.each([
    ["null", null],
    ["non-object", "text"],
    ["wrong version", { ...VALID, version: 2 }],
    ["missing ai", { version: 1 }],
    ["missing provider", { version: 1, ai: { ...VALID.ai, provider: undefined } }],
    ["unknown provider", { version: 1, ai: { ...VALID.ai, provider: "other" } }],
  ])("rejects %s", (_label, raw) => {
    expect(parseAiCliConfig(raw)).toBeNull();
  });
});
