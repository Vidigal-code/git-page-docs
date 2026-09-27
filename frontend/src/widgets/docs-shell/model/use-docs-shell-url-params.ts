"use client";

import { useEffect, useMemo } from "react";
import type { LanguageCode, LoadedDocsData } from "@/entities/docs";
import { getCurrentHeadingHash, scrollToHeadingId } from "@/features/route-guide";
import {
  parseFullscreenParams,
  resolveMenuNavigationTarget,
  resolveMenuSelection,
  type FullscreenParams,
} from "./use-docs-shell-url-params.helpers";

export type { FullscreenContentType, FullscreenParams } from "./use-docs-shell-url-params.helpers";

export interface UrlParamsAction {
  type: "navigate";
  pageIndex: number;
  ancestorKeys: string[];
}

function scrollToCurrentHeadingHash(delayMs: number = 100): void {
  const headingId = getCurrentHeadingHash();
  if (!headingId) {
    return;
  }

  window.setTimeout(() => {
    scrollToHeadingId(headingId);
  }, delayMs);
}

export interface UseDocsShellUrlParamsOptions {
  searchParams: URLSearchParams;
  data: LoadedDocsData;
  language: LanguageCode;
  pageIndex: number;
  setPageIndex: (idx: number) => void;
  expandAncestors: (keys: string[]) => void;
  canNavigateToPathClick?: (pathClick: string) => boolean;
  onParamsProcessed?: (action: UrlParamsAction | null) => void;
  onFullscreenRequest?: (params: FullscreenParams) => void;
}

export function useDocsShellUrlParams({
  searchParams,
  data,
  language,
  pageIndex,
  setPageIndex,
  expandAncestors,
  canNavigateToPathClick,
  onParamsProcessed,
  onFullscreenRequest,
}: UseDocsShellUrlParamsOptions) {
  const searchParamsKey = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    const hasWindow = typeof window !== "undefined";
    if (onFullscreenRequest) {
      // Fullscreen params come from the live URL: inline fullscreens rewrite it without navigating.
      const fullscreen = parseFullscreenParams(hasWindow ? new URLSearchParams(window.location.search) : searchParams);
      if (fullscreen) {
        onFullscreenRequest(fullscreen);
        return;
      }
    }

    const selection = resolveMenuSelection(data, searchParams);
    if (selection && canNavigateToPathClick && !canNavigateToPathClick(selection.pathClick)) {
      onParamsProcessed?.(null);
      return;
    }

    const target = selection ? resolveMenuNavigationTarget(data, selection, pageIndex) : null;
    if (target) {
      setPageIndex(target.pageIndex);
      expandAncestors(target.ancestorKeys);
      onParamsProcessed?.({ type: "navigate", ...target });
    }

    if (hasWindow) {
      scrollToCurrentHeadingHash();
    }

    onParamsProcessed?.(null);
  }, [
    searchParams,
    searchParamsKey,
    data,
    language,
    pageIndex,
    setPageIndex,
    expandAncestors,
    canNavigateToPathClick,
    onParamsProcessed,
    onFullscreenRequest,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleHashChange = () => {
      scrollToCurrentHeadingHash(0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
}
