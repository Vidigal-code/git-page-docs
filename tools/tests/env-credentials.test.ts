import { describe, it, expect } from "vitest";
import { resolveApiKeyFromEnv, detectConfiguredProviders } from "../src/ai/env-credentials";
import { PROVIDER_CATALOG, ALL_PROVIDER_IDS } from "../src/ai/catalog";

describe("resolveApiKeyFromEnv", () => {
  it("reads the catalog-declared env var", () => {
    expect(resolveApiKeyFromEnv("openai", { OPENAI_API_KEY: "k" })).toBe("k");
    expect(resolveApiKeyFromEnv("anthropic", { ANTHROPIC_API_KEY: "k2" })).toBe("k2");
  });

  it("honors priority order and trims", () => {
    expect(resolveApiKeyFromEnv("gemini", { GOOGLE_API_KEY: "g" })).toBe("g");
    expect(resolveApiKeyFromEnv("gemini", { GEMINI_API_KEY: " first ", GOOGLE_API_KEY: "g" })).toBe("first");
  });

  it("returns undefined when unset or for keyless providers", () => {
    expect(resolveApiKeyFromEnv("openai", {})).toBeUndefined();
    expect(resolveApiKeyFromEnv("ollama", { OPENAI_API_KEY: "k" })).toBeUndefined();
  });
});

describe("detectConfiguredProviders", () => {
  it("lists only providers with a key present", () => {
    const detected = detectConfiguredProviders({ OPENAI_API_KEY: "k", XAI_API_KEY: "x" });
    expect(detected).toContain("openai");
    expect(detected).toContain("xai");
    expect(detected).not.toContain("anthropic");
  });
});

describe("catalog envVars contract", () => {
  it("declares envVars for every provider; keyed providers have at least one", () => {
    for (const id of ALL_PROVIDER_IDS) {
      const spec = PROVIDER_CATALOG[id];
      expect(Array.isArray(spec.envVars)).toBe(true);
      if (spec.auth !== "none") {
        expect(spec.envVars.length, `${id} should declare an env var`).toBeGreaterThan(0);
      }
    }
  });
});
