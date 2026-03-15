import { FiX } from "react-icons/fi";
import styles from "../docs-shell.module.css";

interface DocsShellFocusOverlayProps {
  isOpen: boolean;
  focusModeLabel: string;
  menuCloseLabel: string;
  previousLabel: string;
  nextLabel: string;
  focusModeCurrentHtml: string;
  canFocusModeGoPrevious: boolean;
  canFocusModeGoNext: boolean;
  onClose: () => void;
  onNavigate: (offset: -1 | 1) => void;
}

export function DocsShellFocusOverlay({
  isOpen,
  focusModeLabel,
  menuCloseLabel,
  previousLabel,
  nextLabel,
  focusModeCurrentHtml,
  canFocusModeGoPrevious,
  canFocusModeGoNext,
  onClose,
  onNavigate,
}: DocsShellFocusOverlayProps) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.focusModeOverlay} onClick={onClose}>
      <div className={styles.focusModeCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.focusModeHeader}>
          <strong>{focusModeLabel}</strong>
          <button className={`${styles.button} ${styles.focusModeCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        <div className={styles.focusModeBody}>
          <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: focusModeCurrentHtml }} />
        </div>
        <div className={styles.focusModeFooter}>
          <button className={styles.button} onClick={() => onNavigate(-1)} disabled={!canFocusModeGoPrevious}>
            {previousLabel}
          </button>
          <button className={styles.button} onClick={() => onNavigate(1)} disabled={!canFocusModeGoNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
