/**
 * @file llm-error.ts
 * @description Custom exception capturing HTTP status codes supporting dynamic multi-language FSD feedback mappings.
 */
export class LlmError extends Error {
    public readonly statusCode?: number;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = 'LlmError';
        this.statusCode = statusCode;
    }
}
