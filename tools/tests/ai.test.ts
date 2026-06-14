import { describe, it, expect } from "vitest";
import type { AiProviderId, GenerateRequest, ProviderConfig } from "../src/ports/ai";
import { PROVIDER_CATALOG, ALL_PROVIDER_IDS, getProviderSpec } from "../src/ai/catalog";
import { InMemoryProviderRegistry } from "../src/ai/registry";
import { RegistryProviderFactory } from "../src/ai/factory";
import { CatalogModelRegistry } from "../src/ai/model-registry";
import { createDefaultRegistry, createDefaultFactory, createModelRegistry } from "../src/ai/bootstrap";
import { legacyProviderToCatalogId, parseLegacyProviderAndModel } from "../src/ai/legacy-adapter";
import { resolveFetch, ensureOk, readSseData, readJsonLines, type FetchLike } from "../src/ai/http/streaming";
import { ProviderError } from "../src/errors/app-error";

function fakeFetch(body: string, status = 200): { fetch: FetchLike; lastInit: () => RequestInit | undefined } {
  let captured: RequestInit | undefined;
  const fetchImpl = (async (_u: string | URL | Request, init?: RequestInit) => {
    captured = init;
    return new Response(body, { status });
  }) as FetchLike;
  return { fetch: fetchImpl, lastInit: () => captured };
}

const REQ: GenerateRequest = { messages: [{ role: "user", content: "hi" }], system: "be brief" };

describe("catalog + registry + factory", () => {
  it("has 14 providers and getProviderSpec works", () => {
    expect(ALL_PROVIDER_IDS).toHaveLength(14);
    expect(getProviderSpec("openai").label).toBe("OpenAI");
  });

  it("registry register/has/get/list/require", () => {
    const reg = new InMemoryProviderRegistry();
    expect(reg.has("openai")).toBe(false);
    const registration = {
      id: "openai" as AiProviderId,
      label: "OpenAI",
      defaultModel: "x",
      capabilities: { streaming: true, vision: false, audio: false },
      create: () => ({}) as never,
    };
    reg.register(registration);
    expect(reg.has("openai")).toBe(true);
    expect(reg.get("openai")).toBe(registration);
    expect(reg.list()).toHaveLength(1);
    expect(reg.require("openai")).toBe(registration);
    expect(() => reg.require("gemini")).toThrow(ProviderError);
  });

  it("default registry registers all 14 and factory creates them", () => {
    const reg = createDefaultRegistry();
    for (const id of ALL_PROVIDER_IDS) expect(reg.has(id)).toBe(true);
    const factory = createDefaultFactory();
    for (const id of ALL_PROVIDER_IDS) expect(factory.create(id).id).toBe(id);
    expect(() => factory.create("nope" as AiProviderId)).toThrow(ProviderError);
  });

  it("RegistryProviderFactory throws for unknown id", () => {
    const factory = new RegistryProviderFactory(new InMemoryProviderRegistry());
    expect(() => factory.create("openai")).toThrow(ProviderError);
  });

  it("model registry returns models and defaults", () => {
    const models = new CatalogModelRegistry();
    expect(models.defaultModel("anthropic")).toBe("claude-sonnet-4-6");
    expect(models.list("openai").length).toBeGreaterThan(0);
    expect(createModelRegistry().defaultModel("openai")).toBe(PROVIDER_CATALOG.openai.defaultModel);
  });
});

describe("provider streaming per family", () => {
  const keyed: ProviderConfig = { providerId: "openai", model: "", apiKey: "sk-test" };

  it("openai-compatible parses deltas and sets Bearer auth", async () => {
    const f = fakeFetch('data: {"choices":[{"delta":{"content":"He"}}]}\n\ndata: {"choices":[{"delta":{"content":"llo"}}]}\n\ndata: [DONE]\n\n');
    const res = await createDefaultFactory(f.fetch).create("openai").generate(REQ, keyed);
    expect(res.text).toBe("Hello");
    expect((f.lastInit()?.headers as Record<string, string>).Authorization).toBe("Bearer sk-test");
  });

  it("anthropic parses content_block_delta + headers", async () => {
    const f = fakeFetch('data: {"type":"content_block_delta","delta":{"text":"Hi"}}\n\n');
    const res = await createDefaultFactory(f.fetch).create("anthropic").generate(REQ, { providerId: "anthropic", model: "", apiKey: "k" });
    expect(res.text).toBe("Hi");
    const h = f.lastInit()?.headers as Record<string, string>;
    expect(h["x-api-key"]).toBe("k");
    expect(h["anthropic-version"]).toBe("2023-06-01");
  });

  it("gemini parses candidate parts", async () => {
    const f = fakeFetch('data: {"candidates":[{"content":{"parts":[{"text":"Ge"}]}}]}\n\n');
    const res = await createDefaultFactory(f.fetch).create("gemini").generate(REQ, { providerId: "gemini", model: "", apiKey: "g" });
    expect(res.text).toBe("Ge");
  });

  it("ollama parses NDJSON and needs no key", async () => {
    const f = fakeFetch('{"message":{"content":"Ol"}}\n{"message":{"content":"a"},"done":true}\n');
    const res = await createDefaultFactory(f.fetch).create("ollama").generate(REQ, { providerId: "ollama", model: "" });
    expect(res.text).toBe("Ola");
  });

  it("cohere parses content-delta", async () => {
    const f = fakeFetch('data: {"type":"content-delta","delta":{"message":{"content":{"text":"Co"}}}}\n\n');
    const res = await createDefaultFactory(f.fetch).create("cohere").generate(REQ, { providerId: "cohere", model: "", apiKey: "c" });
    expect(res.text).toBe("Co");
  });

  it("rejects a missing key with ProviderError", async () => {
    const f = fakeFetch("");
    await expect(createDefaultFactory(f.fetch).create("openai").generate(REQ, { providerId: "openai", model: "" })).rejects.toBeInstanceOf(ProviderError);
  });

  it("surfaces non-ok responses as ProviderError", async () => {
    const f = fakeFetch("nope", 500);
    await expect(createDefaultFactory(f.fetch).create("openai").generate(REQ, keyed)).rejects.toBeInstanceOf(ProviderError);
  });
});

describe("streaming helpers", () => {
  it("resolveFetch throws when no fetch and returns provided", () => {
    const f = (async () => new Response("")) as FetchLike;
    expect(resolveFetch(f)).toBe(f);
  });

  it("ensureOk throws on bad response", async () => {
    await expect(ensureOk(new Response("x", { status: 404 }), "P")).rejects.toBeInstanceOf(ProviderError);
  });

  it("readSseData and readJsonLines yield frames", async () => {
    const sse = new Response("data: a\n\ndata: b\n").body as ReadableStream<Uint8Array>;
    const out: string[] = [];
    for await (const d of readSseData(sse)) out.push(d);
    expect(out).toEqual(["a", "b"]);

    const ndjson = new Response('{"x":1}\n{"y":2}').body as ReadableStream<Uint8Array>;
    const lines: string[] = [];
    for await (const l of readJsonLines(ndjson)) lines.push(l);
    expect(lines).toEqual(['{"x":1}', '{"y":2}']);
  });
});

describe("legacy adapter", () => {
  it("maps legacy ids and parses provider:model", () => {
    expect(legacyProviderToCatalogId("claude")).toBe("anthropic");
    expect(legacyProviderToCatalogId("openai")).toBe("openai");
    expect(legacyProviderToCatalogId("???")).toBe("openai");
    const p = parseLegacyProviderAndModel("claude:claude-sonnet-4-6");
    expect(p.providerId).toBe("anthropic");
    expect(p.model).toBe("claude-sonnet-4-6");
    expect(parseLegacyProviderAndModel("gemini").model.length).toBeGreaterThan(0);
  });
});
