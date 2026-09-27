/**
 * @file ai-storage.ts
 * @description Remembers the chosen "provider:model" in localStorage. API keys
 * never live here: they are sealed in the encrypted vault (ai-secure-storage).
 */
const AI_PROVIDER_STORAGE = 'gitpagedocs_ai_provider';

export const aiStorage = {
    saveProvider: (provider: string) => {
        if (typeof window !== 'undefined') localStorage.setItem(AI_PROVIDER_STORAGE, provider);
    },
    getProvider: () => {
        if (typeof window !== 'undefined') return localStorage.getItem(AI_PROVIDER_STORAGE);
        return null;
    },
};
