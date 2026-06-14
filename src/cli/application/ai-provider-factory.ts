import type { AiProviderId } from "@/shared/config/ai-config";
import type { ILLMProvider } from "../core/ports/illm-provider";
import { ToolsLlmProvider } from "../infrastructure/llm/tools-llm-provider";

/**
 * Creates the CLI LLM provider. Backed by the shared @gitpagedocs/tools AI core
 * (one registry-driven implementation for every provider) — no per-provider
 * switch. The legacy provider id (openai/claude/gemini/ollama) is mapped to the
 * catalog inside ToolsLlmProvider.
 */
export function createAiProvider(input: {
  provider: AiProviderId;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}): ILLMProvider {
  return new ToolsLlmProvider(input.provider, {
    model: input.model,
    apiKey: input.apiKey,
    baseUrl: input.baseUrl,
  });
}
