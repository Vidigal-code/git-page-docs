"use client";

import { useCallback, useEffect, useRef } from "react";
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
  const fullscreenInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !params) return;
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash) {
      const el = document.getElementById(hash);
      const container = fullscreenInnerRef.current;
      if (el) {
        const timer = setTimeout(() => {
          if (container && container.contains(el)) {
            const scrollPadding = 80;
            const elTop = el.getBoundingClientRect().top;
            const containerTop = container.getBoundingClientRect().top;
            const scrollOffset = elTop - containerTop + container.scrollTop - scrollPadding;
            container.scrollTo({ top: Math.max(0, scrollOffset), behavior: "smooth" });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, params]);

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

  const handleHashLinkClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a[href^="#"]');
    if (!target || !(target instanceof HTMLAnchorElement)) return;
    const href = target.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    e.stopPropagation();
    const id = href.slice(1);
    const el = document.getElementById(id);
    const container = fullscreenInnerRef.current;
    if (el && container?.contains(el)) {
      const scrollPadding = 80;
      const elTop = el.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      const scrollOffset = elTop - containerTop + container.scrollTop - scrollPadding;
      container.scrollTo({ top: Math.max(0, scrollOffset), behavior: "smooth" });
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
      }
    }
  }, []);

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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-label={menuCloseLabel}
        title={menuCloseLabel}
      >
        <FiX aria-hidden />
      </button>
      <div
        ref={fullscreenInnerRef}
        className={styles.contentContainerFullscreenInner}
        onClickCapture={handleHashLinkClick}
      >
        <TocScrollContainerProvider scrollContainerRef={fullscreenInnerRef}>
          <PageContentArea
          currentPage={currentPage}
          data={data}
          language={overlayLanguage}
          isDarkMode={isDarkMode}
          contentTypeFilter={
            params.type === "md" || params.type === "html" || params.type === "video" ? params.type : undefined
          }
          isUrlFullscreen={true}
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
