import { describe, expect, it } from "vitest";
import { PROVIDER_CATALOG } from "../src/ai/catalog";

describe("provider catalog model labels", () => {
  const label = (provider: keyof typeof PROVIDER_CATALOG, id: string) =>
    PROVIDER_CATALOG[provider].models.find((m) => m.id === id)?.label;

  it("names every model of the providers the site chat offers", () => {
    for (const provider of ["openai", "anthropic", "gemini", "ollama"] as const) {
      for (const model of PROVIDER_CATALOG[provider].models) {
        expect(model.label, `${provider}/${model.id}`).toBeTruthy();
      }
    }
    expect(label("openai", "gpt-4o-mini")).toBe("GPT-4o mini");
    expect(label("anthropic", "claude-sonnet-4-6")).toBe("Sonnet 4.6");
    expect(label("gemini", "gemini-2.5-flash")).toBe("2.5 Flash");
    expect(label("ollama", "llama3")).toBe("Llama 3");
  });

  it("keeps ids as the contract (labels are optional decoration)", () => {
    for (const spec of Object.values(PROVIDER_CATALOG)) {
      expect(spec.models.map((m) => m.id)).toContain(spec.defaultModel);
      for (const model of spec.models) expect(typeof model.id).toBe("string");
    }
  });
});
