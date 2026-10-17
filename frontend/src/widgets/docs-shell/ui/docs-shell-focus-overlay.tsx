import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { FiChevronRight, FiChevronsLeft, FiChevronsRight, FiX } from "@/shared/ui/fallback-icons";
import type { FocusModeOptions } from "@/entities/docs";
import { MdSourceActions, type MdSourceActionLabels } from "./content-type-containers/md-source-actions";
import styles from "../docs-shell.module.css";

export interface FocusDocumentView {
  id: string;
  title: string;
  source?: string;
  fileName: string;
  index: number;
  count: number;
}

export interface FocusDocumentNavigation {
  previousLabel: string;
  nextLabel: string;
  previousTitle?: string;
  nextTitle?: string;
  onNavigate: (offset: -1 | 1) => void;
}

interface DocsShellFocusOverlayProps {
  isOpen: boolean;
  focusModeLabel: string;
  menuCloseLabel: string;
  previousLabel: string;
  nextLabel: string;
  sectionsLabel: string;
  documentsLabel: string;
  focusModeCurrentHtml: string;
  sectionIndex: number;
  sectionCount: number;
  canFocusModeGoPrevious: boolean;
  canFocusModeGoNext: boolean;
  document: FocusDocumentView;
  documentNavigation: FocusDocumentNavigation;
  sourceActionLabels: MdSourceActionLabels;
  options?: FocusModeOptions;
  accessibilityControls?: ReactNode;
  onClose: () => void;
  onNavigate: (offset: -1 | 1) => void;
}

export function DocsShellFocusOverlay({
  isOpen, focusModeLabel, menuCloseLabel, previousLabel, nextLabel, sectionsLabel, documentsLabel,
  focusModeCurrentHtml, sectionIndex, sectionCount, canFocusModeGoPrevious, canFocusModeGoNext,
  document: focusDocument, documentNavigation, sourceActionLabels, options, accessibilityControls, onClose, onNavigate,
}: Readonly<DocsShellFocusOverlayProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.focus();
    return () => {
      if (typeof dialog.close === "function") dialog.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [focusModeCurrentHtml, focusDocument.id]);

  function closeOnBackdrop(event: PointerEvent<HTMLDialogElement>): void {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }

  if (!isOpen) return null;
  return (
    <div className={styles.focusModeOverlay}>
      <dialog ref={dialogRef} className={styles.focusModeCard} aria-label={focusModeLabel} aria-modal="true" tabIndex={-1}
        onPointerDown={closeOnBackdrop} onCancel={(event) => { event.preventDefault(); onClose(); }}>
        <div className={styles.focusModeHeader}>
          <div className={styles.focusModeTitle}>
            <span>{focusModeLabel}</span>
            <strong>{focusDocument.title}</strong>
          </div>
          {focusDocument.source !== undefined && <MdSourceActions key={focusDocument.id}
            source={focusDocument.source} fileName={focusDocument.fileName} labels={sourceActionLabels}
            placement="inline" copyEnabled={options?.copyEnabled} downloadEnabled={options?.downloadEnabled} />}
          <button type="button" className={`${styles.button} ${styles.focusModeCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        {accessibilityControls}
        <div ref={bodyRef} className={styles.focusModeBody}>
          <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: focusModeCurrentHtml }} />
        </div>
        <div className={`${styles.focusModeFooter} ${styles.focusModeNavigation}`}>
          {options?.documentNavigationEnabled !== false && <nav className={styles.focusModeNavigationGroup} aria-label={documentsLabel}>
            <button type="button" className={styles.focusModeNavButton} onClick={() => documentNavigation.onNavigate(-1)} disabled={!documentNavigation.previousTitle}
              aria-label={documentNavigation.previousLabel} title={documentNavigation.previousTitle ?? documentNavigation.previousLabel}>
              <FiChevronsLeft aria-hidden />
            </button>
            <span className={styles.focusModeCounter}>{documentsLabel}<strong>{Math.max(focusDocument.index + 1, 0)} / {focusDocument.count}</strong></span>
            <button type="button" className={styles.focusModeNavButton} onClick={() => documentNavigation.onNavigate(1)} disabled={!documentNavigation.nextTitle}
              aria-label={documentNavigation.nextLabel} title={documentNavigation.nextTitle ?? documentNavigation.nextLabel}>
              <FiChevronsRight aria-hidden />
            </button>
          </nav>}
          {options?.sectionNavigationEnabled !== false && <nav className={styles.focusModeNavigationGroup} aria-label={sectionsLabel}>
            <button type="button" className={styles.focusModeNavButton} onClick={() => onNavigate(-1)} disabled={!canFocusModeGoPrevious} aria-label={previousLabel} title={previousLabel}>
              <FiChevronRight className={styles.focusModePreviousIcon} aria-hidden />
            </button>
            <span className={styles.focusModeCounter}>{sectionsLabel}<strong>{sectionIndex + 1} / {sectionCount}</strong></span>
            <button type="button" className={styles.focusModeNavButton} onClick={() => onNavigate(1)} disabled={!canFocusModeGoNext} aria-label={nextLabel} title={nextLabel}>
              <FiChevronRight aria-hidden />
            </button>
          </nav>}
        </div>
      </dialog>
    </div>
  );
}
