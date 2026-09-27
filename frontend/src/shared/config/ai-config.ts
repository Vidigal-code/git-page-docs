/**
 * @file ai-config.ts
 * @description Provider/model choices of the in-site AI chat, driven by the
 * shared `@gitpagedocs/tools` catalog so the select only ever offers models the
 * providers still serve, and a stored "provider:model" whose model was retired
 * self-heals to the provider default instead of failing every request.
 */
import { PROVIDER_CATALOG } from '@gitpagedocs/tools/ai';
import type { AiProviderId as CatalogProviderId } from '@gitpagedocs/tools/ports';

/** Legacy frontend ids; stored "provider:model" strings keep using them. */
export type AiProviderId = 'openai' | 'claude' | 'gemini' | 'ollama';

const CATALOG_ID: Readonly<Record<AiProviderId, CatalogProviderId>> = {
  openai: 'openai',
  claude: 'anthropic',
  gemini: 'gemini',
  ollama: 'ollama',
};

const PROVIDER_IDS: readonly AiProviderId[] = ['openai', 'claude', 'gemini', 'ollama'];

const PROVIDER_LABELS: Readonly<Record<AiProviderId, string>> = {
  openai: 'OpenAI',
  claude: 'Anthropic Claude',
  gemini: 'Google Gemini',
  ollama: 'Ollama',
};

function catalogFor(provider: AiProviderId) {
  return PROVIDER_CATALOG[CATALOG_ID[provider]];
}

export function isAiProviderId(value: string | undefined): value is AiProviderId {
  return PROVIDER_IDS.includes(value as AiProviderId);
}

export const AI_MODEL_DEFAULTS: Readonly<Record<AiProviderId, string>> = {
  openai: catalogFor('openai').defaultModel,
  claude: catalogFor('claude').defaultModel,
  gemini: catalogFor('gemini').defaultModel,
  ollama: catalogFor('ollama').defaultModel,
};

export const OLLAMA_DEFAULT_BASE_URL = PROVIDER_CATALOG.ollama.baseUrl ?? 'http://localhost:11434';

/** Model ids the catalog lists for a provider, default first. */
export function listProviderModels(provider: AiProviderId): readonly string[] {
  const spec = catalogFor(provider);
  const others = spec.models.map((m) => m.id).filter((id) => id !== spec.defaultModel);
  return [spec.defaultModel, ...others];
}

export function isKnownModel(provider: AiProviderId, model: string): boolean {
  return listProviderModels(provider).includes(model);
}

export function resolveDefaultModel(provider: string | undefined): string {
  return isAiProviderId(provider) ? AI_MODEL_DEFAULTS[provider] : AI_MODEL_DEFAULTS.openai;
}

/**
 * Splits "provider:model". An unknown provider falls back to OpenAI and a model
 * the catalog no longer lists falls back to the provider default, so a choice
 * saved before a model was retired keeps working.
 */
export function normalizeProviderAndModel(providerAndModel: string | undefined): {
  provider: AiProviderId;
  model: string;
} {
  const [rawProvider, rawModel] = (providerAndModel || '').split(':');
  const candidate = (rawProvider || '').trim();
  const provider: AiProviderId = isAiProviderId(candidate) ? candidate : 'openai';
  const model = (rawModel || '').trim();
  return { provider, model: model && isKnownModel(provider, model) ? model : AI_MODEL_DEFAULTS[provider] };
}

export interface ProviderModelOption {
  provider: AiProviderId;
  /** The "provider:model" value stored for the chat. */
  value: string;
  label: string;
}

export interface ProviderOptionLabels {
  aiChatProviderOpenAI?: string;
  aiChatProviderClaude?: string;
  aiChatProviderGemini?: string;
  aiChatProviderOllama?: string;
}

const DEFAULT_LABEL_KEY: Readonly<Record<AiProviderId, keyof ProviderOptionLabels>> = {
  openai: 'aiChatProviderOpenAI',
  claude: 'aiChatProviderClaude',
  gemini: 'aiChatProviderGemini',
  ollama: 'aiChatProviderOllama',
};

/**
 * Options of the provider select: every catalog model of the four providers,
 * default model first per provider. The default model's label can be localized
 * through the langmenu; the other models show "<Provider> (<model>)".
 */
export function buildProviderModelOptions(labels: ProviderOptionLabels = {}): ProviderModelOption[] {
  return PROVIDER_IDS.flatMap((provider) =>
    listProviderModels(provider).map((model, index) => {
      const localized = index === 0 ? labels[DEFAULT_LABEL_KEY[provider]] : undefined;
      return {
        provider,
        value: `${provider}:${model}`,
        label: localized || `${PROVIDER_LABELS[provider]} (${model})`,
      };
    }),
  );
}

export function getProviderInputPlaceholder(providerAndModel: string): string {
  return providerAndModel.startsWith('ollama') ? OLLAMA_DEFAULT_BASE_URL : 'sk-...';
}
