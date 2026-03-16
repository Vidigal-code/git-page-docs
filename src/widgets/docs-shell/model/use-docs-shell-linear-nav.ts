import { useMemo } from "react";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { buildUnifiedHeaderMenuTree, flattenMenuTree, getPageIndexByPathClick } from "./menu-tree";

export function useDocsShellLinearNav(data: LoadedDocsData, language: string, safePageIndex: number) {
  const headerMenuTree = useMemo(
    () => buildUnifiedHeaderMenuTree(data, language, safePageIndex),
    [data, language, safePageIndex],
  );

  const headerMenuEntries = useMemo(() => flattenMenuTree(headerMenuTree), [headerMenuTree]);

  const linearNavigationEntries = useMemo(() => {
    const seenPages = new Set<number>();
    return headerMenuEntries.filter((entry) => {
      if (!entry.pathClick) return false;
      const pageIdx = getPageIndexByPathClick(data, entry.pathClick);
      if (pageIdx < 0 || seenPages.has(pageIdx)) return false;
      seenPages.add(pageIdx);
      return true;
    });
  }, [headerMenuEntries, data]);

  const currentLinearNavigationIndex = useMemo(
    () => linearNavigationEntries.findIndex((entry) => getPageIndexByPathClick(data, entry.pathClick) === safePageIndex),
    [linearNavigationEntries, data, safePageIndex],
  );

  const canGoPrevious = currentLinearNavigationIndex > 0;
  const canGoNext =
    currentLinearNavigationIndex >= 0 && currentLinearNavigationIndex < linearNavigationEntries.length - 1;

  return {
    headerMenuTree,
    headerMenuEntries,
    linearNavigationEntries,
    currentLinearNavigationIndex,
    canGoPrevious,
    canGoNext,
  };
}
