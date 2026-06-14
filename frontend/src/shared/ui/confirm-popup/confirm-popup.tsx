import React, { useEffect } from 'react';
import styles from './confirm-popup.module.css';

interface ConfirmPopupProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    isDestructive = true
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape') {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h3 id="modal-title" className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonCancel}`}
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`${styles.button} ${isDestructive ? styles.buttonConfirm : ''}`}
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
