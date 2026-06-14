#!/usr/bin/env node
/**
 * Phase 5 self-test for tools/src/ai. Verifies the 14-provider registry, the
 * factory, the model registry, and per-family streaming + auth-header
 * construction using a fake fetch (no network, no API keys).
 */
import type { AiProviderId, GenerateRequest, ProviderConfig } from "../src/ports/ai";
import {
  ALL_PROVIDER_IDS,
  PROVIDER_CATALOG,
  createDefaultRegistry,
  createDefaultFactory,
  createModelRegistry,
} from "../src/ai";
import type { FetchLike } from "../src/ai/http/streaming";
import { ProviderError } from "../src/errors/app-error";

let failures = 0;
function check(label: string, cond: boolean, detail = ""): void {
  if (cond) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const EXPECTED_14: AiProviderId[] = [
  "openai", "anthropic", "gemini", "openrouter", "ollama", "azure-openai",
  "mistral", "deepseek", "cohere", "groq", "xai", "together", "fireworks", "perplexity",
];

/** Records the last request and returns a canned streaming Response. */
function fakeFetch(streamBody: string): { fetch: FetchLike; lastInit: () => RequestInit | undefined } {
  let captured: RequestInit | undefined;
  const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
    captured = init;
    return new Response(streamBody, { status: 200, headers: { "content-type": "text/event-stream" } });
  }) as FetchLike;
  return { fetch: fetchImpl, lastInit: () => captured };
}

const REQUEST: GenerateRequest = { messages: [{ role: "user", content: "hi" }], system: "be brief" };
const KEYED: ProviderConfig = { providerId: "openai", model: "", apiKey: "sk-test-key" };

async function main(): Promise<void> {
  console.log("[smoke:ai] registry + catalog");
  const registry = createDefaultRegistry();
  check("catalog has 14 providers", ALL_PROVIDER_IDS.length === 14, String(ALL_PROVIDER_IDS.length));
  for (const id of EXPECTED_14) {
    check(`registry has ${id}`, registry.has(id));
  }

  console.log("[smoke:ai] factory instantiates every provider");
  const factory = createDefaultFactory();
  for (const id of EXPECTED_14) {
    const p = factory.create(id);
    check(`factory.create(${id}) -> provider with id`, p.id === id, p.id);
    check(`${id} declares capabilities`, typeof p.capabilities.streaming === "boolean");
  }
  let unknownThrew = false;
  try {
    factory.create("does-not-exist" as AiProviderId);
  } catch (e) {
    unknownThrew = e instanceof ProviderError;
  }
  check("unknown provider throws ProviderError", unknownThrew);

  console.log("[smoke:ai] model registry");
  const models = createModelRegistry();
  check("openai default model from catalog", models.defaultModel("openai") === PROVIDER_CATALOG.openai.defaultModel);
  check("anthropic uses latest claude default", models.defaultModel("anthropic") === "claude-sonnet-4-6");
  check("openai lists models", models.list("openai").length > 0);

  console.log("[smoke:ai] streaming per family");
  // OpenAI-compatible
  {
    const f = fakeFetch(
      'data: {"choices":[{"delta":{"content":"He"}}]}\n\n' +
        'data: {"choices":[{"delta":{"content":"llo"}}]}\n\n' +
        "data: [DONE]\n\n",
    );
    const res = await createDefaultFactory(f.fetch).create("openai").generate(REQUEST, KEYED);
    check("openai-compatible accumulates stream", res.text === "Hello", res.text);
    const auth = (f.lastInit()?.headers as Record<string, string>)?.Authorization;
    check("openai uses Bearer auth", auth === "Bearer sk-test-key", auth);
  }
  // Anthropic
  {
    const f = fakeFetch(
      'data: {"type":"content_block_delta","delta":{"text":"Hi"}}\n\n' +
        'data: {"type":"content_block_delta","delta":{"text":" there"}}\n\n',
    );
    const res = await createDefaultFactory(f.fetch).create("anthropic").generate(REQUEST, {
      providerId: "anthropic", model: "", apiKey: "sk-ant",
    });
    check("anthropic accumulates content_block_delta", res.text === "Hi there", res.text);
    const headers = f.lastInit()?.headers as Record<string, string>;
    check("anthropic uses x-api-key", headers?.["x-api-key"] === "sk-ant");
    check("anthropic sets anthropic-version", headers?.["anthropic-version"] === "2023-06-01");
  }
  // Gemini
  {
    const f = fakeFetch(
      'data: {"candidates":[{"content":{"parts":[{"text":"Ge"}]}}]}\n\n' +
        'data: {"candidates":[{"content":{"parts":[{"text":"mini"}]}}]}\n\n',
    );
    const res = await createDefaultFactory(f.fetch).create("gemini").generate(REQUEST, {
      providerId: "gemini", model: "", apiKey: "g-key",
    });
    check("gemini accumulates candidate parts", res.text === "Gemini", res.text);
  }
  // Ollama (NDJSON, no auth)
  {
    const f = fakeFetch('{"message":{"content":"Ol"}}\n{"message":{"content":"lama"},"done":true}\n');
    const res = await createDefaultFactory(f.fetch).create("ollama").generate(REQUEST, {
      providerId: "ollama", model: "",
    });
    check("ollama accumulates NDJSON", res.text === "Ollama", res.text);
  }
  // Cohere
  {
    const f = fakeFetch(
      'data: {"type":"content-delta","delta":{"message":{"content":{"text":"Co"}}}}\n\n' +
        'data: {"type":"content-delta","delta":{"message":{"content":{"text":"here"}}}}\n\n',
    );
    const res = await createDefaultFactory(f.fetch).create("cohere").generate(REQUEST, {
      providerId: "cohere", model: "", apiKey: "co-key",
    });
    check("cohere accumulates content-delta", res.text === "Cohere", res.text);
  }

  console.log("[smoke:ai] missing key is rejected");
  let keyRejected = false;
  try {
    await createDefaultFactory(fakeFetch("").fetch).create("openai").generate(REQUEST, {
      providerId: "openai", model: "",
    });
  } catch (e) {
    keyRejected = e instanceof ProviderError;
  }
  check("openai without apiKey throws ProviderError", keyRejected);

  if (failures > 0) {
    console.error(`\n[smoke:ai] FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log("\n[smoke:ai] OK - shared AI system verified.");
}

main().catch((err) => {
  console.error("[smoke:ai] crashed:", err);
  process.exit(1);
});
