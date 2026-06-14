import React, { useState, useEffect } from 'react';
import { aiStorage } from '@/shared/lib/ai-storage';
import styles from '../../../widgets/ai-chat-drawer/ui/ai-chat.module.css';
import { getProviderInputPlaceholder, normalizeProviderAndModel } from '@/shared/config/ai-config';

interface ApiKeyFormProps {
    /** Persistence is owned by the parent drawer (encrypted vault), so the
     * form just reports the chosen provider + key. */
    onSave: (providerAndModel: string, key: string) => void;
    labels?: any;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSave, labels }) => {
    const [key, setKey] = useState('');
    const [provider, setProvider] = useState('openai');

    const withDefaultModel = (providerName: string) => {
        const { provider: normalizedProvider, model } = normalizeProviderAndModel(providerName);
        return `${normalizedProvider}:${model}`;
    };

    useEffect(() => {
        const savedProvider = aiStorage.getProvider();
        setProvider(withDefaultModel(savedProvider || 'openai'));
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(provider, key);
        setKey('');
    };

    return (
        <form onSubmit={handleSave} className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h3>{labels?.aiChatConfigTitle || "Configure AI Assistant"}</h3>
                <p>{labels?.aiChatConfigDesc || "Your key will be securely saved only in your browser, NEVER on the server."}</p>
            </div>

            <label className={styles.formGroup}>
                {labels?.aiChatProviderLabel || "Provider:"}
                <select
                    data-testid="drawer-provider-select"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    className={styles.formSelect}
                >
                    <option value="openai:gpt-4o-mini">{labels?.aiChatProviderOpenAI || "OpenAI (GPT-4o-mini)"}</option>
                    <option value="openai:gpt-4o">OpenAI (GPT-4o)</option>
                    <option value="claude:claude-3-5-sonnet-20240620">{labels?.aiChatProviderClaude || "Anthropic Claude (3.5 Sonnet)"}</option>
                    <option value="gemini:gemini-flash-latest">Google Gemini (Flash Latest)</option>
                    <option value="gemini:gemini-2.5-flash">Google Gemini (2.5 Flash)</option>
                    <option value="gemini:gemini-2.5-pro">Google Gemini (2.5 Pro)</option>
                    <option value="gemini:gemini-2.0-flash">Google Gemini (2.0 Flash)</option>
                    <option value="gemini:gemini-1.5-flash">{labels?.aiChatProviderGemini || "Google Gemini (1.5 Flash)"}</option>
                    <option value="gemini:gemini-1.5-pro">Google Gemini (1.5 Pro)</option>
                    <option value="gemini:gemini-1.0-pro">Google Gemini (1.0 Pro)</option>
                    <option value="gemini:gemini-pro">Google Gemini (Legacy Pro)</option>
                    <option value="ollama:llama3">{labels?.aiChatProviderOllama || "Ollama Network (Local LLMs)"}</option>
                </select>
            </label>

            <label className={styles.formGroup}>
                {provider.startsWith('ollama')
                    ? labels?.aiChatOllamaUrlLabel || "Ollama API URL (leave blank for local):"
                    : labels?.aiChatApiKeyLabel || "API Key (leave blank for local AI):"}
                <input
                    data-testid="drawer-apikey-input"
                    type={provider.startsWith('ollama') ? "url" : "password"}
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className={styles.formInput}
                    placeholder={getProviderInputPlaceholder(provider)}
                />
            </label>

            <div className={styles.formActions}>
                <button
                    type="submit"
                    data-testid="drawer-save-key"
                    className={styles.btnPrimary}
                >
                    {labels?.aiChatSendBtn || "Save & Start Chatting"}
                </button>
            </div>
        </form>
    );
};
