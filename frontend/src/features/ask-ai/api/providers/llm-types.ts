export interface MultimodalAttachment {
    type: 'image' | 'audio';
    mimeType: string;
    base64: string;
}

export interface BaseChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    attachments?: MultimodalAttachment[];
}

export interface LlmCompletionParams {
    messages: BaseChatMessage[];
    onChunk: (chunk: string) => void;
    signal?: AbortSignal;
}

export interface ILlmService {
    streamCompletion(params: LlmCompletionParams): Promise<void>;
}
