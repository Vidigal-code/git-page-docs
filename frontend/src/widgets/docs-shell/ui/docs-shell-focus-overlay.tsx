import { useEffect, useMemo, useRef, type PointerEvent, type ReactNode } from "react";
import { TocTree, TocScrollContainerProvider } from "@/features/route-guide";
import { FiChevronRight, FiChevronsLeft, FiChevronsRight, FiX } from "@/shared/ui/fallback-icons";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import type { FocusModeOptions } from "@/entities/docs";
import type { FocusNavigationTarget } from "../model/focus-navigation";
import { FocusNavigationGroup } from "./focus-navigation-group";
import { MdSourceActions, type MdSourceActionLabels } from "./content-type-containers/md-source-actions";
import styles from "../docs-shell.module.css";

export interface FocusDocumentView {
  id: string;
  title: string;
  description?: string;
  source?: string;
  fileName: string;
  index: number;
  count: number;
}

export interface FocusDocumentNavigation {
  firstLabel: string;
  lastLabel: string;
  previousLabel: string;
  nextLabel: string;
  firstTitle?: string;
  lastTitle?: string;
  previousTitle?: string;
  nextTitle?: string;
  onNavigate: (target: FocusNavigationTarget) => void;
}

interface DocsShellFocusOverlayProps {
  isOpen: boolean;
  focusModeLabel: string;
  menuCloseLabel: string;
  firstLabel: string;
  lastLabel: string;
  previousLabel: string;
  nextLabel: string;
  sectionsLabel: string;
  documentsLabel: string;
  focusModeCurrentHtml: string;
  sectionIndex: number;
  sectionCount: number;
  document: FocusDocumentView;
  documentNavigation: FocusDocumentNavigation;
  sourceActionLabels: MdSourceActionLabels;
  options?: FocusModeOptions;
  accessibilityControls?: ReactNode;
  containerPagination?: ReactNode;
  containerPaginationTop?: ReactNode;
  onClose: () => void;
  onNavigate: (target: FocusNavigationTarget) => void;
}

export function DocsShellFocusOverlay({
  isOpen, focusModeLabel, menuCloseLabel, firstLabel, lastLabel, previousLabel, nextLabel, sectionsLabel, documentsLabel,
  focusModeCurrentHtml, sectionIndex, sectionCount,
  document: focusDocument, documentNavigation, sourceActionLabels, options, accessibilityControls, containerPagination, containerPaginationTop, onClose, onNavigate,
}: Readonly<DocsShellFocusOverlayProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const markers = useMemo(() => {
    if (!isOpen || typeof document === "undefined") return [];
    const template = document.createElement("template");
    template.innerHTML = focusModeCurrentHtml;
    return [...template.content.querySelectorAll<HTMLElement>("[data-markdown-marker-label][id]")].map((element) => ({
      id: element.id, text: element.dataset.markdownMarkerLabel ?? "", level: 2,
    }));
  }, [isOpen, focusModeCurrentHtml]);

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
            {focusDocument.description && <p>{focusDocument.description}</p>}
          </div>
          {focusDocument.source !== undefined && <MdSourceActions key={focusDocument.id}
            source={focusDocument.source} fileName={focusDocument.fileName} labels={sourceActionLabels}
            placement="inline" copyEnabled={options?.copyEnabled} downloadEnabled={options?.downloadEnabled} />}
          <button type="button" className={`${styles.button} ${styles.focusModeCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        <div ref={bodyRef} className={styles.focusModeBody}>
          {accessibilityControls}
          {containerPaginationTop}
          {markers.length > 0 && <TocScrollContainerProvider scrollContainerRef={bodyRef}><TocTree headings={markers} /></TocScrollContainerProvider>}
          <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: focusModeCurrentHtml }} />
        </div>
        <div className={`${styles.focusModeFooter} ${styles.focusModeNavigation}`}>
          {containerPagination}
          {options?.documentNavigationEnabled !== false && <FocusNavigationGroup
            label={documentsLabel} index={focusDocument.index} count={focusDocument.count}
            labels={{ first: documentNavigation.firstLabel, previous: documentNavigation.previousLabel, next: documentNavigation.nextLabel, last: documentNavigation.lastLabel }}
            titles={{ first: documentNavigation.firstTitle, previous: documentNavigation.previousTitle, next: documentNavigation.nextTitle, last: documentNavigation.lastTitle }}
            stepIcons={{ previous: <FiChevronsLeft aria-hidden />, next: <FiChevronsRight aria-hidden /> }} onNavigate={documentNavigation.onNavigate} />}
          {options?.sectionNavigationEnabled !== false && <FocusNavigationGroup
            label={sectionsLabel} index={sectionIndex} count={sectionCount}
            labels={{ first: firstLabel, previous: previousLabel, next: nextLabel, last: lastLabel }}
            stepIcons={{ previous: <FiChevronLeft aria-hidden />, next: <FiChevronRight aria-hidden /> }} onNavigate={onNavigate} />}
        </div>
      </dialog>
    </div>
  );
}
