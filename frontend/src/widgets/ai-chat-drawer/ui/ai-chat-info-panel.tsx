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

type LabelKey = keyof AiChatInfoLabels;
type InfoListStyle = 'bulleted' | 'numbered';
type InfoTone = 'neutral' | 'warning';

interface InfoSectionSpec {
    readonly testId: string;
    readonly titleKey: LabelKey;
    readonly itemsKey: LabelKey;
    readonly listStyle: InfoListStyle;
    readonly tone: InfoTone;
}

/** The guide's sections, in reading order; each item list is one langmenu value, one item per line. */
const INFO_SECTIONS: readonly InfoSectionSpec[] = [
    { testId: 'ai-chat-info-works', titleKey: 'aiChatInfoWorksTitle', itemsKey: 'aiChatInfoWorksItems', listStyle: 'bulleted', tone: 'neutral' },
    { testId: 'ai-chat-info-how', titleKey: 'aiChatInfoHowTitle', itemsKey: 'aiChatInfoHowItems', listStyle: 'numbered', tone: 'neutral' },
    { testId: 'ai-chat-info-flow', titleKey: 'aiChatInfoFlowTitle', itemsKey: 'aiChatInfoFlowItems', listStyle: 'bulleted', tone: 'neutral' },
    { testId: 'ai-chat-info-risks', titleKey: 'aiChatInfoRisksTitle', itemsKey: 'aiChatInfoRisksItems', listStyle: 'bulleted', tone: 'warning' },
];

/** Placeholder in the copy replaced by the configured auto-lock time. */
const SECONDS_PLACEHOLDER = '{seconds}';

function pick(labels: AiChatInfoLabels, key: LabelKey): string {
    return labels[key] || FALLBACK[key];
}

function toItems(text: string, seconds: number): string[] {
    return text
        .split('\n')
        .map((line) => line.trim().replace(SECONDS_PLACEHOLDER, String(seconds)))
        .filter(Boolean);
}

interface InfoSectionProps {
    readonly spec: InfoSectionSpec;
    readonly title: string;
    readonly items: readonly string[];
}

function InfoSection({ spec, title, items }: Readonly<InfoSectionProps>) {
    const List = spec.listStyle === 'numbered' ? 'ol' : 'ul';
    const toneClass = spec.tone === 'warning' ? styles.infoSectionWarning : '';
    return (
        <section className={`${styles.infoSection} ${toneClass}`} data-testid={spec.testId}>
            <h4 className={styles.infoSectionTitle}>{title}</h4>
            <List className={styles.infoList}>
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </List>
        </section>
    );
}

interface AiChatInfoPanelProps {
    labels: AiChatInfoLabels;
    /** `site.AiChatAutoLockSeconds`, shown in the inactivity item (0 or unset shows the default). */
    autoLockSeconds?: number;
    onClose: () => void;
}

export function AiChatInfoPanel({ labels, autoLockSeconds, onClose }: Readonly<AiChatInfoPanelProps>) {
    const displaySeconds = autoLockSeconds && autoLockSeconds > 0 ? autoLockSeconds : DEFAULT_AUTO_LOCK_SECONDS;
    const titleId = React.useId();

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
                {INFO_SECTIONS.map((spec) => (
                    <InfoSection
                        key={spec.testId}
                        spec={spec}
                        title={pick(labels, spec.titleKey)}
                        items={toItems(pick(labels, spec.itemsKey), displaySeconds)}
                    />
                ))}
                <button type="button" className={styles.btnPrimary} onClick={onClose}>
                    {pick(labels, 'aiChatInfoBackBtn')}
                </button>
            </article>
        </div>
    );
}
