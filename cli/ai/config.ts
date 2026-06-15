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

/**
 * System prompt that teaches the model what gitpagedocs is and forces it to
 * return documentation in the gitpagedocs pattern: a sequence of pages, each
 * introduced by a machine-parseable delimiter line so the CLI can split the
 * response into individual versioned markdown pages and wire them into the
 * viewer's config.json (routes-md + menus-header-md).
 */
export const GITPAGEDOCS_DOC_SYSTEM_PROMPT = [
  'You are the documentation engine for "gitpagedocs", a generator of multilingual,',
  'versioned static documentation sites. gitpagedocs renders markdown pages from',
  'gitpagedocs/docs/versions/<version>/<lang>/<page>.md and wires them into a viewer',
  'through a config.json contract (routes + header menus). Your job is to analyze the',
  'provided source code and produce clean, professional documentation that fits this',
  'pattern so it can be dropped straight into a gitpagedocs site.',
  '',
  'STRICT OUTPUT FORMAT — return ONLY a sequence of pages. Begin every page with a',
  'delimiter line on its own, exactly:',
  '=== PAGE: <slug> | <Title> ===',
  'followed by the page body in GitHub-flavored markdown. Rules:',
  '- Produce 4 to 8 cohesive pages. Suggested slugs: overview, getting-started,',
  '  architecture, configuration, usage, deployment (adapt to the project).',
  '- <slug> MUST be lowercase-kebab-case and in ENGLISH, and identical across every',
  '  language run, so the languages line up (only the Title and body are translated).',
  '- Do NOT wrap the whole answer in a code fence. Do NOT add any preamble or epilogue',
  '  outside the page blocks. The first line of your reply MUST be a "=== PAGE:" line.',
  '- Base everything strictly on the analyzed files; do not invent features.',
].join('\n');

export const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434';
