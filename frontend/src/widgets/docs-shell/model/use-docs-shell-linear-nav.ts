import { useMemo } from "react";
import type { LoadedDocsData, MenuEntry, MenuNode } from "@/entities/docs";
import { buildUnifiedHeaderMenuTree, flattenMenuTree, getPageIndexByPathClick, type MenuTreeSelection } from "./menu-tree";

interface DocsShellLinearNavigation {
  headerMenuTree: MenuNode[];
  headerMenuEntries: MenuEntry[];
  linearNavigationEntries: MenuEntry[];
  currentLinearNavigationIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function useDocsShellLinearNav(
  data: LoadedDocsData,
  language: string,
  selection: MenuTreeSelection,
): DocsShellLinearNavigation {
  const { pageIndex, isPathAllowed } = selection;
  const headerMenuTree = useMemo(
    () => buildUnifiedHeaderMenuTree(data, language, { pageIndex, isPathAllowed }),
    [data, language, pageIndex, isPathAllowed],
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
    () => linearNavigationEntries.findIndex((entry) => getPageIndexByPathClick(data, entry.pathClick) === pageIndex),
    [linearNavigationEntries, data, pageIndex],
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
