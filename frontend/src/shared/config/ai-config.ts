export type AiProviderId = 'openai' | 'claude' | 'gemini' | 'ollama';

export const AI_MODEL_DEFAULTS: Readonly<Record<AiProviderId, string>> = {
  openai: 'gpt-4o-mini',
  claude: 'claude-3-5-sonnet-20240620',
  gemini: 'gemini-1.5-flash',
  ollama: 'llama3',
};

export const DEFAULT_AI_DOC_PROMPT =
  'You are a senior tech writer. Describe the provided code.';

export const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434';

export const AI_ENDPOINTS = {
  openAiChatCompletions: 'https://api.openai.com/v1/chat/completions',
  claudeMessages: 'https://api.anthropic.com/v1/messages',
  geminiModelsBase: 'https://generativelanguage.googleapis.com/v1beta/models',
  ollamaChatPath: '/api/chat',
} as const;

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

export function buildGeminiStreamEndpoint(model: string, apiKey: string): string {
  const encodedModel = encodeURIComponent(model);
  const query = new URLSearchParams({ alt: 'sse', key: apiKey });
  return `${AI_ENDPOINTS.geminiModelsBase}/${encodedModel}:streamGenerateContent?${query.toString()}`;
}

export function buildGeminiGenerateEndpoint(model: string, apiKey: string): string {
  const encodedModel = encodeURIComponent(model);
  const query = new URLSearchParams({ key: apiKey });
  return `${AI_ENDPOINTS.geminiModelsBase}/${encodedModel}:generateContent?${query.toString()}`;
}

export function resolveOllamaChatEndpoint(input?: string | null): string {
  const rawBase = (input ?? OLLAMA_DEFAULT_BASE_URL).trim();
  const normalizedBase = rawBase || OLLAMA_DEFAULT_BASE_URL;

  if (/\/api\/chat\/?$/i.test(normalizedBase)) {
    return normalizedBase.replace(/\/$/, '');
  }

  return `${normalizedBase.replace(/\/$/, '')}${AI_ENDPOINTS.ollamaChatPath}`;
}

export function getProviderInputPlaceholder(providerAndModel: string): string {
  return providerAndModel.startsWith('ollama') ? OLLAMA_DEFAULT_BASE_URL : 'sk-...';
}
