/**
 * @file config.ts
 * @description Provider constants for the AI CLI. Co-located in cli/ so the
 * published `gitpagedocs` package does not reach into the frontend app. The
 * browser keeps its own copy at frontend/src/shared/config/ai-config.ts.
 */

/** Legacy 4-provider id used by the interactive CLI (mapped to the 14-provider
 * catalog in @gitpagedocs/tools via legacyProviderToCatalogId). */
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
