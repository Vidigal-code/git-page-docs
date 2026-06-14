import { createDefaultFactory, parseLegacyProviderAndModel } from '@gitpagedocs/tools/ai';
import type { AiMessage, ProviderConfig } from '@gitpagedocs/tools/ports';
import { isAppError } from '@gitpagedocs/tools/errors';
import { ILlmService, LlmCompletionParams, BaseChatMessage } from './llm-types';
import { aiStorage } from '../../../../shared/lib/ai-storage';
import { LlmError } from '../llm-error';

const factory = createDefaultFactory();

function toAiMessages(messages: BaseChatMessage[]): AiMessage[] {
    return messages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map((a) => ({
            kind: a.type,
            mimeType: a.mimeType,
            data: a.base64,
        })),
    }));
}

/**
 * Browser ILlmService backed by the shared @gitpagedocs/tools AI core. Replaces
 * the four duplicated provider implementations with one adapter, preserving the
 * streamCompletion contract and the LlmError shape the chat hook expects.
 */
export class SharedLlmService implements ILlmService {
    private readonly providerId;
    private readonly model;

    constructor(providerAndModel: string) {
        const parsed = parseLegacyProviderAndModel(providerAndModel);
        this.providerId = parsed.providerId;
        this.model = parsed.model;
    }

    async streamCompletion({ messages, onChunk, signal }: LlmCompletionParams): Promise<void> {
        const storedKey = aiStorage.getKey() ?? undefined;
        const isOllama = this.providerId === 'ollama';
        if (!isOllama && !storedKey) {
            throw new LlmError(`${this.providerId} API key missing`, 401);
        }

        const config: ProviderConfig = {
            providerId: this.providerId,
            model: this.model,
            apiKey: isOllama ? undefined : storedKey,
            baseUrl: isOllama ? storedKey : undefined,
        };

        const provider = factory.create(this.providerId);
        try {
            for await (const delta of provider.stream(
                { messages: toAiMessages(messages), signal },
                config,
            )) {
                onChunk(delta);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') throw error;
            const status = isAppError(error)
                ? Number((error.details as { status?: number } | undefined)?.status ?? 500)
                : 500;
            throw new LlmError(error instanceof Error ? error.message : String(error), status);
        }
    }
}
