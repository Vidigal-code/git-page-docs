/**
 * @file ai-storage.ts
 * @description Secure LocalStorage wrapper for AI API Keys ensuring they never hit a backend.
 */
const AI_KEY_STORAGE = 'gitpagedocs_ai_key';
const AI_PROVIDER_STORAGE = 'gitpagedocs_ai_provider';

export const aiStorage = {
    saveKey: (key: string) => {
        if (typeof window !== 'undefined') localStorage.setItem(AI_KEY_STORAGE, key);
    },
    getKey: () => {
        if (typeof window !== 'undefined') return localStorage.getItem(AI_KEY_STORAGE);
        return null;
    },
    clearKey: () => {
        if (typeof window !== 'undefined') localStorage.removeItem(AI_KEY_STORAGE);
    },

    saveProvider: (provider: string) => {
        if (typeof window !== 'undefined') localStorage.setItem(AI_PROVIDER_STORAGE, provider);
    },
    getProvider: () => {
        if (typeof window !== 'undefined') return localStorage.getItem(AI_PROVIDER_STORAGE);
        return null;
    },
};
