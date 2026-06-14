import { ILlmService } from './providers/llm-types';
import { SharedLlmService, LlmCredentials } from './providers/shared-llm-service';

/**
 * Returns an ILlmService for the given "provider[:model]" string. Backed by the
 * shared @gitpagedocs/tools AI core (one registry-driven implementation for all
 * providers), replacing the previous per-provider switch. Credentials are
 * injected by the caller (decrypted from the encrypted vault), so the service
 * never reads keys from storage.
 */
export function getLlmService(providerAndModel: string, credentials?: LlmCredentials): ILlmService {
    return new SharedLlmService(providerAndModel, credentials);
}

export type { LlmCredentials } from './providers/shared-llm-service';
export type { ILlmService, BaseChatMessage, LlmCompletionParams, MultimodalAttachment } from './providers/llm-types';
