"use client";

import type { ContentTypeRouteConfig, RouteConfig } from "@/entities/docs";
import styles from "../docs-shell.module.css";

export function isBrowseAllEnabled(config: ContentTypeRouteConfig | RouteConfig | undefined): boolean {
  return Boolean(config && "browseAll" in config && config.browseAll === true);
}

export function shouldShowBrowseNav(browseAllEnabled: boolean, itemsCount: number): boolean {
  return browseAllEnabled && itemsCount > 1;
}

export interface BrowseNavConfig {
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

export interface BuildBrowseNavConfigParams {
  browseAllEnabled: boolean;
  itemsCount: number;
  currentIndex: number;
  setIndex: (v: number | ((p: number) => number)) => void;
  prevLabel: string;
  nextLabel: string;
  contentTypeLabel: string;
}

export function buildBrowseNavConfig({
  browseAllEnabled,
  itemsCount,
  currentIndex,
  setIndex,
  prevLabel,
  nextLabel,
  contentTypeLabel,
}: BuildBrowseNavConfigParams): BrowseNavConfig | undefined {
  if (!shouldShowBrowseNav(browseAllEnabled, itemsCount)) {
    return undefined;
  }
  return {
    onPrev: () => setIndex((i) => Math.max(0, i - 1)),
    onNext: () => setIndex((i) => Math.min(itemsCount - 1, i + 1)),
    prevLabel,
    nextLabel,
    canPrev: currentIndex > 0,
    canNext: currentIndex < itemsCount - 1,
    currentIndex,
    total: itemsCount,
    contentTypeLabel,
  };
}

interface PageContentBrowseNavProps {
  browseNav: BrowseNavConfig;
}

export function PageContentBrowseNav({ browseNav }: PageContentBrowseNavProps) {
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
