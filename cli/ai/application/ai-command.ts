/**
 * @file ai-command.ts
 * @description Application service for running AI commands. Decoupled from concrete LLMs.
 */
import { ILLMProvider } from '../core/ports/illm-provider';

export class AiCommandService {
    constructor(private provider: ILLMProvider) { }

    /**
     * Executes the AI Documentation Generation for a specific content
     */
    async runGeneration(content: string, contextPrompt?: string): Promise<string> {
        return await this.provider.generateDocumentation(content, contextPrompt);
    }

    /**
     * Executes a CLI chat prompt
     */
    async runChat(prompt: string): Promise<string> {
        const messages = [{ role: 'user' as const, content: prompt }];
        return await this.provider.chat(messages);
    }
}
