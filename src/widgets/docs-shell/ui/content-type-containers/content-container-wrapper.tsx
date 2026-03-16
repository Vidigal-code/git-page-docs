"use client";

import { useState, useRef } from "react";
import { FiX } from "react-icons/fi";
import { MdFullscreen } from "react-icons/md";
import { TocScrollContainerProvider } from "@/features/route-guide/model/toc-scroll-context";
import styles from "../../docs-shell.module.css";

const DEFAULT_CONTAINER_MARGIN = "0";

export interface BrowseNavProps {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
  canPrev: boolean;
  canNext: boolean;
  currentIndex: number;
  total: number;
  contentTypeLabel?: string;
}

interface ContentContainerWrapperProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  marginTop?: string;
  marginBottom?: string;
  browseNav?: BrowseNavProps;
  browseNavPosition?: "top" | "bottom" | "both";
}

function BrowseNavBar({ browseNav }: { browseNav: BrowseNavProps }) {
  const countText = `${browseNav.currentIndex + 1}/${browseNav.total}`;
  return (
    <div className={styles.browseNavBar}>
      <button
        type="button"
        className={styles.button}
        onClick={browseNav.onPrev}
        disabled={!browseNav.canPrev}
        aria-label={browseNav.prevLabel}
      >
        {browseNav.prevLabel}
      </button>
      <span className={styles.browseCount} aria-live="polite">
        {browseNav.contentTypeLabel ? `${browseNav.contentTypeLabel} ${countText}` : countText}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={browseNav.onNext}
        disabled={!browseNav.canNext}
        aria-label={browseNav.nextLabel}
      >
        {browseNav.nextLabel}
      </button>
    </div>
  );
}

export function ContentContainerWrapper({
  header,
  children,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
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

  if (!fullscreenEnabled) {
    return (
      <div style={wrapperStyle}>
        {header}
        {showTopNav && <BrowseNavBar browseNav={browseNav} />}
        {children}
      </div>
    );
  }

  return (
    <div className={styles.contentContainerWrapper} style={wrapperStyle}>
      {header}
      {showTopNav && <BrowseNavBar browseNav={browseNav} />}
      <div className={styles.contentContainerWithButton}>
        <button
          type="button"
          className={styles.fullscreenButtonInside}
          onClick={() => setIsFullscreen(true)}
          aria-label={fullscreenExpandLabel}
          title={fullscreenExpandLabel}
        >
          <MdFullscreen aria-hidden />
        </button>
        {children}
      </div>
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
            onClick={() => setIsFullscreen(false)}
            aria-label={fullscreenCloseLabel}
            title={fullscreenCloseLabel}
          >
            <FiX aria-hidden />
          </button>
          <div ref={fullscreenInnerRef} className={styles.contentContainerFullscreenInner}>
            <TocScrollContainerProvider scrollContainerRef={fullscreenInnerRef}>
              {children}
            </TocScrollContainerProvider>
          </div>
        </div>
      )}
    </div>
  );
}
