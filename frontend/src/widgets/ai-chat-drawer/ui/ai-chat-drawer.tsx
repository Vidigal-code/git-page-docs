/**
 * @file ai-chat-drawer.tsx
 * @description The floating/drawer chat interface widget supporting multimedia.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { BsChatDots } from 'react-icons/bs';
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { ApiKeyForm } from '../../../features/ask-ai/ui/api-key-form';
import { aiStorage } from '../../../shared/lib/ai-storage';
import { aiSecureStorage } from '../../../shared/lib/ai-secure-storage';
import { useAiChat } from '../../../features/ask-ai/model/use-ai-chat';
import type { MultimodalAttachment } from '../../../features/ask-ai/api/providers/llm-types';
import { ConfirmPopup } from '../../../shared/ui/confirm-popup/confirm-popup';
import { marked } from 'marked';
import styles from './ai-chat.module.css';

interface AiChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isMobile?: boolean;
    icons: any;
    labels: any;
    systemContext?: string;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ isOpen, onClose, icons, labels, systemContext }) => {
    const [hasKey, setHasKey] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isClearChatPopupOpen, setIsClearChatPopupOpen] = useState(false);
    const [isClearDataPopupOpen, setIsClearDataPopupOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [drawerWidth, setDrawerWidth] = useState(400);
    const [isDragging, setIsDragging] = useState(false);
    const [providerName, setProviderName] = useState<string>('openai');
    const [pendingAttachments, setPendingAttachments] = useState<MultimodalAttachment[]>([]);

    // Encrypted-vault password gate (same vault the /ai console uses). The
    // session password lives only in memory; keys are stored AES-256-GCM.
    const [vaultState, setVaultState] = useState<'loading' | 'create' | 'locked' | 'unlocked'>('loading');
    const [sessionPassword, setSessionPassword] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [gateError, setGateError] = useState('');
    const [isResetPopupOpen, setIsResetPopupOpen] = useState(false);

    const refreshHasKey = useCallback(async (pw: string, providerAndModel: string) => {
        const bare = providerAndModel.split(':')[0];
        if (bare === 'ollama') { setHasKey(true); return; }
        const key = await aiSecureStorage.getKey(pw, bare);
        setHasKey(!!key);
    }, []);

    const resolveCredentials = useCallback(async () => {
        if (!sessionPassword) return null;
        const providerAndModel = aiStorage.getProvider() || 'openai:gpt-4o-mini';
        const bare = providerAndModel.split(':')[0];
        if (bare === 'ollama') {
            const baseUrl = await aiSecureStorage.getKey(sessionPassword, 'ollama');
            return { providerAndModel, baseUrl: baseUrl || undefined };
        }
        const apiKey = await aiSecureStorage.getKey(sessionPassword, bare);
        if (!apiKey) return null;
        return { providerAndModel, apiKey };
    }, [sessionPassword]);

    const { messages, isLoading, sendMessage, cancelMessage, clearMessages } = useAiChat(systemContext, labels, resolveCredentials);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isExpanded) return;
        e.preventDefault();
        setIsDragging(true);

        const startX = e.clientX;
        const startWidth = drawerWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = startX - moveEvent.clientX;
            const newWidth = Math.max(300, Math.min(800, startWidth + delta));
            setDrawerWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [drawerWidth, isExpanded]);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        const providerAndModel = aiStorage.getProvider() || 'openai:gpt-4o-mini';
        setProviderName(providerAndModel);
        (async () => {
            if (sessionPassword) {
                if (cancelled) return;
                setVaultState('unlocked');
                await refreshHasKey(sessionPassword, providerAndModel);
                return;
            }
            const initialized = await aiSecureStorage.isInitialized();
            if (cancelled) return;
            setVaultState(initialized ? 'locked' : 'create');
        })();
        return () => { cancelled = true; };
    }, [isOpen, sessionPassword, refreshHasKey]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    if (!isOpen) return null;

    const renderIcon = (config: any, defaultTag: string) => {
        if (!config) return null;
        if (config.useReactIcon) {
            return (
                <span style={config.reactIconStyle}>
                    <ReactIconByTag tag={config.reactIconTag || defaultTag} fallback={<BsChatDots />} />
                </span>
            );
        }
        return (
            <Image
                src={config.iconImage}
                alt="Icon"
                width={config.iconImgWidth}
                height={config.iconImgHeight}
                style={{ objectFit: 'contain' }}
            />
        );
    };

    const handleUnlock = async () => {
        const pw = passwordInput;
        if (!pw) return;
        setGateError('');
        try {
            const initialized = await aiSecureStorage.isInitialized();
            if (!initialized) {
                await aiSecureStorage.setPassword(pw);
            } else if (!(await aiSecureStorage.unlock(pw))) {
                setGateError(labels.aiChatWrongPassword || 'Incorrect password.');
                return;
            }
            const providerAndModel = aiStorage.getProvider() || 'openai:gpt-4o-mini';
            const legacyKey = aiStorage.getKey();
            if (legacyKey) {
                await aiSecureStorage.migrateFromPlaintext(
                    pw, providerAndModel.split(':')[0], legacyKey, () => aiStorage.clearKey(),
                );
            }
            setSessionPassword(pw);
            setPasswordInput('');
            setVaultState('unlocked');
            await refreshHasKey(pw, providerAndModel);
        } catch {
            setGateError(labels.aiChatWrongPassword || 'Incorrect password.');
        }
    };

    const handleResetPassword = async () => {
        // Forgot password: wipe the vault (all stored keys) and start over with
        // a fresh password. Also clear any legacy plaintext key.
        await aiSecureStorage.reset();
        aiStorage.clearKey();
        setSessionPassword(null);
        setPasswordInput('');
        setGateError('');
        setHasKey(false);
        setIsResetPopupOpen(false);
        setVaultState('create');
    };

    const handleSaveKey = async (providerAndModel: string, key: string) => {
        if (!sessionPassword) return;
        aiStorage.saveProvider(providerAndModel);
        setProviderName(providerAndModel);
        const bare = providerAndModel.split(':')[0];
        if (key) {
            await aiSecureStorage.saveKey(sessionPassword, bare, key);
        }
        await refreshHasKey(sessionPassword, providerAndModel);
        setIsSettingsOpen(false);
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const type = file.type.startsWith('audio/') ? 'audio' : 'image';
        const base64Str = await getBase64(file);
        const base64Data = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
        const newAttachment: MultimodalAttachment = {
            type: type as 'audio' | 'image',
            mimeType: file.type,
            base64: base64Data
        };
        setPendingAttachments(prev => [...prev, newAttachment]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = () => {
        if (isLoading) {
            cancelMessage();
        } else {
            sendMessage(inputValue, pendingAttachments);
            setInputValue('');
            setPendingAttachments([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`${styles.drawerOverlay} ${isExpanded ? styles.drawerOverlayExpanded : ''}`} onClick={onClose}>
            <div
                className={`${styles.drawerContent} ${isExpanded ? styles.drawerExpanded : ''}`}
                style={{
                    width: isExpanded ? undefined : `${drawerWidth}px`,
                    transition: isDragging ? 'none' : undefined
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {!isExpanded && (
                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '6px',
                            cursor: 'ew-resize',
                            zIndex: 10,
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    />
                )}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <div className={styles.aiIcon}>
                            {renderIcon(icons.open, "BsChatDots")}
                        </div>
                        <h2 className={styles.titleText}>{labels.aiChatTitle}</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setIsClearChatPopupOpen(true)}
                            aria-label={"Clear Chat"}
                            title={labels.aiChatClearChatPopupTitle}
                            className={styles.closeButton}
                        >
                            {renderIcon(icons.clearChat, "FiMessageSquare")}
                        </button>
                        <button
                            onClick={() => setIsClearDataPopupOpen(true)}
                            aria-label={"Clear Data"}
                            title={labels.aiChatClearDataPopupTitle}
                            className={styles.closeButton}
                        >
                            {renderIcon(icons.clearData, "FiDatabase")}
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            aria-label={labels.aiChatConfigTitle}
                            title={labels.aiChatConfigTitle}
                            className={styles.closeButton}
                        >
                            {renderIcon(icons.settings, "FiSettings")}
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-label={"Expand or Collapse"}
                            title={"Expand or Collapse"}
                            className={styles.closeButton}
                        >
                            {renderIcon(isExpanded ? icons.collapse : icons.expand, isExpanded ? "FiMinimize2" : "FiMaximize2")}
                        </button>
                        <button
                            onClick={onClose}
                            aria-label={labels.aiChatCloseBtnAriaLabel}
                            title={labels.aiChatCloseBtnAriaLabel}
                            className={styles.closeButton}
                        >
                            {renderIcon(icons.close, "IoClose")}
                        </button>
                    </div>
                </div>

                <ConfirmPopup
                    isOpen={isClearChatPopupOpen}
                    title={labels.aiChatClearChatPopupTitle}
                    description={labels.aiChatClearChatPopupDesc}
                    confirmText={labels.aiChatClearChatConfirmBtn}
                    cancelText={labels.aiChatClearChatCancelBtn}
                    onConfirm={() => clearMessages()}
                    onCancel={() => setIsClearChatPopupOpen(false)}
                />

                <ConfirmPopup
                    isOpen={isClearDataPopupOpen}
                    title={labels.aiChatClearDataPopupTitle}
                    description={labels.aiChatClearDataPopupDesc}
                    confirmText={labels.aiChatClearDataConfirmBtn}
                    cancelText={labels.aiChatClearDataCancelBtn}
                    onConfirm={async () => {
                        if (sessionPassword) {
                            const bare = (aiStorage.getProvider() || 'openai:gpt-4o-mini').split(':')[0];
                            try { await aiSecureStorage.removeKey(sessionPassword, bare); } catch { /* ignore */ }
                        }
                        aiStorage.clearKey();
                        setHasKey(false);
                        setSessionPassword(null);
                        setVaultState('locked');
                        setIsClearDataPopupOpen(false);
                        clearMessages();
                    }}
                    onCancel={() => setIsClearDataPopupOpen(false)}
                />

                <ConfirmPopup
                    isOpen={isResetPopupOpen}
                    title={labels.aiChatResetPopupTitle || 'Reset password?'}
                    description={labels.aiChatResetPopupDesc || 'This erases all saved API keys and the local password. You will then create a new password. This cannot be undone.'}
                    confirmText={labels.aiChatResetConfirmBtn || 'Reset and erase'}
                    cancelText={labels.aiChatResetCancelBtn || 'Cancel'}
                    isDestructive
                    onConfirm={() => void handleResetPassword()}
                    onCancel={() => setIsResetPopupOpen(false)}
                />

                <div className={styles.messagesArea}>
                    {vaultState !== 'unlocked' ? (
                        <div
                            data-testid="ai-chat-gate"
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}
                        >
                            {vaultState === 'loading' ? (
                                <p style={{ color: 'var(--text-secondary)' }}>…</p>
                            ) : (
                                <>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {vaultState === 'create'
                                            ? (labels.aiChatPasswordCreateDesc || 'Create a local password to encrypt your API keys.')
                                            : (labels.aiChatPasswordUnlockDesc || 'Enter your local password to unlock.')}
                                    </p>
                                    <input
                                        data-testid="drawer-password-input"
                                        type="password"
                                        value={passwordInput}
                                        onChange={e => setPasswordInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleUnlock(); } }}
                                        placeholder={labels.aiChatPasswordPlaceholder || 'Local password'}
                                        className={styles.formInput}
                                        style={{ maxWidth: 280 }}
                                    />
                                    <button
                                        data-testid="drawer-unlock-button"
                                        onClick={() => void handleUnlock()}
                                        className={styles.btnPrimary}
                                    >
                                        {vaultState === 'create'
                                            ? (labels.aiChatCreatePasswordBtn || 'Create password')
                                            : (labels.aiChatUnlockBtn || 'Unlock')}
                                    </button>
                                    {gateError && <p data-testid="drawer-gate-error" style={{ color: '#f85149' }}>{gateError}</p>}
                                    {vaultState === 'locked' && (
                                        <button
                                            type="button"
                                            data-testid="drawer-reset-password"
                                            onClick={() => setIsResetPopupOpen(true)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                                        >
                                            {labels.aiChatResetBtn || 'Forgot password? Reset (erases saved keys)'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ) : !hasKey || isSettingsOpen ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ApiKeyForm onSave={handleSaveKey} labels={labels} />
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 && (
                                <div className={styles.messageRow}>
                                    <div className={styles.avatarAi}>
                                        {renderIcon(icons.open, "BsChatDots")}
                                    </div>
                                    <div className={styles.bubbleAi}>
                                        <p>
                                            {labels.aiChatEmptyStateGreeting}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                if (msg.role === 'system') return null;

                                const isUser = msg.role === 'user';

                                return (
                                    <div key={msg.id || index.toString()} className={isUser ? styles.messageRowUser : styles.messageRow}>
                                        <div className={isUser ? styles.avatarUser : styles.avatarAi}>
                                            {isUser ? (labels.aiChatUserLabel || 'You') : renderIcon(icons.open, "BsChatDots")}
                                        </div>
                                        <div className={isUser ? styles.bubbleUser : styles.bubbleAi}>
                                            <div
                                                className={styles.markdownContent}
                                                dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                <div className={styles.messageRow}>
                                    <div className={styles.avatarAi}>
                                        {renderIcon(icons.open, "BsChatDots")}
                                    </div>
                                    <div className={styles.bubbleAi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className={styles.typingIndicator}>
                                            <div className={styles.dot} />
                                            <div className={styles.dot} />
                                            <div className={styles.dot} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {vaultState === 'unlocked' && hasKey && !isSettingsOpen && (
                    <div className={styles.inputArea}>
                        {pendingAttachments.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0 8px 8px', display: 'flex', alignItems: 'center' }}>
                                {pendingAttachments.length} arquivo(s) anexado(s)
                                <button onClick={() => setPendingAttachments([])} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>Remover</button>
                            </div>
                        )}
                        <div className={styles.inputContainer}>
                            <textarea
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={labels.aiChatPlaceholder}
                                className={styles.textArea}
                                rows={1}
                            />

                            <div className={styles.inputActions}>
                                <div className={styles.actionButtons}>
                                    <button className={styles.actionButton} title={labels.aiChatAttachAriaLabel} onClick={() => fileInputRef.current?.click()}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept={providerName === 'gemini' ? 'image/*, audio/*' : 'image/*'}
                                        onChange={handleFileAttachment}
                                    />
                                </div>

                                <button
                                    onClick={handleSend}
                                    className={styles.sendButton}
                                    data-active={inputValue.trim().length > 0 || isLoading}
                                    disabled={!inputValue.trim() && !isLoading}
                                    title={isLoading ? "Cancelar Resposta" : labels.aiChatSendBtn}
                                >
                                    {isLoading ? renderIcon(icons.cancel, "FiXCircle") : renderIcon(icons.send, "FiSend")}
                                </button>
                            </div>
                        </div>
                        <div className={styles.disclaimer}>
                            {labels.aiChatDisclaimer}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
