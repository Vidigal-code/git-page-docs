import type { AIProvider, ProviderRegistration } from "../ports/ai";
import { PROVIDER_CATALOG, type ProviderFamily, type ProviderSpec } from "./catalog";
import { InMemoryProviderRegistry } from "./registry";
import { RegistryProviderFactory } from "./factory";
import { CatalogModelRegistry } from "./model-registry";
import type { FetchLike } from "./http/streaming";
import { OpenAiCompatibleProvider } from "./providers/openai-compatible-provider";
import { AnthropicProvider } from "./providers/anthropic-provider";
import { GeminiProvider } from "./providers/gemini-provider";
import { OllamaProvider } from "./providers/ollama-provider";
import { CohereProvider } from "./providers/cohere-provider";

/** Maps a provider family to its adapter constructor (small Factory table). */
type AdapterCtor = new (spec: ProviderSpec, fetchImpl?: FetchLike) => AIProvider;

const FAMILY_ADAPTERS: Record<ProviderFamily, AdapterCtor> = {
  "openai-compatible": OpenAiCompatibleProvider,
  anthropic: AnthropicProvider,
  gemini: GeminiProvider,
  ollama: OllamaProvider,
  cohere: CohereProvider,
};

function toRegistration(spec: ProviderSpec, fetchImpl?: FetchLike): ProviderRegistration {
  const Adapter = FAMILY_ADAPTERS[spec.family];
  return {
    id: spec.id,
    label: spec.label,
    defaultModel: spec.defaultModel,
    capabilities: spec.capabilities,
    create: () => new Adapter(spec, fetchImpl),
  };
}

/** Registry pre-populated with every catalog provider. */
export function createDefaultRegistry(fetchImpl?: FetchLike): InMemoryProviderRegistry {
  const registry = new InMemoryProviderRegistry();
  for (const spec of Object.values(PROVIDER_CATALOG)) {
    registry.register(toRegistration(spec, fetchImpl));
  }
  return registry;
}

export function createDefaultFactory(fetchImpl?: FetchLike): RegistryProviderFactory {
  return new RegistryProviderFactory(createDefaultRegistry(fetchImpl));
}

export function createModelRegistry(): CatalogModelRegistry {
  return new CatalogModelRegistry();
}
