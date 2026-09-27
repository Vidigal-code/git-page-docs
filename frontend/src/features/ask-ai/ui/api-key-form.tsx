import React, { useMemo, useState, useEffect } from 'react';
import { aiStorage } from '@/shared/lib/ai-storage';
import styles from '../../../widgets/ai-chat-drawer/ui/ai-chat.module.css';
import { buildProviderModelOptions, getProviderInputPlaceholder, normalizeProviderAndModel } from '@/shared/config/ai-config';

interface ApiKeyFormProps {
    /** Persistence is owned by the parent drawer (encrypted vault), so the
     * form just reports the chosen provider + key. */
    onSave: (providerAndModel: string, key: string) => void;
    labels?: any;
}

/** "provider:model" with a model the catalog still serves (a retired one becomes the default). */
function withSupportedModel(providerName: string | null | undefined): string {
    const { provider, model } = normalizeProviderAndModel(providerName || 'openai');
    return `${provider}:${model}`;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSave, labels }) => {
    const [key, setKey] = useState('');
    const [provider, setProvider] = useState(() => withSupportedModel('openai'));
    // The select lists exactly what the shared provider catalog serves today.
    const options = useMemo(() => buildProviderModelOptions(labels ?? {}), [labels]);

    useEffect(() => {
        setProvider(withSupportedModel(aiStorage.getProvider()));
    }, []);

    const handleSave = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(provider, key);
        setKey('');
    };

    const isOllama = provider.startsWith('ollama');

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
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>

            <label className={styles.formGroup}>
                {isOllama
                    ? labels?.aiChatOllamaUrlLabel || "Ollama API URL (leave blank for local):"
                    : labels?.aiChatApiKeyLabel || "API Key (leave blank for local AI):"}
                <input
                    data-testid="drawer-apikey-input"
                    type={isOllama ? "url" : "password"}
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className={styles.formInput}
                    placeholder={getProviderInputPlaceholder(provider)}
                    autoComplete="off"
                />
            </label>

            <div className={styles.formActions}>
                <button
                    type="submit"
                    data-testid="drawer-save-key"
                    className={styles.btnPrimary}
                >
                    {labels?.aiChatSaveStartBtn || "Save & Start Chatting"}
                </button>
            </div>
        </form>
    );
};
