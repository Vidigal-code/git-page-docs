import { FiX } from "@/shared/ui/fallback-icons";
import styles from "../docs-shell.module.css";

interface DocsShellInfoOverlayProps {
  isOpen: boolean;
  lastUpdateLabel: string;
  updateDate: string;
  menuCloseLabel: string;
  onClose: () => void;
}

export function DocsShellInfoOverlay({ isOpen, lastUpdateLabel, updateDate, menuCloseLabel, onClose }: Readonly<DocsShellInfoOverlayProps>) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.versionLinksOverlay}>
      <button type="button" className={styles.overlayBackdrop} onClick={onClose} aria-label={menuCloseLabel} tabIndex={-1} />
      <dialog open className={styles.versionLinksCard} aria-modal="true" aria-label={lastUpdateLabel}>
        <div className={styles.versionLinksHeader}>
          <strong>{lastUpdateLabel}</strong>
          <button className={`${styles.button} ${styles.versionLinksCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        <div className={styles.versionLinksList}>
          <p className={styles.infoOverlayDate}>{updateDate}</p>
        </div>
      </dialog>
    </div>
  );
}
