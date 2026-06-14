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
import { buildAuthHeaders, collect, resolveBaseUrl } from "./shared";

/** Anthropic Messages API adapter (content_block_delta streaming). */
export class AnthropicProvider implements AIProvider {
  readonly id: AiProviderId;
  readonly capabilities: ProviderCapabilities;

  constructor(
    private readonly spec: ProviderSpec,
    private readonly fetchImpl?: FetchLike,
  ) {
    this.id = spec.id;
    this.capabilities = spec.capabilities;
  }

  private mapMessage(msg: AiMessage): unknown {
    const images = (msg.attachments ?? []).filter((a) => a.kind === "image");
    if (images.length === 0) return { role: msg.role, content: msg.content };
    const content: unknown[] = [];
    if (msg.content) content.push({ type: "text", text: msg.content });
    for (const img of images) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: img.mimeType, data: img.data },
      });
    }
    return { role: msg.role, content };
  }

  async *stream(request: GenerateRequest, config: ProviderConfig): AsyncGenerator<string> {
    const fetchImpl = resolveFetch(this.fetchImpl);
    const base = resolveBaseUrl(this.spec, config);
    const chatMessages = request.messages.filter((m) => m.role !== "system").map((m) => this.mapMessage(m));
    const joinedSystem = request.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n");
    const system = request.system ?? (joinedSystem || undefined);

    const response = await fetchImpl(`${base}/messages`, {
      method: "POST",
      headers: buildAuthHeaders(this.spec, config),
      body: JSON.stringify({
        model: config.model || this.spec.defaultModel,
        max_tokens: request.maxTokens ?? 4000,
        temperature: request.temperature,
        system,
        messages: chatMessages,
        stream: true,
      }),
      signal: request.signal,
    });
    const ok = await ensureOk(response, this.spec.label);
    for await (const data of readSseData(ok.body as ReadableStream<Uint8Array>)) {
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as { type?: string; delta?: { text?: string } };
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          yield parsed.delta.text;
        }
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
