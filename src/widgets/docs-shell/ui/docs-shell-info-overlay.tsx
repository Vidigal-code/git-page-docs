import { FiX } from "react-icons/fi";
import styles from "../docs-shell.module.css";

interface DocsShellInfoOverlayProps {
  isOpen: boolean;
  lastUpdateLabel: string;
  updateDate: string;
  menuCloseLabel: string;
  onClose: () => void;
}

export function DocsShellInfoOverlay({ isOpen, lastUpdateLabel, updateDate, menuCloseLabel, onClose }: DocsShellInfoOverlayProps) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.versionLinksOverlay} onClick={onClose} role="presentation">
      <div className={styles.versionLinksCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={lastUpdateLabel}>
        <div className={styles.versionLinksHeader}>
          <strong>{lastUpdateLabel}</strong>
          <button className={`${styles.button} ${styles.versionLinksCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        <div className={styles.versionLinksList}>
          <p className={styles.infoOverlayDate}>{updateDate}</p>
        </div>
      </div>
    </div>
  );
}
