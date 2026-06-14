// Shared AI system. Registry-driven (Strategy + Factory + Registry), consumed
// by the frontend, CLI and MCP. Adding a provider = a catalog entry.
export {
  PROVIDER_CATALOG,
  ALL_PROVIDER_IDS,
  getProviderSpec,
} from "./catalog";
export type { ProviderFamily, ProviderSpec, AuthStyle } from "./catalog";
export { InMemoryProviderRegistry } from "./registry";
export { RegistryProviderFactory } from "./factory";
export { CatalogModelRegistry } from "./model-registry";
export {
  createDefaultRegistry,
  createDefaultFactory,
  createModelRegistry,
} from "./bootstrap";
export type { FetchLike } from "./http/streaming";
export { OpenAiCompatibleProvider } from "./providers/openai-compatible-provider";
export { AnthropicProvider } from "./providers/anthropic-provider";
export { GeminiProvider } from "./providers/gemini-provider";
export { OllamaProvider } from "./providers/ollama-provider";
export { CohereProvider } from "./providers/cohere-provider";
export {
  legacyProviderToCatalogId,
  parseLegacyProviderAndModel,
} from "./legacy-adapter";
export type { ParsedLegacyProvider } from "./legacy-adapter";
