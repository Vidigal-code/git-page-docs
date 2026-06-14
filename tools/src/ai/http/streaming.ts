import { ProviderError } from "../../errors/app-error";

/** Injected fetch for testability; defaults to the platform global. */
export type FetchLike = typeof fetch;

export function resolveFetch(custom?: FetchLike): FetchLike {
  const f = custom ?? (globalThis.fetch as FetchLike | undefined);
  if (!f) throw new ProviderError("No fetch implementation available in this runtime.");
  return f;
}

/** Yield the payload of each `data:` line from an SSE response body. */
export async function* readSseData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) {
        yield trimmed.slice(5).trim();
      }
    }
  }
  const tail = buffer.trim();
  if (tail.startsWith("data:")) yield tail.slice(5).trim();
}

/** Yield each complete JSON line from an NDJSON response body (e.g. Ollama). */
export async function* readJsonLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) yield trimmed;
    }
  }
  const tail = buffer.trim();
  if (tail) yield tail;
}

export async function ensureOk(response: Response, providerLabel: string): Promise<Response> {
  if (response.ok && response.body) return response;
  const detail = await response.text().catch(() => "");
  throw new ProviderError(`${providerLabel} request failed: ${response.status} ${response.statusText} ${detail}`, {
    details: { status: response.status },
  });
}
