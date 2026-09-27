/**
 * @file inactivity-lock-dialog.tsx
 * @description Countdown shown before the AI chat locks itself for inactivity.
 * A real modal: centered, covers everything behind it, keeps keyboard focus
 * inside, and is painted with the active theme's variables.
 */
import React, { useEffect, useId, useRef } from 'react';
import { FiLock } from '@/shared/ui/fallback-icons';
import styles from './inactivity-lock-dialog.module.css';

export interface InactivityLockDialogLabels {
    title: string;
    /** May contain `{seconds}`, replaced by the live countdown. */
    description: string;
    confirm: string;
    cancel: string;
}

interface InactivityLockDialogProps {
    open: boolean;
    remaining: number;
    labels: InactivityLockDialogLabels;
    /** Lock right away. */
    onConfirm: () => void;
    /** Keep the session and restart the quiet period. */
    onCancel: () => void;
}

export function InactivityLockDialog({ open, remaining, labels, onConfirm, onCancel }: Readonly<InactivityLockDialogProps>) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    // Focus lands on the safe action; whatever had focus before gets it back on close.
    useEffect(() => {
        if (!open) return undefined;
        const previous = document.activeElement as HTMLElement | null;
        cancelRef.current?.focus();
        return () => previous?.focus?.();
    }, [open]);

    if (!open) return null;

    const description = labels.description.replace('{seconds}', String(remaining));

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
            return;
        }
        if (event.key !== 'Tab') return;
        // Two focusable controls: Tab and Shift+Tab cycle between them.
        event.preventDefault();
        const order = [cancelRef.current, confirmRef.current];
        const index = order.indexOf(document.activeElement as HTMLButtonElement | null);
        const step = event.shiftKey ? -1 : 1;
        const next = (index + step + order.length) % order.length;
        order[next]?.focus();
    };

    return (
        <div className={styles.overlay}>
            <dialog
                open
                className={styles.dialog}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                data-testid="ai-lock-dialog"
                onKeyDown={handleKeyDown}
            >
                <span className={styles.icon} aria-hidden>
                    <FiLock />
                </span>
                <h2 id={titleId} className={styles.title}>{labels.title}</h2>
                <p id={descriptionId} className={styles.description}>{description}</p>
                <div className={styles.countdown} data-testid="ai-lock-countdown" aria-live="polite">
                    {remaining}
                </div>
                <div className={styles.actions}>
                    <button
                        ref={cancelRef}
                        type="button"
                        data-testid="ai-lock-cancel"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={onCancel}
                    >
                        {labels.cancel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        data-testid="ai-lock-confirm"
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={onConfirm}
                    >
                        {labels.confirm}
                    </button>
                </div>
            </dialog>
        </div>
    );
}
