import { useState } from "react";
import type { LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";
import { getRouteIndexByPath } from "./menu-tree";

interface UseDocsShellNavigationStateArgs {
  data: LoadedDocsData;
  language: LanguageCode;
  setSidebarOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
}

export function useDocsShellNavigationState({
  data,
  language,
  setSidebarOpen,
  setMenuOpen,
}: UseDocsShellNavigationStateArgs) {
  const [routeIndex, setRouteIndex] = useState(0);
  const [expandedMenuMap, setExpandedMenuMap] = useState<Record<string, boolean>>({});

  function onMenuClick(pathClick: string, ancestorKeys: string[] = []) {
    const idx = getRouteIndexByPath(data, language, pathClick);
    if (idx >= 0) {
      setRouteIndex(idx);
    }
    if (ancestorKeys.length) {
      setExpandedMenuMap((prev) => {
        const nextMap = { ...prev };
        ancestorKeys.forEach((key) => {
          nextMap[key] = true;
        });
        return nextMap;
      });
    }
    setSidebarOpen(true);
    setMenuOpen(false);
  }

  function toggleNode(nodeKey: string) {
    setExpandedMenuMap((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  }

  function isNodeExpanded(nodeKey: string): boolean {
    return expandedMenuMap[nodeKey] ?? true;
  }

  return {
    routeIndex,
    setRouteIndex,
    expandedMenuMap,
    onMenuClick,
    toggleNode,
    isNodeExpanded,
  };
}
