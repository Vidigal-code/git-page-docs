export type AiProviderId = 'openai' | 'claude' | 'gemini' | 'ollama';

export const AI_MODEL_DEFAULTS: Readonly<Record<AiProviderId, string>> = {
  openai: 'gpt-4o-mini',
  claude: 'claude-3-5-sonnet-20240620',
  gemini: 'gemini-1.5-flash',
  ollama: 'llama3',
};

export const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434';

export function resolveDefaultModel(provider: string | undefined): string {
  if (!provider) return AI_MODEL_DEFAULTS.openai;
  const key = provider as AiProviderId;
  return AI_MODEL_DEFAULTS[key] ?? AI_MODEL_DEFAULTS.openai;
}

export function normalizeProviderAndModel(providerAndModel: string | undefined): {
  provider: AiProviderId;
  model: string;
} {
  const [rawProvider, rawModel] = (providerAndModel || '').split(':');
  const provider = ((rawProvider || 'openai').trim() as AiProviderId) || 'openai';
  const fallback = resolveDefaultModel(provider);
  return {
    provider: AI_MODEL_DEFAULTS[provider] ? provider : 'openai',
    model: (rawModel || '').trim() || fallback,
  };
}

export function getProviderInputPlaceholder(providerAndModel: string): string {
  return providerAndModel.startsWith('ollama') ? OLLAMA_DEFAULT_BASE_URL : 'sk-...';
}
