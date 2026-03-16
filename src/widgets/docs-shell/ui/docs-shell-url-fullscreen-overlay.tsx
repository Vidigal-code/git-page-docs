"use client";

import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { TocScrollContainerProvider } from "@/features/route-guide/model/toc-scroll-context";
import { PageContentArea } from "./page-content-area";
import type {
  LoadedDocsData,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedVideoContent,
} from "@/entities/docs/model/types";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { BrowseItem } from "../model/use-docs-shell-navigation-state";
import type { BreadcrumbItem } from "../model/menu-tree";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import styles from "../docs-shell.module.css";

interface DocsShellUrlFullscreenOverlayProps {
  isOpen: boolean;
  params: FullscreenParams | null;
  data: LoadedDocsData;
  language: string;
  isDarkMode: boolean;
  menuCloseLabel: string;
  fullscreenExpandLabel: string;
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel?: string;
  browseNextLabel?: string;
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  setMdBrowseIndex: (v: number | ((p: number) => number)) => void;
  setHtmlBrowseIndex: (v: number | ((p: number) => number)) => void;
  setVideoBrowseIndex: (v: number | ((p: number) => number)) => void;
  mdItems: BrowseItem<LoadedMdContent>[];
  htmlItems: BrowseItem<LoadedHtmlContent>[];
  videoItems: BrowseItem<LoadedVideoContent>[];
  routeGuideEnabled?: boolean;
  breadcrumbTrail?: BreadcrumbItem[];
  onMenuClick?: (pathClick: string, ancestorKeys: string[]) => void;
  homePathClick?: string;
  homeAncestorKeys?: string[];
  routeGuideIconConfig?: ResolvedRouteGuideIconConfig;
  onClose: () => void;
}

export function DocsShellUrlFullscreenOverlay({
  isOpen,
  params,
  data,
  language,
  isDarkMode,
  menuCloseLabel,
  fullscreenExpandLabel,
  previousLabel,
  nextLabel,
  browsePrevLabel,
  browseNextLabel,
  mdBrowseIndex,
  htmlBrowseIndex,
  videoBrowseIndex,
  setMdBrowseIndex,
  setHtmlBrowseIndex,
  setVideoBrowseIndex,
  mdItems,
  htmlItems,
  videoItems,
  routeGuideEnabled = false,
  breadcrumbTrail = [],
  onMenuClick,
  homePathClick,
  homeAncestorKeys = [],
  routeGuideIconConfig,
  onClose,
}: DocsShellUrlFullscreenOverlayProps) {
  useEffect(() => {
    if (!isOpen || !params) return;
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        const timer = setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }),
          150,
        );
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, params]);

  const fullscreenInnerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !params) {
    return null;
  }

  const overlayLanguage = params.lang ?? language;

  const pageIndex = (() => {
    if (params.type === "md" && params.file) {
      return data.pathToPageMap?.[params.file]?.pageIndex ?? 0;
    }
    if (params.type === "html" && params.file) {
      return data.pathToPageMap?.[params.file]?.pageIndex ?? 0;
    }
    if (params.type === "video") {
      if (params.id != null) {
        return data.pathToPageMap?.[`page:${params.id}`]?.pageIndex ?? 0;
      }
      if (params.slug) {
        const entry = Object.entries(data.pathToPageMap ?? {}).find(
          ([k, v]) => v.contentType === "video" && k.toLowerCase().includes(params.slug!.toLowerCase()),
        );
        return entry?.[1]?.pageIndex ?? 0;
      }
    }
    return 0;
  })();

  const currentPage = data.pages?.[pageIndex] ?? data.pages?.[0];

  return (
    <div
      className={styles.contentContainerFullscreen}
      role="dialog"
      aria-modal="true"
      aria-label={menuCloseLabel}
    >
      <button
        type="button"
        className={styles.fullscreenCloseButton}
        onClick={onClose}
        aria-label={menuCloseLabel}
        title={menuCloseLabel}
      >
        <FiX aria-hidden />
      </button>
      <div ref={fullscreenInnerRef} className={styles.contentContainerFullscreenInner}>
        <TocScrollContainerProvider scrollContainerRef={fullscreenInnerRef}>
          <PageContentArea
          currentPage={currentPage}
          data={data}
          language={overlayLanguage}
          isDarkMode={isDarkMode}
          fullscreenCloseLabel={menuCloseLabel}
          fullscreenExpandLabel={fullscreenExpandLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          browsePrevLabel={browsePrevLabel}
          browseNextLabel={browseNextLabel}
          mdBrowseIndex={mdBrowseIndex}
          htmlBrowseIndex={htmlBrowseIndex}
          videoBrowseIndex={videoBrowseIndex}
          setMdBrowseIndex={setMdBrowseIndex}
          setHtmlBrowseIndex={setHtmlBrowseIndex}
          setVideoBrowseIndex={setVideoBrowseIndex}
          mdItems={mdItems}
          htmlItems={htmlItems}
          videoItems={videoItems}
          routeGuideEnabled={routeGuideEnabled}
          breadcrumbTrail={breadcrumbTrail}
          onMenuClick={onMenuClick}
          homePathClick={homePathClick}
          homeAncestorKeys={homeAncestorKeys}
          routeGuideIconConfig={routeGuideIconConfig}
        />
        </TocScrollContainerProvider>
      </div>
    </div>
  );
}
