import { ILlmService } from './providers/llm-types';
import { SharedLlmService } from './providers/shared-llm-service';

/**
 * Returns an ILlmService for the given "provider[:model]" string. Backed by the
 * shared @gitpagedocs/tools AI core (one registry-driven implementation for all
 * providers), replacing the previous per-provider switch.
 */
export function getLlmService(providerAndModel: string): ILlmService {
    return new SharedLlmService(providerAndModel);
}

export type { ILlmService, BaseChatMessage, LlmCompletionParams, MultimodalAttachment } from './providers/llm-types';
