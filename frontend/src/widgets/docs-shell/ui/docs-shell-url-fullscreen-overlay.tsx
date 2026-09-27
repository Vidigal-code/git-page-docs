"use client";

import { useCallback, useEffect, useRef } from "react";
import { FiX } from "@/shared/ui/fallback-icons";
import { TocScrollContainerProvider } from "@/features/route-guide";
import { PageContentArea } from "./page-content-area";
import type { LoadedDocsData } from "@/entities/docs";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { BrowseNavigationProps, BrowseState, ContentLabels } from "../model/content-browse-props";
import { resolveFullscreenPageIndex } from "../model/use-docs-shell-fullscreen.helpers";
import { getFullscreenAlign, getFullscreenInnerClassName } from "./content-type-containers/fullscreen-alignment";
import styles from "../docs-shell.module.css";

interface DocsShellUrlFullscreenOverlayProps {
  isOpen: boolean;
  params: FullscreenParams | null;
  data: LoadedDocsData;
  language: string;
  isDarkMode: boolean;
  labels: ContentLabels;
  browse: BrowseState;
  navigation: BrowseNavigationProps;
  onClose: () => void;
}

export function DocsShellUrlFullscreenOverlay({
  isOpen,
  params,
  data,
  language,
  isDarkMode,
  labels,
  browse,
  navigation,
  onClose,
}: Readonly<DocsShellUrlFullscreenOverlayProps>) {
  const fullscreenInnerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !params) {
    return null;
  }

  const overlayLanguage = params.lang ?? language;
  const pageIndex = resolveFullscreenPageIndex(data, params);
  const currentPage = data.pages?.[pageIndex] ?? data.pages?.[0];
  const innerClassName = getFullscreenInnerClassName(getFullscreenAlign(params.type));

  return (
    <dialog
      open
      className={styles.contentContainerFullscreen}
      aria-modal="true"
      aria-label={labels.menuCloseLabel}
    >
      <button
        type="button"
        className={styles.fullscreenCloseButton}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-label={labels.menuCloseLabel}
        title={labels.menuCloseLabel}
      >
        <FiX aria-hidden />
      </button>
      <div ref={fullscreenInnerRef} className={innerClassName}>
        <TocScrollContainerProvider scrollContainerRef={fullscreenInnerRef}>
          <PageContentArea
            currentPage={currentPage}
            data={data}
            language={overlayLanguage}
            isDarkMode={isDarkMode}
            contentTypeFilter={params.type ?? undefined}
            isUrlFullscreen={true}
            labels={labels}
            browse={browse}
            navigation={navigation}
          />
        </TocScrollContainerProvider>
      </div>
    </dialog>
  );
}
