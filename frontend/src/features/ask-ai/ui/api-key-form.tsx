import React, { useMemo, useState, useEffect } from 'react';
import { aiStorage } from '@/shared/lib/ai-storage';
import { DropdownSelector } from '@/shared/ui/dropdown-selector';
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
    // The picker lists exactly what the shared provider catalog serves today,
    // through the same theme-aware dropdown as the language and theme selectors
    // (a native <select> popup ignores the theme).
    const options = useMemo(
        () => buildProviderModelOptions(labels ?? {}).map((option) => ({ id: option.value, label: option.label })),
        [labels],
    );
    const providerLabel: string = labels?.aiChatProviderLabel || "Provider:";
    const providerPickerName = providerLabel.replace(/:\s*$/, '');

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

            <div className={styles.formGroup}>
                <span>{providerLabel}</span>
                <div className={styles.providerSelect} data-testid="drawer-provider-select">
                    <DropdownSelector
                        label={providerPickerName}
                        options={options}
                        selectedId={provider}
                        onSelect={setProvider}
                        className={styles.formSelect}
                    />
                </div>
            </div>

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
