import { FiX } from "@/shared/ui/fallback-icons";
import styles from "../docs-shell.module.css";

interface VersionLinkOption {
  id: "branch" | "release" | "commit";
  label: string;
  url: string;
}

interface DocsShellVersionLinksOverlayProps {
  isOpen: boolean;
  versionLinksLabel: string;
  menuCloseLabel: string;
  options: VersionLinkOption[];
  onClose: () => void;
  onOpenVersionLink: (url: string) => void;
}

export function DocsShellVersionLinksOverlay({
  isOpen,
  versionLinksLabel,
  menuCloseLabel,
  options,
  onClose,
  onOpenVersionLink,
}: Readonly<DocsShellVersionLinksOverlayProps>) {
  if (!isOpen || !options.length) {
    return null;
  }
  return (
    <div className={styles.versionLinksOverlay}>
      <button type="button" className={styles.overlayBackdrop} onClick={onClose} aria-label={menuCloseLabel} tabIndex={-1} />
      <div className={styles.versionLinksCard}>
        <div className={styles.versionLinksHeader}>
          <strong>{versionLinksLabel}</strong>
          <button className={`${styles.button} ${styles.versionLinksCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        <div className={styles.versionLinksList}>
          {options.map((option) => (
            <button
              key={`version-link-${option.id}`}
              className={styles.button}
              onClick={() => {
                onOpenVersionLink(option.url);
                onClose();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
