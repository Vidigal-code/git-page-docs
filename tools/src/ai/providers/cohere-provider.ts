import type {
  AIProvider,
  AiProviderId,
  GenerateRequest,
  GenerateResponse,
  ProviderCapabilities,
  ProviderConfig,
  StreamResponse,
} from "../../ports/ai";
import type { ProviderSpec } from "../catalog";
import { type FetchLike, ensureOk, readSseData, resolveFetch } from "../http/streaming";
import { buildAuthHeaders, collect, resolveBaseUrl } from "./shared";

/** Cohere Chat v2 adapter (SSE content-delta streaming). */
export class CohereProvider implements AIProvider {
  readonly id: AiProviderId;
  readonly capabilities: ProviderCapabilities;

  constructor(
    private readonly spec: ProviderSpec,
    private readonly fetchImpl?: FetchLike,
  ) {
    this.id = spec.id;
    this.capabilities = spec.capabilities;
  }

  async *stream(request: GenerateRequest, config: ProviderConfig): AsyncGenerator<string> {
    const fetchImpl = resolveFetch(this.fetchImpl);
    const base = resolveBaseUrl(this.spec, config);
    const messages: Array<{ role: string; content: string }> = [];
    if (request.system) messages.push({ role: "system", content: request.system });
    for (const m of request.messages) messages.push({ role: m.role, content: m.content });

    const response = await fetchImpl(`${base}/chat`, {
      method: "POST",
      headers: buildAuthHeaders(this.spec, config),
      body: JSON.stringify({
        model: config.model || this.spec.defaultModel,
        messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: true,
      }),
      signal: request.signal,
    });
    const ok = await ensureOk(response, this.spec.label);
    for await (const data of readSseData(ok.body as ReadableStream<Uint8Array>)) {
      if (!data) continue;
      try {
        const parsed = JSON.parse(data) as {
          type?: string;
          delta?: { message?: { content?: { text?: string } } };
        };
        const text = parsed.delta?.message?.content?.text;
        if (parsed.type === "content-delta" && text) yield text;
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
