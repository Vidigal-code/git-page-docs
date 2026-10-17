import { useMemo, useState } from "react";
import type { FocusModeOptions } from "@/entities/docs";
import { resolveFocusNavigationIndex, type FocusNavigationTarget } from "./focus-navigation";

function splitMarkdownHtmlIntoPages(html: string): string[] {
  const content = html.trim();
  if (!content) {
    return [];
  }
  const headingRegex = /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi;
  const headingMatches = Array.from(content.matchAll(headingRegex));
  if (!headingMatches.length) {
    return [content];
  }
  const pages: string[] = [];
  const firstHeadingIndex = headingMatches[0]?.index ?? 0;
  const intro = content.slice(0, firstHeadingIndex).trim();
  if (intro) {
    pages.push(intro);
  }
  headingMatches.forEach((match, index) => {
    const start = match.index ?? 0;
    const end = headingMatches[index + 1]?.index ?? content.length;
    const sectionHtml = content.slice(start, end).trim();
    if (sectionHtml) {
      pages.push(sectionHtml);
    }
  });
  return pages.length ? pages : [content];
}

export function useFocusMode(markdownHtml: string, documentId = markdownHtml, options?: Pick<FocusModeOptions, "sectionNavigationEnabled">) {
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [position, setPosition] = useState({ documentId, index: 0 });
  if (position.documentId !== documentId) {
    setPosition({ documentId, index: 0 });
  }
  const focusModePages = useMemo(
    () => options?.sectionNavigationEnabled === false ? [markdownHtml] : splitMarkdownHtmlIntoPages(markdownHtml),
    [markdownHtml, options?.sectionNavigationEnabled],
  );
  const safeFocusModePageIndex =
    position.documentId === documentId && position.index >= 0 && position.index < focusModePages.length ? position.index : 0;
  const focusModeCurrentHtml = focusModePages[safeFocusModePageIndex] ?? markdownHtml;
  const canFocusModeGoPrevious = safeFocusModePageIndex > 0;
  const canFocusModeGoNext = safeFocusModePageIndex < focusModePages.length - 1;

  function openFocusMode() {
    setPosition({ documentId, index: 0 });
    setFocusModeOpen(true);
  }

  function closeFocusMode() {
    setFocusModeOpen(false);
  }

  function onFocusModeNavigate(target: FocusNavigationTarget) {
    setPosition((previous) => {
      const index = resolveFocusNavigationIndex({ target, currentIndex: previous.documentId === documentId ? previous.index : 0, count: focusModePages.length });
      return index < 0 ? previous : { documentId, index };
    });
  }

  return {
    focusModeOpen,
    setFocusModeOpen,
    focusModePages,
    safeFocusModePageIndex,
    focusModeCurrentHtml,
    canFocusModeGoPrevious,
    canFocusModeGoNext,
    openFocusMode,
    closeFocusMode,
    onFocusModeNavigate,
  };
}
