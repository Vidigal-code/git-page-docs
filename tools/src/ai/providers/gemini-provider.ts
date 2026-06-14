import type {
  AIProvider,
  AiMessage,
  AiProviderId,
  GenerateRequest,
  GenerateResponse,
  ProviderCapabilities,
  ProviderConfig,
  StreamResponse,
} from "../../ports/ai";
import type { ProviderSpec } from "../catalog";
import { type FetchLike, ensureOk, readSseData, resolveFetch } from "../http/streaming";
import { collect, requireKey, resolveBaseUrl } from "./shared";

/** Google Gemini streamGenerateContent adapter (SSE, API key in query). */
export class GeminiProvider implements AIProvider {
  readonly id: AiProviderId;
  readonly capabilities: ProviderCapabilities;

  constructor(
    private readonly spec: ProviderSpec,
    private readonly fetchImpl?: FetchLike,
  ) {
    this.id = spec.id;
    this.capabilities = spec.capabilities;
  }

  private mapParts(msg: AiMessage): unknown[] {
    const parts: unknown[] = [];
    if (msg.content) parts.push({ text: msg.content });
    for (const att of msg.attachments ?? []) {
      parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    }
    return parts;
  }

  async *stream(request: GenerateRequest, config: ProviderConfig): AsyncGenerator<string> {
    const fetchImpl = resolveFetch(this.fetchImpl);
    requireKey(this.spec, config);
    const base = resolveBaseUrl(this.spec, config);
    const model = encodeURIComponent(config.model || this.spec.defaultModel);
    const query = new URLSearchParams({ alt: "sse", key: config.apiKey as string });
    const url = `${base}/${model}:streamGenerateContent?${query.toString()}`;

    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: this.mapParts(m) }));
    const systemText =
      request.system ??
      request.messages
        .filter((m) => m.role === "system")
        .map((m) => m.content)
        .join("\n");

    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
        generationConfig: { temperature: request.temperature, maxOutputTokens: request.maxTokens },
      }),
      signal: request.signal,
    });
    const ok = await ensureOk(response, this.spec.label);
    for await (const data of readSseData(ok.body as ReadableStream<Uint8Array>)) {
      if (!data) continue;
      try {
        const parsed = JSON.parse(data) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = parsed.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        if (text) yield text;
      } catch {
        /* ignore partial frames */
      }
    }
  }

  async generate(request: GenerateRequest, config: ProviderConfig): Promise<GenerateResponse> {
    const text = await collect(this.stream(request, config) as StreamResponse);
    return { text, model: config.model || this.spec.defaultModel };
  }
}
