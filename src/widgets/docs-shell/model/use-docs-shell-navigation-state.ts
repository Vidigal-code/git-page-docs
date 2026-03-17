import { useEffect, useState } from "react";
import type {
  LanguageCode,
  LoadedDocsData,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedPage,
  LoadedVideoContent,
  LoadedAudioContent,
} from "@/entities/docs/model/types";
import type { BrowseItem } from "@/entities/docs/model/navigation";
import { getPageIndexByPathClick } from "./menu-tree";

export type { BrowseItem };

function getMdItems(pages: LoadedPage[]): BrowseItem<LoadedMdContent>[] {
  return pages.flatMap((p, i) => (p.md ? [{ pageIndex: i, content: p.md }] : []));
}

function getHtmlItems(pages: LoadedPage[]): BrowseItem<LoadedHtmlContent>[] {
  return pages.flatMap((p, i) => (p.html ? [{ pageIndex: i, content: p.html }] : []));
}

function getVideoItems(pages: LoadedPage[]): BrowseItem<LoadedVideoContent>[] {
  return pages.flatMap((p, i) => (p.video ? [{ pageIndex: i, content: p.video }] : []));
}

function getAudioItems(pages: LoadedPage[]): BrowseItem<LoadedAudioContent>[] {
  return pages.flatMap((p, i) => (p.audio ? [{ pageIndex: i, content: p.audio }] : []));
}

function getBrowseIndexForPage<T>(items: BrowseItem<T>[], pageIndex: number): number {
  const idx = items.findIndex((x) => x.pageIndex === pageIndex);
  return idx >= 0 ? idx : 0;
}

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
  const [pageIndex, setPageIndex] = useState(0);
  const [expandedMenuMap, setExpandedMenuMap] = useState<Record<string, boolean>>({});
  const [mdBrowseIndex, setMdBrowseIndex] = useState(0);
  const [htmlBrowseIndex, setHtmlBrowseIndex] = useState(0);
  const [videoBrowseIndex, setVideoBrowseIndex] = useState(0);
  const [audioBrowseIndex, setAudioBrowseIndex] = useState(0);

  const pages = data.pages ?? [];
  const mdItems = getMdItems(pages);
  const htmlItems = getHtmlItems(pages);
  const videoItems = getVideoItems(pages);
  const audioItems = getAudioItems(pages);

  useEffect(() => {
    setMdBrowseIndex(getBrowseIndexForPage(mdItems, pageIndex));
    setHtmlBrowseIndex(getBrowseIndexForPage(htmlItems, pageIndex));
    setVideoBrowseIndex(getBrowseIndexForPage(videoItems, pageIndex));
    setAudioBrowseIndex(getBrowseIndexForPage(audioItems, pageIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync browse indices when page or items change
  }, [pageIndex, pages.length, mdItems.length, htmlItems.length, videoItems.length, audioItems.length]);

  function onMenuClick(pathClick: string, ancestorKeys: string[] = []) {
    const idx = getPageIndexByPathClick(data, pathClick);
    if (idx >= 0) {
      setPageIndex(idx);
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

  function expandAncestors(ancestorKeys: string[]) {
    if (ancestorKeys.length === 0) return;
    setExpandedMenuMap((prev) => {
      const next = { ...prev };
      ancestorKeys.forEach((k) => { next[k] = true; });
      return next;
    });
  }

  return {
    pageIndex,
    setPageIndex,
    routeIndex: pageIndex,
    expandedMenuMap,
    onMenuClick,
    toggleNode,
    isNodeExpanded,
    mdBrowseIndex,
    htmlBrowseIndex,
    videoBrowseIndex,
    audioBrowseIndex,
    setMdBrowseIndex,
    setHtmlBrowseIndex,
    setVideoBrowseIndex,
    setAudioBrowseIndex,
    mdItems,
    htmlItems,
    videoItems,
    audioItems,
    expandAncestors,
  };
}
