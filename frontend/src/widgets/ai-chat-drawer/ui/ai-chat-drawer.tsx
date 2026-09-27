/**
 * @file ai-chat-drawer.tsx
 * @description The floating/drawer chat interface widget supporting multimedia.
 */
import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import Image from 'next/image';
import { BsRobot } from '@/shared/ui/fallback-icons';
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { ApiKeyForm } from '../../../features/ask-ai/ui/api-key-form';
import { aiStorage } from '../../../shared/lib/ai-storage';
import { aiSecureStorage } from '../../../shared/lib/ai-secure-storage';
import { useAiChat } from '../../../features/ask-ai/model/use-ai-chat';
import { normalizeAutoLockSeconds, useInactivityLock } from '../../../features/ask-ai/model/inactivity-lock';
import type { MultimodalAttachment } from '../../../features/ask-ai/api/providers/llm-types';
import { ConfirmPopup } from '../../../shared/ui/confirm-popup/confirm-popup';
import { InactivityLockDialog } from './inactivity-lock-dialog';
import { marked } from 'marked';
import styles from './ai-chat.module.css';

/** Width change (px) per arrow key on the resize handle; the handle sits on the left edge. */
const RESIZE_KEY_DELTAS: Record<string, number> = { ArrowLeft: 24, ArrowRight: -24 };
const DEFAULT_PROVIDER_AND_MODEL = 'openai:gpt-4o-mini';

type VaultState = 'loading' | 'create' | 'locked' | 'unlocked';
type ChatMessage = ReturnType<typeof useAiChat>['messages'][number];

interface AiChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    icons: any;
    labels: any;
    systemContext?: string;
    /** `site.AiChatAutoLockSeconds`: idle seconds before the vault locks again (0 disables, default 30). */
    autoLockSeconds?: number;
}

function renderIcon(config: any, defaultTag: string) {
    if (!config) return null;
    if (config.useReactIcon) {
        return (
            <span style={config.reactIconStyle}>
                <ReactIconByTag tag={config.reactIconTag || defaultTag} fallback={<BsRobot />} />
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
}

function resolveResetPopupLabels(labels: any) {
    return {
        title: labels.aiChatResetPopupTitle || 'Reset password?',
        description: labels.aiChatResetPopupDesc || 'This erases all saved API keys and the local password. You will then create a new password. This cannot be undone.',
        confirmText: labels.aiChatResetConfirmBtn || 'Reset and erase',
        cancelText: labels.aiChatResetCancelBtn || 'Cancel',
    };
}

interface VaultGateProps {
    vaultState: Exclude<VaultState, 'unlocked'>;
    labels: any;
    passwordInput: string;
    gateError: string;
    onPasswordChange: (value: string) => void;
    onUnlock: () => void;
    onRequestReset: () => void;
}

/** Password form of the vault gate: create on first run, unlock afterwards. */
function VaultGateForm({
    vaultState,
    labels,
    passwordInput,
    gateError,
    onPasswordChange,
    onUnlock,
    onRequestReset,
}: Readonly<Omit<VaultGateProps, 'vaultState'> & { vaultState: 'create' | 'locked' }>) {
    const isCreate = vaultState === 'create';
    const description = isCreate
        ? (labels.aiChatPasswordCreateDesc || 'Create a local password to encrypt your API keys.')
        : (labels.aiChatPasswordUnlockDesc || 'Enter your local password to unlock.');
    const unlockLabel = isCreate
        ? (labels.aiChatCreatePasswordBtn || 'Create password')
        : (labels.aiChatUnlockBtn || 'Unlock');
    return (
        <form
            className={styles.formContainer}
            onSubmit={e => { e.preventDefault(); onUnlock(); }}
        >
            <div className={styles.formHeader}>
                <p>{description}</p>
            </div>
            <label className={styles.formGroup}>
                {labels.aiChatPasswordPlaceholder || 'Local password'}
                <input
                    data-testid="drawer-password-input"
                    type="password"
                    value={passwordInput}
                    onChange={e => onPasswordChange(e.target.value)}
                    placeholder={labels.aiChatPasswordPlaceholder || 'Local password'}
                    className={styles.formInput}
                    autoComplete={isCreate ? 'new-password' : 'current-password'}
                />
            </label>
            {gateError && <p data-testid="drawer-gate-error" className={styles.formError} role="alert">{gateError}</p>}
            <div className={styles.formActions}>
                <button
                    type="submit"
                    data-testid="drawer-unlock-button"
                    className={styles.btnPrimary}
                >
                    {unlockLabel}
                </button>
                {vaultState === 'locked' && (
                    <button
                        type="button"
                        data-testid="drawer-reset-password"
                        onClick={onRequestReset}
                        className={styles.linkButton}
                    >
                        {labels.aiChatResetBtn || 'Forgot password? Reset (erases saved keys)'}
                    </button>
                )}
            </div>
        </form>
    );
}

/** Encrypted-vault gate shown until the session password is known. */
function VaultGate({ vaultState, ...formProps }: Readonly<VaultGateProps>) {
    return (
        <div data-testid="ai-chat-gate" className={styles.formArea}>
            {vaultState === 'loading' ? (
                <p style={{ color: 'var(--text-secondary)' }}>…</p>
            ) : (
                <VaultGateForm vaultState={vaultState} {...formProps} />
            )}
        </div>
    );
}

interface ChatMessagesProps {
    messages: ChatMessage[];
    isLoading: boolean;
    labels: any;
    icons: any;
    endRef: React.RefObject<HTMLDivElement | null>;
}

/** Conversation transcript: greeting, messages, and the typing indicator while a reply is pending. */
function ChatMessages({ messages, isLoading, labels, icons, endRef }: Readonly<ChatMessagesProps>) {
    const awaitingReply = isLoading && messages.at(-1)?.role === 'user';
    return (
        <>
            {messages.length === 0 && (
                <div className={styles.messageRow}>
                    <div className={styles.avatarAi}>
                        {renderIcon(icons.open, "BsRobot")}
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
                            {isUser ? (labels.aiChatUserLabel || 'You') : renderIcon(icons.open, "BsRobot")}
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

            {awaitingReply && (
                <div className={styles.messageRow}>
                    <div className={styles.avatarAi}>
                        {renderIcon(icons.open, "BsRobot")}
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
            <div ref={endRef} />
        </>
    );
}

interface ChatComposerProps {
    inputValue: string;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onSend: () => void;
    isLoading: boolean;
    labels: any;
    icons: any;
    providerName: string;
    pendingAttachments: MultimodalAttachment[];
    onClearAttachments: () => void;
    onFileAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

/** Input area: pending attachments, the textarea, attach and send/cancel actions. */
function ChatComposer({
    inputValue,
    onInputChange,
    onKeyDown,
    onSend,
    isLoading,
    labels,
    icons,
    providerName,
    pendingAttachments,
    onClearAttachments,
    onFileAttachment,
    fileInputRef,
}: Readonly<ChatComposerProps>) {
    const hasInput = inputValue.trim().length > 0;
    return (
        <div className={styles.inputArea}>
            {pendingAttachments.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0 8px 8px', display: 'flex', alignItems: 'center' }}>
                    {pendingAttachments.length} {labels.aiChatAttachedFilesLabel}
                    <button onClick={onClearAttachments} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>{labels.aiChatRemoveAttachmentBtn}</button>
                </div>
            )}
            <div className={styles.inputContainer}>
                <textarea
                    value={inputValue}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={onKeyDown}
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
                            onChange={onFileAttachment}
                        />
                    </div>

                    <button
                        onClick={onSend}
                        className={styles.sendButton}
                        data-active={hasInput || isLoading}
                        disabled={!hasInput && !isLoading}
                        title={isLoading ? labels.aiChatCancelResponseLabel : labels.aiChatSendBtn}
                    >
                        {isLoading ? renderIcon(icons.cancel, "FiXCircle") : renderIcon(icons.send, "FiSend")}
                    </button>
                </div>
            </div>
            <div className={styles.disclaimer}>
                {labels.aiChatDisclaimer}
            </div>
        </div>
    );
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ isOpen, onClose, icons, labels, systemContext, autoLockSeconds }) => {
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
    const [vaultState, setVaultState] = useState<VaultState>('loading');
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
        const providerAndModel = aiStorage.getProvider() || DEFAULT_PROVIDER_AND_MODEL;
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

    // Re-lock the vault: drop the in-memory session password so the password gate
    // is shown again before the AI can be used. Stored keys and chat are preserved.
    const lockVault = useCallback(() => {
        setSessionPassword(null);
        setPasswordInput('');
        setGateError('');
        setVaultState('locked');
        setIsSettingsOpen(false);
    }, []);

    // Inactivity auto-lock: a reply being streamed counts as activity.
    const autoLock = useInactivityLock({
        enabled: isOpen && vaultState === 'unlocked' && !isLoading,
        seconds: normalizeAutoLockSeconds(autoLockSeconds),
        onLock: lockVault,
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const drawerContentRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    // Any interaction inside the drawer counts as activity for the auto-lock.
    // Native listeners (not JSX handlers) keep the wrapper a plain container.
    const { registerActivity } = autoLock;
    useEffect(() => {
        const node = drawerContentRef.current;
        if (!node || !isOpen) return undefined;
        const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
        events.forEach((name) => node.addEventListener(name, registerActivity, { passive: true }));
        return () => events.forEach((name) => node.removeEventListener(name, registerActivity));
    }, [isOpen, registerActivity]);

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
        const providerAndModel = aiStorage.getProvider() || DEFAULT_PROVIDER_AND_MODEL;
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
            const providerAndModel = aiStorage.getProvider() || DEFAULT_PROVIDER_AND_MODEL;
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

    const handleLockVault = lockVault;

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

    const handleClearData = async () => {
        if (sessionPassword) {
            const bare = (aiStorage.getProvider() || DEFAULT_PROVIDER_AND_MODEL).split(':')[0];
            try { await aiSecureStorage.removeKey(sessionPassword, bare); } catch { /* ignore */ }
        }
        aiStorage.clearKey();
        setHasKey(false);
        setSessionPassword(null);
        setVaultState('locked');
        setIsClearDataPopupOpen(false);
        clearMessages();
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
            reader.onerror = () => reject(reader.error ?? new Error('Failed to read the attached file'));
        });
    };

    // Keyboard counterpart of the drag handle: arrows move the left edge.
    const handleResizeKeyDown = (e: React.KeyboardEvent) => {
        const delta = RESIZE_KEY_DELTAS[e.key];
        if (isExpanded || !delta) return;
        e.preventDefault();
        setDrawerWidth((width) => Math.max(300, Math.min(800, width + delta)));
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
        autoLock.registerActivity();
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

    const resetLabels = resolveResetPopupLabels(labels);
    const expandIcon = isExpanded ? renderIcon(icons.collapse, "FiMinimize2") : renderIcon(icons.expand, "FiMaximize2");
    const showComposer = vaultState === 'unlocked' && hasKey && !isSettingsOpen;

    let messagesArea: React.ReactNode;
    if (vaultState !== 'unlocked') {
        messagesArea = (
            <VaultGate
                vaultState={vaultState}
                labels={labels}
                passwordInput={passwordInput}
                gateError={gateError}
                onPasswordChange={setPasswordInput}
                onUnlock={() => void handleUnlock()}
                onRequestReset={() => setIsResetPopupOpen(true)}
            />
        );
    } else if (!hasKey || isSettingsOpen) {
        messagesArea = (
            <div className={styles.formArea}>
                <ApiKeyForm onSave={handleSaveKey} labels={labels} />
            </div>
        );
    } else {
        messagesArea = (
            <ChatMessages
                messages={messages}
                isLoading={isLoading}
                labels={labels}
                icons={icons}
                endRef={messagesEndRef}
            />
        );
    }

    return (
        <div className={`${styles.drawerOverlay} ${isExpanded ? styles.drawerOverlayExpanded : ''}`}>
            <button type="button" className={styles.drawerBackdrop} onClick={onClose} aria-label={labels.aiChatCloseBtnAriaLabel} tabIndex={-1} />
            <div
                ref={drawerContentRef}
                className={`${styles.drawerContent} ${isExpanded ? styles.drawerExpanded : ''}`}
                style={{
                    width: isExpanded ? undefined : `${drawerWidth}px`,
                    transition: isDragging ? 'none' : undefined
                }}
            >
                {!isExpanded && (
                    <button
                        type="button"
                        aria-labelledby={titleId}
                        tabIndex={-1}
                        onMouseDown={handleMouseDown}
                        onKeyDown={handleResizeKeyDown}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '6px',
                            margin: 0,
                            padding: 0,
                            border: 0,
                            borderRadius: 0,
                            appearance: 'none',
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
                            {renderIcon(icons.open, "BsRobot")}
                        </div>
                        <h2 id={titleId} className={styles.titleText}>{labels.aiChatTitle}</h2>
                    </div>

                    <div className={styles.headerActions}>
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
                        {vaultState === 'unlocked' && (
                            <button
                                onClick={handleLockVault}
                                aria-label={labels.aiChatLockBtn}
                                title={labels.aiChatLockBtn}
                                className={styles.closeButton}
                            >
                                {renderIcon(icons.lock, "FiLock")}
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-label={"Expand or Collapse"}
                            title={"Expand or Collapse"}
                            className={styles.closeButton}
                        >
                            {expandIcon}
                        </button>
                        <button
                            onClick={onClose}
                            aria-label={labels.aiChatCloseBtnAriaLabel}
                            title={labels.aiChatCloseBtnAriaLabel}
                            className={styles.closeButton}
                        >
                            {renderIcon(icons.close, "IoMdClose")}
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
                    onConfirm={handleClearData}
                    onCancel={() => setIsClearDataPopupOpen(false)}
                />

                <ConfirmPopup
                    isOpen={isResetPopupOpen}
                    title={resetLabels.title}
                    description={resetLabels.description}
                    confirmText={resetLabels.confirmText}
                    cancelText={resetLabels.cancelText}
                    isDestructive
                    onConfirm={() => void handleResetPassword()}
                    onCancel={() => setIsResetPopupOpen(false)}
                />

                <div className={styles.messagesArea}>
                    {messagesArea}
                </div>

                {showComposer && (
                    <ChatComposer
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onKeyDown={handleKeyDown}
                        onSend={handleSend}
                        isLoading={isLoading}
                        labels={labels}
                        icons={icons}
                        providerName={providerName}
                        pendingAttachments={pendingAttachments}
                        onClearAttachments={() => setPendingAttachments([])}
                        onFileAttachment={handleFileAttachment}
                        fileInputRef={fileInputRef}
                    />
                )}
            </div>

            <InactivityLockDialog
                open={autoLock.warningOpen}
                remaining={autoLock.remaining}
                labels={{
                    title: labels.aiChatAutoLockTitle || 'Inactivity lock',
                    description: labels.aiChatAutoLockDesc || 'You have not used the AI for a while. The chat locks and your keys stay encrypted in {seconds}s.',
                    confirm: labels.aiChatAutoLockConfirmBtn || 'OK',
                    cancel: labels.aiChatAutoLockCancelBtn || 'Cancel',
                }}
                onConfirm={autoLock.lockNow}
                onCancel={autoLock.cancelWarning}
            />
        </div>
    );
};
