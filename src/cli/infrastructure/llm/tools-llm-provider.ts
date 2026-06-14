import { createDefaultFactory, legacyProviderToCatalogId } from "@gitpagedocs/tools/ai";
import type { AiMessage, ProviderConfig } from "@gitpagedocs/tools/ports";
import type { ILLMProvider, ChatMessage, ILLMProviderConfig } from "../../core/ports/illm-provider";
import { DEFAULT_AI_DOC_PROMPT, type AiProviderId } from "../../../shared/config/ai-config";

const factory = createDefaultFactory();

/**
 * Single CLI LLM provider backed by the shared @gitpagedocs/tools AI core.
 * Replaces the four duplicated CLI provider classes (OpenAI/Claude/Gemini/
 * Ollama) with one adapter over the registry/factory, preserving the
 * ILLMProvider contract used by the AI documentation flow.
 */
export class ToolsLlmProvider implements ILLMProvider {
  private readonly providerId;
  private readonly model: string;
  private readonly apiKey?: string;
  private readonly baseUrl?: string;

  constructor(legacyProvider: AiProviderId, config: ILLMProviderConfig) {
    this.providerId = legacyProviderToCatalogId(legacyProvider);
    this.model = config.model ?? "";
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async generateDocumentation(fileContent: string, contextPrompt?: string): Promise<string> {
    return this.chat([
      { role: "system", content: contextPrompt || DEFAULT_AI_DOC_PROMPT },
      { role: "user", content: fileContent },
    ]);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n");
    const aiMessages: AiMessage[] = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as AiMessage["role"], content: m.content }));

    const config: ProviderConfig = {
      providerId: this.providerId,
      model: this.model,
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
    };
    const response = await factory
      .create(this.providerId)
      .generate({ messages: aiMessages, system: system || undefined, maxTokens: 4000 }, config);
    return response.text;
  }
}
