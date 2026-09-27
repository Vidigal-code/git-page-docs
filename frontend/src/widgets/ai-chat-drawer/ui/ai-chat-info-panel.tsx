/**
 * @file ai-chat-info-panel.tsx
 * @description "How it works" tab of the AI chat drawer: how the assistant
 * protects the API key, how to use it, every event of the flow the user may
 * run into, and the risks that remain. All copy comes from the langmenu
 * (`aiChatInfo*` keys, one list item per line) with English fallbacks.
 */
import React from 'react';
import { FiAlertCircle } from '@/shared/ui/fallback-icons';
import { DEFAULT_AUTO_LOCK_SECONDS } from '../../../features/ask-ai/model/inactivity-lock';
import styles from './ai-chat.module.css';
import { AI_CHAT_INFO_FALLBACK as FALLBACK, type AiChatInfoLabels } from './ai-chat-info-copy';

export type { AiChatInfoLabels } from './ai-chat-info-copy';

function pick(labels: AiChatInfoLabels, key: keyof AiChatInfoLabels): string {
    return labels[key] || FALLBACK[key];
}

function lines(text: string, seconds: number): string[] {
    return text
        .split('\n')
        .map((line) => line.trim().replace('{seconds}', String(seconds)))
        .filter(Boolean);
}

interface AiChatInfoPanelProps {
    labels: AiChatInfoLabels;
    /** `site.AiChatAutoLockSeconds`, shown in the inactivity item. */
    autoLockSeconds?: number;
    onClose: () => void;
}

export function AiChatInfoPanel({ labels, autoLockSeconds, onClose }: Readonly<AiChatInfoPanelProps>) {
    const seconds = autoLockSeconds && autoLockSeconds > 0 ? autoLockSeconds : DEFAULT_AUTO_LOCK_SECONDS;
    const titleId = React.useId();

    const section = (titleKey: keyof AiChatInfoLabels, itemsKey: keyof AiChatInfoLabels, ordered = false, testId?: string, warning = false) => {
        const items = lines(pick(labels, itemsKey), seconds).map((item) => <li key={item}>{item}</li>);
        return (
            <section className={`${styles.infoSection} ${warning ? styles.infoSectionWarning : ''}`} data-testid={testId}>
                <h4 className={styles.infoSectionTitle}>{pick(labels, titleKey)}</h4>
                {ordered ? <ol className={styles.infoList}>{items}</ol> : <ul className={styles.infoList}>{items}</ul>}
            </section>
        );
    };

    return (
        <div className={styles.infoArea} data-testid="ai-chat-info-panel">
            <article className={styles.infoContainer} aria-labelledby={titleId}>
                <header className={styles.infoHeader}>
                    <span className={styles.infoIcon} aria-hidden>
                        <FiAlertCircle />
                    </span>
                    <h3 id={titleId}>{pick(labels, 'aiChatInfoTitle')}</h3>
                </header>
                <p className={styles.infoIntro}>{pick(labels, 'aiChatInfoIntro')}</p>
                {section('aiChatInfoWorksTitle', 'aiChatInfoWorksItems', false, 'ai-chat-info-works')}
                {section('aiChatInfoHowTitle', 'aiChatInfoHowItems', true, 'ai-chat-info-how')}
                {section('aiChatInfoFlowTitle', 'aiChatInfoFlowItems', false, 'ai-chat-info-flow')}
                {section('aiChatInfoRisksTitle', 'aiChatInfoRisksItems', false, 'ai-chat-info-risks', true)}
                <button type="button" className={styles.btnPrimary} onClick={onClose}>
                    {pick(labels, 'aiChatInfoBackBtn')}
                </button>
            </article>
        </div>
    );
}
