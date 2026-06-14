import type { AiProviderId, ModelDescriptor, ProviderCapabilities } from "../ports/ai";

/**
 * Single source of truth for AI providers. Adding a provider = adding a catalog
 * entry; the registry/factory are data-driven, so there is no switch to grow.
 */
export type ProviderFamily =
  | "openai-compatible"
  | "anthropic"
  | "gemini"
  | "ollama"
  | "cohere";

export type AuthStyle = "bearer" | "x-api-key" | "query-key" | "api-key-header" | "none";

export interface ProviderSpec {
  readonly id: AiProviderId;
  readonly label: string;
  readonly family: ProviderFamily;
  readonly defaultModel: string;
  /** Default API base URL (without the chat path). */
  readonly baseUrl: string;
  /** Provider needs a user-supplied baseUrl (Azure deployment, local Ollama). */
  readonly requiresBaseUrl?: boolean;
  readonly auth: AuthStyle;
  readonly capabilities: ProviderCapabilities;
  readonly models: readonly ModelDescriptor[];
}

const TEXT: ProviderCapabilities = { streaming: true, vision: false, audio: false };
const VISION: ProviderCapabilities = { streaming: true, vision: true, audio: false };
const VISION_AUDIO: ProviderCapabilities = { streaming: true, vision: true, audio: true };

function models(...ids: string[]): ModelDescriptor[] {
  return ids.map((id) => ({ id }));
}

export const PROVIDER_CATALOG: Readonly<Record<AiProviderId, ProviderSpec>> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    family: "openai-compatible",
    defaultModel: "gpt-4o-mini",
    baseUrl: "https://api.openai.com/v1",
    auth: "bearer",
    capabilities: VISION,
    models: models("gpt-4o", "gpt-4o-mini", "o3-mini", "o1"),
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    family: "anthropic",
    // Latest Claude API model IDs.
    defaultModel: "claude-sonnet-4-6",
    baseUrl: "https://api.anthropic.com/v1",
    auth: "x-api-key",
    capabilities: VISION,
    models: models("claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"),
  },
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    family: "gemini",
    defaultModel: "gemini-2.0-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    auth: "query-key",
    capabilities: VISION_AUDIO,
    models: models("gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"),
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    family: "openai-compatible",
    defaultModel: "openai/gpt-4o-mini",
    baseUrl: "https://openrouter.ai/api/v1",
    auth: "bearer",
    capabilities: VISION,
    models: models("openai/gpt-4o-mini", "anthropic/claude-sonnet-4-6", "google/gemini-2.0-flash-exp"),
  },
  ollama: {
    id: "ollama",
    label: "Ollama (local)",
    family: "ollama",
    defaultModel: "llama3",
    baseUrl: "http://localhost:11434",
    requiresBaseUrl: false,
    auth: "none",
    capabilities: VISION,
    models: models("llama3", "llama3.1", "mistral", "qwen2.5"),
  },
  "azure-openai": {
    id: "azure-openai",
    label: "Azure OpenAI",
    family: "openai-compatible",
    defaultModel: "gpt-4o-mini",
    baseUrl: "",
    requiresBaseUrl: true,
    auth: "api-key-header",
    capabilities: VISION,
    models: models("gpt-4o", "gpt-4o-mini"),
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    family: "openai-compatible",
    defaultModel: "mistral-large-latest",
    baseUrl: "https://api.mistral.ai/v1",
    auth: "bearer",
    capabilities: TEXT,
    models: models("mistral-large-latest", "mistral-small-latest", "open-mistral-nemo"),
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    family: "openai-compatible",
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
    auth: "bearer",
    capabilities: TEXT,
    models: models("deepseek-chat", "deepseek-reasoner"),
  },
  cohere: {
    id: "cohere",
    label: "Cohere",
    family: "cohere",
    defaultModel: "command-r-plus",
    baseUrl: "https://api.cohere.com/v2",
    auth: "bearer",
    capabilities: TEXT,
    models: models("command-r-plus", "command-r"),
  },
  groq: {
    id: "groq",
    label: "Groq",
    family: "openai-compatible",
    defaultModel: "llama-3.3-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
    auth: "bearer",
    capabilities: TEXT,
    models: models("llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"),
  },
  xai: {
    id: "xai",
    label: "xAI Grok",
    family: "openai-compatible",
    defaultModel: "grok-2-latest",
    baseUrl: "https://api.x.ai/v1",
    auth: "bearer",
    capabilities: VISION,
    models: models("grok-2-latest", "grok-2-vision-latest"),
  },
  together: {
    id: "together",
    label: "Together AI",
    family: "openai-compatible",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    baseUrl: "https://api.together.xyz/v1",
    auth: "bearer",
    capabilities: TEXT,
    models: models("meta-llama/Llama-3.3-70B-Instruct-Turbo", "mistralai/Mixtral-8x7B-Instruct-v0.1"),
  },
  fireworks: {
    id: "fireworks",
    label: "Fireworks AI",
    family: "openai-compatible",
    defaultModel: "accounts/fireworks/models/llama-v3p3-70b-instruct",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    auth: "bearer",
    capabilities: TEXT,
    models: models("accounts/fireworks/models/llama-v3p3-70b-instruct"),
  },
  perplexity: {
    id: "perplexity",
    label: "Perplexity",
    family: "openai-compatible",
    defaultModel: "sonar",
    baseUrl: "https://api.perplexity.ai",
    auth: "bearer",
    capabilities: TEXT,
    models: models("sonar", "sonar-pro", "sonar-reasoning"),
  },
};

export const ALL_PROVIDER_IDS = Object.keys(PROVIDER_CATALOG) as AiProviderId[];

export function getProviderSpec(id: AiProviderId): ProviderSpec {
  return PROVIDER_CATALOG[id];
}
