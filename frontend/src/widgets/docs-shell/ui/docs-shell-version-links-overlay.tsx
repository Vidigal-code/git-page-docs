"use client";

import { useEffect, useId, useRef } from "react";
import type { VersionLinkOption } from "@/entities/docs";
import { FiExternalLink, FiX } from "@/shared/ui/fallback-icons";
import styles from "./docs-shell-version-links-overlay.module.css";

interface DocsShellVersionLinksOverlayProps {
  isOpen: boolean;
  versionLinksLabel: string;
  menuCloseLabel: string;
  options: VersionLinkOption[];
  onClose: () => void;
}

export function DocsShellVersionLinksOverlay({
  isOpen,
  versionLinksLabel,
  menuCloseLabel,
  options,
  onClose,
}: Readonly<DocsShellVersionLinksOverlayProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const isVisible = isOpen && options.length > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isVisible || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeButtonRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  const groups = new Map<VersionLinkOption["id"], VersionLinkOption[]>();
  for (const option of options) {
    const entries = groups.get(option.id) ?? [];
    entries.push(option);
    groups.set(option.id, entries);
  }

  return (
    <dialog ref={dialogRef} className={styles.overlay} aria-labelledby={titleId} onCancel={onClose}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-hidden tabIndex={-1} />
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>{versionLinksLabel}</h2>
          <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </header>
        <div className={styles.content}>
          {Array.from(groups, ([category, entries]) => (
            <section key={category} aria-labelledby={`${titleId}-${category}`}>
              <h3 id={`${titleId}-${category}`} className={styles.groupTitle}>
                {entries[0].label}
                <span className={styles.count} aria-hidden>{entries.length}</span>
              </h3>
              <ul className={styles.list}>
                {entries.map((option) => (
                  <li key={JSON.stringify([option.url, option.name])}>
                    <a
                      className={styles.link}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={option.name ?? option.label}
                      onClick={onClose}
                    >
                      <span className={styles.linkHeading}>
                        <span dir="auto">{option.name ?? option.label}</span>
                        <FiExternalLink className={styles.externalIcon} aria-hidden />
                      </span>
                      <span className={styles.linkUrl} dir="ltr">{option.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
