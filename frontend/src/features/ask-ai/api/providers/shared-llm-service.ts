import { PROVIDER_CATALOG, createDefaultFactory, parseLegacyProviderAndModel } from '@gitpagedocs/tools/ai';
import type { AiMessage, AiProviderId, ProviderConfig } from '@gitpagedocs/tools/ports';
import { isAppError } from '@gitpagedocs/tools/errors';
import { ILlmService, LlmCompletionParams, BaseChatMessage } from './llm-types';
import { LlmError } from '../llm-error';
import { isBrowserNetworkError, describeAiBrowserError } from '@/shared/lib/ai-error';
import { MAX_STREAM_ATTEMPTS, isTransientStatus, retryDelayMs, sleep } from '../retry-policy';

/** Credentials injected by the caller (decrypted from the vault), so the
 * service never reads keys from storage itself. */
export interface LlmCredentials {
    apiKey?: string;
    baseUrl?: string;
}

/** Test seam: how long to wait between transient-failure retries. */
export interface LlmStreamOptions {
    retryDelayMs?: (attempt: number) => number;
}

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
 * A model the catalog no longer lists (retired upstream) falls back to the
 * provider default, so a choice saved months ago keeps working. Ollama serves
 * whatever the user pulled locally, so its model names are never rewritten.
 */
function resolveSupportedModel(providerId: AiProviderId, model: string): string {
    const spec = PROVIDER_CATALOG[providerId];
    if (spec.auth === 'none') return model;
    return spec.models.some((m) => m.id === model) ? model : spec.defaultModel;
}

function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
}

/**
 * Browser ILlmService backed by the shared @gitpagedocs/tools AI core. Replaces
 * the four duplicated provider implementations with one adapter, preserving the
 * streamCompletion contract and the LlmError shape the chat hook expects.
 */
export class SharedLlmService implements ILlmService {
    private readonly providerId: AiProviderId;
    private readonly model: string;
    private readonly credentials: LlmCredentials;
    private readonly delayFor: (attempt: number) => number;

    constructor(providerAndModel: string, credentials: LlmCredentials = {}, options: LlmStreamOptions = {}) {
        const parsed = parseLegacyProviderAndModel(providerAndModel);
        this.providerId = parsed.providerId;
        this.model = resolveSupportedModel(parsed.providerId, parsed.model);
        this.credentials = credentials;
        this.delayFor = options.retryDelayMs ?? retryDelayMs;
    }

    async streamCompletion({ messages, onChunk, signal }: LlmCompletionParams): Promise<void> {
        const config = this.buildProviderConfig();
        const provider = factory.create(this.providerId);
        const request = { messages: toAiMessages(messages), signal };

        for (let attempt = 1; ; attempt += 1) {
            const outcome = await this.runAttempt(provider, request, config, onChunk);
            if (outcome.done) return;
            // Only a whole failed attempt is retried: once output reached the
            // reader a retry would duplicate it, and final errors never change.
            const retryable = !outcome.emitted && attempt < MAX_STREAM_ATTEMPTS && isTransientStatus(outcome.failure.statusCode);
            if (!retryable || signal?.aborted) throw outcome.failure;
            await sleep(this.delayFor(attempt), signal);
        }
    }

    private buildProviderConfig(): ProviderConfig {
        const isOllama = this.providerId === 'ollama';
        const apiKey = this.credentials.apiKey ?? undefined;
        if (!isOllama && !apiKey) {
            throw new LlmError(`${this.providerId} API key missing`, 401);
        }
        return {
            providerId: this.providerId,
            model: this.model,
            apiKey: isOllama ? undefined : apiKey,
            baseUrl: isOllama ? this.credentials.baseUrl : undefined,
        };
    }

    /** One streaming attempt: completed, or its failure plus whether output already reached the reader. */
    private async runAttempt(
        provider: ReturnType<typeof factory.create>,
        request: Parameters<ReturnType<typeof factory.create>['stream']>[0],
        config: ProviderConfig,
        onChunk: LlmCompletionParams['onChunk'],
    ): Promise<StreamAttemptOutcome> {
        let emitted = false;
        try {
            for await (const delta of provider.stream(request, config)) {
                emitted = true;
                onChunk(delta);
            }
            return { done: true };
        } catch (error) {
            if (isAbortError(error)) throw error;
            return { done: false, emitted, failure: this.toLlmError(error) };
        }
    }

    private toLlmError(error: unknown): LlmError {
        // CORS/network failure (status-less TypeError): give an actionable hint.
        if (isBrowserNetworkError(error)) {
            return new LlmError(describeAiBrowserError(this.providerId, error), 0);
        }
        const status = isAppError(error) ? (error.details as { status?: number } | undefined)?.status : undefined;
        return new LlmError(describeUnknownError(error), typeof status === 'number' ? status : undefined);
    }
}

type StreamAttemptOutcome = { done: true } | { done: false; emitted: boolean; failure: LlmError };

/** Message for whatever a provider threw, without falling back to "[object Object]". */
function describeUnknownError(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
        return JSON.stringify(error) ?? 'Unknown provider error';
    } catch {
        return 'Unknown provider error';
    }
}
