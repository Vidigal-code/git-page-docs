import { describe, it, expect } from "vitest";
import { WebStorageVaultStorage } from "../src/security/web-storage-vault-storage";
import type { WebStorageLike } from "../src/cache/web-storage-cache";
import { buildAuthHeaders, resolveBaseUrl, toOpenAiMessages } from "../src/ai/providers/shared";
import { getProviderSpec } from "../src/ai/catalog";
import { AnthropicProvider } from "../src/ai/providers/anthropic-provider";
import { ProviderError } from "../src/errors/app-error";
import type { FetchLike } from "../src/ai/http/streaming";
import type { GenerateRequest, ProviderConfig } from "../src/ports/ai";

class FakeStorage implements WebStorageLike {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? (this.m.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  get length() {
    return this.m.size;
  }
}

describe("WebStorageVaultStorage", () => {
  it("loads null when empty, persists and reloads", async () => {
    const s = new WebStorageVaultStorage(new FakeStorage());
    expect(await s.load()).toBeNull();
    await s.save("{\"v\":1}");
    expect(await s.load()).toBe("{\"v\":1}");
  });

  it("treats whitespace-only as null", async () => {
    const storage = new FakeStorage();
    storage.setItem("gitpagedocs:vault", "   ");
    expect(await new WebStorageVaultStorage(storage).load()).toBeNull();
  });
});

describe("provider shared helpers", () => {
  const cfg = (over: Partial<ProviderConfig> = {}): ProviderConfig => ({ providerId: "openai", model: "m", ...over });

  it("builds auth headers for each auth style", () => {
    expect(buildAuthHeaders(getProviderSpec("openai"), cfg({ apiKey: "k" })).Authorization).toBe("Bearer k");
    expect(buildAuthHeaders(getProviderSpec("azure-openai"), cfg({ apiKey: "k", baseUrl: "https://x" }))["api-key"]).toBe("k");
    expect(buildAuthHeaders(getProviderSpec("ollama"), cfg()).Authorization).toBeUndefined();
    expect(buildAuthHeaders(getProviderSpec("gemini"), cfg({ apiKey: "k" })).Authorization).toBeUndefined();
  });

  it("throws when a required key is missing", () => {
    expect(() => buildAuthHeaders(getProviderSpec("openai"), cfg())).toThrow(ProviderError);
  });

  it("resolveBaseUrl uses override and enforces requiresBaseUrl", () => {
    expect(resolveBaseUrl(getProviderSpec("openai"), cfg({ baseUrl: "https://o/" }))).toBe("https://o");
    expect(() => resolveBaseUrl(getProviderSpec("azure-openai"), cfg())).toThrow(ProviderError);
  });

  it("maps image attachments into OpenAI content parts", () => {
    const req: GenerateRequest = {
      system: "sys",
      messages: [{ role: "user", content: "look", attachments: [{ kind: "image", mimeType: "image/png", data: "AAA" }] }],
    };
    const mapped = toOpenAiMessages(req) as Array<{ role: string; content: unknown }>;
    expect(mapped[0]).toEqual({ role: "system", content: "sys" });
    expect(Array.isArray(mapped[1].content)).toBe(true);
  });
});

describe("anthropic image attachments", () => {
  it("sends a base64 image source block", async () => {
    let captured: RequestInit | undefined;
    const fetchImpl = (async (_u: string | URL | Request, init?: RequestInit) => {
      captured = init;
      return new Response('data: {"type":"content_block_delta","delta":{"text":"ok"}}\n\n', { status: 200 });
    }) as FetchLike;
    const provider = new AnthropicProvider(getProviderSpec("anthropic"), fetchImpl);
    const req: GenerateRequest = {
      messages: [{ role: "user", content: "describe", attachments: [{ kind: "image", mimeType: "image/jpeg", data: "ZZZ" }] }],
    };
    const res = await provider.generate(req, { providerId: "anthropic", model: "m", apiKey: "k" });
    expect(res.text).toBe("ok");
    expect(String(captured?.body)).toContain("base64");
    expect(String(captured?.body)).toContain("ZZZ");
  });
});
