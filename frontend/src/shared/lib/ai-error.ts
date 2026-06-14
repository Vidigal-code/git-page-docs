/**
 * @file ai-error.ts
 * @description Browser AI calls hit CORS on a static site for providers that
 * don't allow direct browser origins (OpenAI and most OpenAI-compatible ones).
 * Such failures reject as a TypeError ("Failed to fetch") with no HTTP status.
 * Detect that and return an actionable hint instead of a generic error.
 */

export function isBrowserNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /failed to fetch|networkerror|load failed|\bcors\b/i.test(message);
}

export function describeAiBrowserError(provider: string, error: unknown): string {
  if (isBrowserNetworkError(error)) {
    return `Could not reach ${provider}. On a static site most providers block direct browser calls (CORS). Try Gemini, Claude, or local Ollama — or route this provider through your own proxy (baseUrl).`;
  }
  return error instanceof Error ? error.message : String(error);
}
