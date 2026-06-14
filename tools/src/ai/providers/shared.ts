import type { AiMessage, GenerateRequest, ProviderConfig } from "../../ports/ai";
import type { ProviderSpec } from "../catalog";
import { ProviderError } from "../../errors/app-error";

/** Build request auth headers from the provider's declared auth style. */
export function buildAuthHeaders(spec: ProviderSpec, config: ProviderConfig): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...config.extraHeaders };
  switch (spec.auth) {
    case "bearer":
      requireKey(spec, config);
      headers.Authorization = `Bearer ${config.apiKey}`;
      break;
    case "x-api-key":
      requireKey(spec, config);
      headers["x-api-key"] = config.apiKey as string;
      headers["anthropic-version"] = "2023-06-01";
      break;
    case "api-key-header":
      requireKey(spec, config);
      headers["api-key"] = config.apiKey as string;
      break;
    case "query-key":
    case "none":
      break;
  }
  return headers;
}

export function requireKey(spec: ProviderSpec, config: ProviderConfig): void {
  if (!config.apiKey) {
    throw new ProviderError(`${spec.label} requires an API key.`, { details: { provider: spec.id } });
  }
}

export function resolveBaseUrl(spec: ProviderSpec, config: ProviderConfig): string {
  const base = (config.baseUrl ?? spec.baseUrl).replace(/\/+$/, "");
  if (spec.requiresBaseUrl && !config.baseUrl && !spec.baseUrl) {
    throw new ProviderError(`${spec.label} requires a baseUrl.`, { details: { provider: spec.id } });
  }
  return base;
}

/** OpenAI chat-completions message shape (text + optional image parts). */
export function toOpenAiMessages(request: GenerateRequest): unknown[] {
  const out: unknown[] = [];
  if (request.system) out.push({ role: "system", content: request.system });
  for (const msg of request.messages) {
    out.push(mapOpenAiMessage(msg));
  }
  return out;
}

function mapOpenAiMessage(msg: AiMessage): unknown {
  const images = (msg.attachments ?? []).filter((a) => a.kind === "image");
  if (images.length === 0) return { role: msg.role, content: msg.content };
  const content: unknown[] = [];
  if (msg.content) content.push({ type: "text", text: msg.content });
  for (const img of images) {
    content.push({ type: "image_url", image_url: { url: `data:${img.mimeType};base64,${img.data}` } });
  }
  return { role: msg.role, content };
}

/** Drain an async iterable of text deltas into a single string. */
export async function collect(stream: AsyncIterable<string>): Promise<string> {
  let text = "";
  for await (const delta of stream) text += delta;
  return text;
}
