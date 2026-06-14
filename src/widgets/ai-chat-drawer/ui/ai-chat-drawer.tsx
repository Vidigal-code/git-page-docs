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

    const { messages, isLoading, sendMessage, cancelMessage, clearMessages } = useAiChat(systemContext, labels);
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
        if (isOpen) {
            setHasKey(!!aiStorage.getKey() || aiStorage.getProvider() === 'ollama');
            setProviderName(aiStorage.getProvider() || 'openai');
        }
    }, [isOpen]);

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

    const handleSaveKey = () => {
        setHasKey(true);
        setProviderName(aiStorage.getProvider() || 'openai');
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
                {/* Resize Handle */}
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
                {/* Header */}
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
                    onConfirm={() => {
                        aiStorage.clearKey();
                        setHasKey(false);
                        clearMessages();
                    }}
                    onCancel={() => setIsClearDataPopupOpen(false)}
                />

                {/* Main Content Area */}
                <div className={styles.messagesArea}>
                    {!hasKey || isSettingsOpen ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ApiKeyForm onSave={handleSaveKey} labels={labels} />
                        </div>
                    ) : (
                        <>
                            {/* Greeting Message */}
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

                {/* Input Area */}
                {hasKey && !isSettingsOpen && (
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
