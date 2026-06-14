/**
 * AI ports (Strategy + Registry + Factory). Implemented in Phase 5 in
 * tools/src/ai, unifying the current browser (src/features/ask-ai) and CLI
 * (src/cli/infrastructure/llm) provider implementations behind one contract.
 */
export type AiProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter"
  | "ollama"
  | "azure-openai"
  | "mistral"
  | "deepseek"
  | "cohere"
  | "groq"
  | "xai"
  | "together"
  | "fireworks"
  | "perplexity";

export type AiRole = "system" | "user" | "assistant";

export interface AiAttachment {
  readonly kind: "image" | "audio";
  readonly mimeType: string;
  /** Base64-encoded data. */
  readonly data: string;
}

export interface AiMessage {
  readonly role: AiRole;
  readonly content: string;
  readonly attachments?: readonly AiAttachment[];
}

export interface ModelDescriptor {
  readonly id: string;
  readonly label?: string;
  readonly contextWindow?: number;
  readonly supportsStreaming?: boolean;
  readonly supportsVision?: boolean;
  readonly supportsAudio?: boolean;
}

export interface ProviderConfig {
  readonly providerId: AiProviderId;
  readonly model: string;
  readonly apiKey?: string;
  /** For self-hosted/proxy providers (e.g. Ollama, Azure). */
  readonly baseUrl?: string;
  readonly extraHeaders?: Readonly<Record<string, string>>;
}

export interface GenerateRequest {
  readonly messages: readonly AiMessage[];
  readonly system?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly signal?: AbortSignal;
}

export interface GenerateResponse {
  readonly text: string;
  readonly model: string;
  readonly finishReason?: string;
}

/** Streaming responses surface as an async iterable of text deltas. */
export type StreamResponse = AsyncIterable<string>;

export interface ProviderCapabilities {
  readonly streaming: boolean;
  readonly vision: boolean;
  readonly audio: boolean;
}

/** A single provider strategy. */
export interface AIProvider {
  readonly id: AiProviderId;
  readonly capabilities: ProviderCapabilities;
  generate(request: GenerateRequest, config: ProviderConfig): Promise<GenerateResponse>;
  stream(request: GenerateRequest, config: ProviderConfig): StreamResponse;
}

/** Provider metadata + factory registration (Registry pattern). */
export interface ProviderRegistration {
  readonly id: AiProviderId;
  readonly label: string;
  readonly defaultModel: string;
  readonly capabilities: ProviderCapabilities;
  create(): AIProvider;
}

export interface ProviderRegistry {
  register(registration: ProviderRegistration): void;
  has(id: AiProviderId): boolean;
  get(id: AiProviderId): ProviderRegistration | undefined;
  list(): readonly ProviderRegistration[];
}

export interface ProviderFactory {
  create(id: AiProviderId): AIProvider;
}

export interface ModelRegistry {
  list(providerId: AiProviderId): readonly ModelDescriptor[];
  defaultModel(providerId: AiProviderId): string | undefined;
}
