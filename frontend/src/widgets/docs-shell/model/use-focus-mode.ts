import { useMemo, useState } from "react";

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

export function useFocusMode(markdownHtml: string) {
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusModePageIndex, setFocusModePageIndex] = useState(0);
  const focusModePages = useMemo(() => splitMarkdownHtmlIntoPages(markdownHtml), [markdownHtml]);
  const safeFocusModePageIndex =
    focusModePageIndex >= 0 && focusModePageIndex < focusModePages.length ? focusModePageIndex : 0;
  const focusModeCurrentHtml = focusModePages[safeFocusModePageIndex] ?? markdownHtml;
  const canFocusModeGoPrevious = safeFocusModePageIndex > 0;
  const canFocusModeGoNext = safeFocusModePageIndex < focusModePages.length - 1;

  function openFocusMode() {
    setFocusModePageIndex(0);
    setFocusModeOpen(true);
  }

  function closeFocusMode() {
    setFocusModeOpen(false);
  }

  function onFocusModeNavigate(offset: -1 | 1) {
    setFocusModePageIndex((prev) => {
      const next = prev + offset;
      if (next < 0 || next >= focusModePages.length) {
        return prev;
      }
      return next;
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
