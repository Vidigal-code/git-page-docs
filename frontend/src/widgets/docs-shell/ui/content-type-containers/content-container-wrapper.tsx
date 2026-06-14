"use client";

import { useState, useRef } from "react";
import { FiX } from "react-icons/fi";
import { MdFullscreen } from "react-icons/md";
import { TocScrollContainerProvider } from "@/features/route-guide";
import { PageContentBrowseNav, type BrowseNavConfig } from "../page-content-browse-nav";
import styles from "../../docs-shell.module.css";

const DEFAULT_CONTAINER_MARGIN = "0";

/** @deprecated Use BrowseNavConfig from page-content-browse-nav. Kept for backward compatibility. */
export type BrowseNavProps = BrowseNavConfig;

export interface ResolveChildrenOptions {
  contentOnly?: boolean;
}

interface ContentContainerWrapperProps {
  header?: React.ReactNode;
  /** Content, or function to inject fullscreen button into content (e.g. for TOC + MD layout) */
  children:
    | React.ReactNode
    | ((fullscreenButton: React.ReactNode, options?: ResolveChildrenOptions) => React.ReactNode);
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  /** Called before opening fullscreen (e.g. to update URL for sharing) */
  onBeforeFullscreen?: () => void;
  /** Called before closing fullscreen (e.g. to clear URL params) */
  onAfterFullscreen?: () => void;
  marginTop?: string;
  marginBottom?: string;
  browseNav?: BrowseNavProps;
  browseNavPosition?: "top" | "bottom" | "both";
}

export function ContentContainerWrapper({
  header,
  children,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
  onBeforeFullscreen,
  onAfterFullscreen,
  marginTop,
  marginBottom,
  browseNav,
  browseNavPosition = "top",
}: ContentContainerWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenInnerRef = useRef<HTMLDivElement>(null);
  const marginTopVal = marginTop?.trim() || DEFAULT_CONTAINER_MARGIN;
  const marginBottomVal = marginBottom?.trim() || DEFAULT_CONTAINER_MARGIN;

  const wrapperStyle = {
    marginTop: marginTopVal,
    marginBottom: marginBottomVal,
  };

  const showTopNav = browseNav && (browseNavPosition === "top" || browseNavPosition === "both");

  const resolveChildren = (btn: React.ReactNode | null, options?: ResolveChildrenOptions) =>
    typeof children === "function"
      ? (children as (b: React.ReactNode, o?: ResolveChildrenOptions) => React.ReactNode)(btn, options)
      : children;

  if (!fullscreenEnabled) {
    return (
      <div className={styles.contentContainerWrapper} style={wrapperStyle}>
        {header}
        {showTopNav && browseNav && <PageContentBrowseNav browseNav={browseNav} />}
        <div className={styles.contentContainerWithButton}>{resolveChildren(null)}</div>
      </div>
    );
  }

  const fullscreenButton = (
    <button
      type="button"
      className={styles.fullscreenButtonInside}
      onClick={() => {
        onBeforeFullscreen?.();
        setIsFullscreen(true);
      }}
      aria-label={fullscreenExpandLabel}
      title={fullscreenExpandLabel}
    >
      <MdFullscreen aria-hidden />
    </button>
  );

  const resolvedChildren =
    typeof children === "function" ? (
      resolveChildren(fullscreenButton, { contentOnly: false })
    ) : (
      <>
        {fullscreenButton}
        {children}
      </>
    );

  return (
    <div className={styles.contentContainerWrapper} style={wrapperStyle}>
      {header}
      {showTopNav && browseNav && <PageContentBrowseNav browseNav={browseNav} />}
      <div className={styles.contentContainerWithButton}>{resolvedChildren}</div>
      {isFullscreen && (
        <div
          className={styles.contentContainerFullscreen}
          role="dialog"
          aria-modal="true"
          aria-label={fullscreenCloseLabel}
        >
          <button
            type="button"
            className={styles.fullscreenCloseButton}
            onClick={() => {
              onAfterFullscreen?.();
              setIsFullscreen(false);
            }}
            aria-label={fullscreenCloseLabel}
            title={fullscreenCloseLabel}
          >
            <FiX aria-hidden />
          </button>
          <div ref={fullscreenInnerRef} className={styles.contentContainerFullscreenInner}>
            <TocScrollContainerProvider scrollContainerRef={fullscreenInnerRef}>
              {resolveChildren(null, { contentOnly: true })}
            </TocScrollContainerProvider>
          </div>
        </div>
      )}
    </div>
  );
}
