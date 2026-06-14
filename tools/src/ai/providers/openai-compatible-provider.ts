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
import { buildAuthHeaders, collect, resolveBaseUrl, toOpenAiMessages } from "./shared";

/**
 * Adapter for every OpenAI chat-completions-compatible provider: OpenAI,
 * OpenRouter, Groq, Mistral, DeepSeek, Together, Fireworks, Perplexity, xAI and
 * Azure OpenAI. One strategy, parameterized by the catalog spec.
 */
export class OpenAiCompatibleProvider implements AIProvider {
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
    // Azure deployment URLs already include the full path via baseUrl.
    if (this.spec.id === "azure-openai") return base;
    return `${base}/chat/completions`;
  }

  private body(request: GenerateRequest, config: ProviderConfig, stream: boolean): string {
    return JSON.stringify({
      model: config.model || this.spec.defaultModel,
      messages: toOpenAiMessages(request),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream,
    });
  }

  async *stream(request: GenerateRequest, config: ProviderConfig): AsyncGenerator<string> {
    const fetchImpl = resolveFetch(this.fetchImpl);
    const response = await fetchImpl(this.endpoint(config), {
      method: "POST",
      headers: buildAuthHeaders(this.spec, config),
      body: this.body(request, config, true),
      signal: request.signal,
    });
    const ok = await ensureOk(response, this.spec.label);
    for await (const data of readSseData(ok.body as ReadableStream<Uint8Array>)) {
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignore partial JSON frames */
      }
    }
  }

  async generate(request: GenerateRequest, config: ProviderConfig): Promise<GenerateResponse> {
    const text = await collect(this.stream(request, config) as StreamResponse);
    return { text, model: config.model || this.spec.defaultModel };
  }
}
