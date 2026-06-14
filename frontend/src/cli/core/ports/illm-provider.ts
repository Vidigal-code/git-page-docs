/**
 * @file illm-provider.ts
 * @description Contract for all LLM implementations ensuring OCP and DIP.
 * Isolates the AI logic from the specific LLM providers (OpenAI, Claude, Ollama, etc.).
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: 'text' | 'image' | 'audio'; // Supporting multimedia as requested
}

export interface ILLMProviderConfig {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
}

export interface ILLMProvider {
    /**
     * Generates markdown documentation based on file content.
     * @param fileContent Raw content of the source file
     * @param contextPrompt Optional instructions to guide the generation (e.g., FSD standard)
     */
    generateDocumentation(fileContent: string, contextPrompt?: string): Promise<string>;

    /**
     * Conversational chat support.
     * @param messages Array of chat messages (system context, user history, etc.)
     */
    chat(messages: ChatMessage[]): Promise<string>;
}
