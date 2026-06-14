/**
 * @file model.ts
 * @description Types and business rules for the AI Configuration entity.
 */
export type AiProviderType = 'openai' | 'claude' | 'gemini' | 'ollama';

export interface AiConfiguration {
    provider: AiProviderType;
    apiKey: string | null;
    isActive: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type: 'text' | 'image' | 'audio';
    attachmentUrl?: string; // e.g. base64 image or local object URL
    timestamp: number;
}
