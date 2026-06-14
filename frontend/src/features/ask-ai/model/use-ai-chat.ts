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


        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // Resolve credentials at send time. The caller (the chat drawer)
            // decrypts the key from the vault; the legacy fallback preserves the
            // pre-vault behavior for any caller that doesn't inject a resolver.
            const creds = resolveCredentials ? await resolveCredentials() : legacyCredentials();
            if (!creds) {
                const lockedError = labels?.aiChatError401 || labels?.aiChatErrorGeneric || 'Authentication error';
                setMessages(prev =>
                    prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + `[${lockedError}]` } : m)
                );
                return;
            }

            const llmService = getLlmService(creds.providerAndModel, { apiKey: creds.apiKey, baseUrl: creds.baseUrl });

            const contextMsg = messages.map(m => ({ role: m.role, content: m.content, attachments: m.attachments }));

            if (systemContext) {
                const hasSystem = contextMsg.some(m => m.role === 'system');
                if (!hasSystem) {
                    contextMsg.unshift({ role: 'system', content: systemContext, attachments: undefined });
                }
            }

            contextMsg.push({ role: 'user', content, attachments });

            await llmService.streamCompletion({
                messages: contextMsg,
                signal: controller.signal,
                onChunk: (chunk: string) => {
                    setMessages(prev =>
                        prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + chunk } : m)
                    );
                }
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                let formattedError = labels?.aiChatErrorGeneric || "Generic Error";

                if (error.name === 'LlmError') {
                    if (error.statusCode === 401 || error.statusCode === 403) formattedError = labels?.aiChatError401;
                    else if (error.statusCode === 429) formattedError = labels?.aiChatError429;
                    else if (error.statusCode && error.statusCode >= 500) formattedError = labels?.aiChatError500;
                    else if (error.statusCode) formattedError = labels?.aiChatErrorGeneric;
                }

                setMessages(prev =>
                    prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + `\n\n[${formattedError}]` } : m)
                );
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
