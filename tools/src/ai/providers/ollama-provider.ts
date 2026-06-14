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
import { type FetchLike, ensureOk, readJsonLines, resolveFetch } from "../http/streaming";
import { collect, resolveBaseUrl } from "./shared";

/** Local Ollama /api/chat adapter (NDJSON streaming, no auth). */
export class OllamaProvider implements AIProvider {
  readonly id: AiProviderId;
  readonly capabilities: ProviderCapabilities;

  constructor(
    private readonly spec: ProviderSpec,
    private readonly fetchImpl?: FetchLike,
  ) {
    this.id = spec.id;
    this.capabilities = spec.capabilities;
  }

  private endpoint(config: ProviderConfig): string {
    const base = resolveBaseUrl(this.spec, config);
    return /\/api\/chat\/?$/i.test(base) ? base.replace(/\/$/, "") : `${base}/api/chat`;
  }

  async *stream(request: GenerateRequest, config: ProviderConfig): AsyncGenerator<string> {
    const fetchImpl = resolveFetch(this.fetchImpl);
    const messages = request.messages.map((m) => {
      const images = (m.attachments ?? []).filter((a) => a.kind === "image").map((a) => a.data);
      return images.length > 0
        ? { role: m.role, content: m.content, images }
        : { role: m.role, content: m.content };
    });
    if (request.system) messages.unshift({ role: "system", content: request.system });

    const response = await fetchImpl(this.endpoint(config), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model || this.spec.defaultModel,
        messages,
        options: { temperature: request.temperature },
        stream: true,
      }),
      signal: request.signal,
    });
    const ok = await ensureOk(response, this.spec.label);
    for await (const line of readJsonLines(ok.body as ReadableStream<Uint8Array>)) {
      try {
        const parsed = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
        if (parsed.message?.content) yield parsed.message.content;
        if (parsed.done) break;
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
