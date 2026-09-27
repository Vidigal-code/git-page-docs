import { useState, useRef, useCallback } from 'react';
import { getLlmService, BaseChatMessage, MultimodalAttachment } from '../api/llm-factory';
import { aiStorage } from '@/shared/lib/ai-storage';

export interface ChatMessage extends BaseChatMessage {
    id: string;
}

/** Credentials + provider the resolver hands back at send time. Returning
 * null means "locked or no key for this provider" → the chat surfaces the
 * same auth error as a 401 instead of calling the provider. */
export interface ResolvedChatCredentials {
    providerAndModel: string;
    apiKey?: string;
    baseUrl?: string;
}

export type ResolveChatCredentials = () => Promise<ResolvedChatCredentials | null>;

/** Appends `text` to the message with `id`, leaving every other message untouched. */
function appendToMessage(messages: ChatMessage[], id: string, text: string): ChatMessage[] {
    return messages.map(m => m.id === id ? { ...m, content: m.content + text } : m);
}

/** Maps a failed completion to the label rendered inline in the reply. */
function describeChatError(error: any, labels?: any): string | undefined {
    const generic = labels?.aiChatErrorGeneric || "Generic Error";
    if (error?.name !== 'LlmError') return generic;

    const status = error.statusCode;
    if (status === 0) return error.message;
    if (status === 401 || status === 403) return labels?.aiChatError401;
    if (status === 429) return labels?.aiChatError429;
    if (status && status >= 500) return labels?.aiChatError500;
    if (status) return labels?.aiChatErrorGeneric;
    return generic;
}

/** History + (one) system prompt + the new user turn, in provider order. */
function buildContextMessages(
    history: ChatMessage[],
    systemContext: string | undefined,
    content: string,
    attachments?: MultimodalAttachment[],
): BaseChatMessage[] {
    const contextMsg: BaseChatMessage[] = history.map(m => ({ role: m.role, content: m.content, attachments: m.attachments }));

    if (systemContext && !contextMsg.some(m => m.role === 'system')) {
        contextMsg.unshift({ role: 'system', content: systemContext, attachments: undefined });
    }

    contextMsg.push({ role: 'user', content, attachments });
    return contextMsg;
}

export function useAiChat(
    systemContext?: string,
    labels?: any,
    resolveCredentials?: ResolveChatCredentials,
) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const checkProvider = useCallback(() => {
        const p = aiStorage.getProvider();
        return p || 'openai';
    }, []);

    const legacyCredentials = useCallback((): ResolvedChatCredentials => {
        const providerAndModel = checkProvider();
        const stored = aiStorage.getKey() ?? undefined;
        const isOllama = providerAndModel.split(':')[0] === 'ollama';
        return {
            providerAndModel,
            apiKey: isOllama ? undefined : stored,
            baseUrl: isOllama ? stored : undefined,
        };
    }, [checkProvider]);

    const sendMessage = useCallback(async (content: string, attachments?: MultimodalAttachment[]) => {
        if (!content.trim() && (!attachments || attachments.length === 0)) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, attachments };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        const aiMsgEmpty: ChatMessage = { id: aiMsgId, role: 'assistant', content: '' };

        setMessages(prev => [...prev, aiMsgEmpty]);

        abortControllerRef.current?.abort();

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const appendReply = (text: string) => setMessages(prev => appendToMessage(prev, aiMsgId, text));

        try {
            // Resolve credentials at send time. The caller (the chat drawer)
            // decrypts the key from the vault; the legacy fallback preserves the
            // pre-vault behavior for any caller that doesn't inject a resolver.
            const creds = resolveCredentials ? await resolveCredentials() : legacyCredentials();
            if (!creds) {
                const lockedError = labels?.aiChatError401 || labels?.aiChatErrorGeneric || 'Authentication error';
                appendReply(`[${lockedError}]`);
                return;
            }

            const llmService = getLlmService(creds.providerAndModel, { apiKey: creds.apiKey, baseUrl: creds.baseUrl });

            await llmService.streamCompletion({
                messages: buildContextMessages(messages, systemContext, content, attachments),
                signal: controller.signal,
                onChunk: appendReply,
            });
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                appendReply(`\n\n[${describeChatError(error, labels)}]`);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [messages, systemContext, labels, resolveCredentials, legacyCredentials]);

    const cancelMessage = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        cancelMessage();
    }, [cancelMessage]);

    return {
        messages,
        isLoading,
        sendMessage,
        cancelMessage,
        clearMessages
    };
}
