"use client";

import { useEffect } from "react";
import type { LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";
import { getBreadcrumbTrail, getPageIndexByPathClick } from "./menu-tree";
import { buildUnifiedHeaderMenuTree } from "./menu-tree";

export type FullscreenContentType = "md" | "html" | "video" | null;

export interface UrlParamsAction {
  type: "navigate";
  pageIndex: number;
  ancestorKeys: string[];
}

export interface FullscreenParams {
  type: FullscreenContentType;
  lang: LanguageCode;
  file?: string;
  id?: number;
  slug?: string;
}

function findPathClickBySlug(data: LoadedDocsData, slug: string, _lang: LanguageCode): string | null {
  const keys = Object.keys(data.pathToPageMap ?? {});
  const normalized = slug.toLowerCase().replace(/\.(md|html)$/, "");
  for (const key of keys) {
    const lower = key.toLowerCase();
    if (
      lower.endsWith(`/${normalized}`) ||
      lower.endsWith(`/${normalized}.md`) ||
      lower.endsWith(`/${normalized}.html`)
    ) {
      return key;
    }
  }
  return null;
}

export function useDocsShellUrlParams(
  searchParams: URLSearchParams,
  data: LoadedDocsData,
  language: LanguageCode,
  setPageIndex: (idx: number) => void,
  expandAncestors: (keys: string[]) => void,
  onParamsProcessed?: (action: UrlParamsAction | null) => void,
  onFullscreenRequest?: (params: FullscreenParams) => void
) {
  useEffect(() => {
    const menuLang = searchParams.get("menu") as LanguageCode | null;
    const menuId = searchParams.get("id");
    const menuNome = searchParams.get("nome");
    const mdHash = typeof window !== "undefined" && window.location.hash ? window.location.hash.slice(1) : "";
    const mdfull = searchParams.get("mdfull");
    const mdfullFile = searchParams.get("file");
    const videofull = searchParams.get("videofull");
    const videofullId = searchParams.get("id");
    const videofullSlug = searchParams.get("slug");
    const htmlfull = searchParams.get("htmlfull");
    const htmlfullFile = searchParams.get("file");

    if (onFullscreenRequest) {
      if (mdfull && mdfullFile) {
        onFullscreenRequest({ type: "md", lang: mdfull as LanguageCode, file: mdfullFile });
        return;
      }
      if (videofull) {
        const id = videofullId ? parseInt(videofullId, 10) : undefined;
        onFullscreenRequest({
          type: "video",
          lang: videofull as LanguageCode,
          id: Number.isNaN(id) ? undefined : id,
          slug: videofullSlug ?? undefined,
        });
        return;
      }
      if (htmlfull && htmlfullFile) {
        onFullscreenRequest({ type: "html", lang: htmlfull as LanguageCode, file: htmlfullFile });
        return;
      }
    }

    if (menuLang && (menuId || menuNome)) {
      let pathClick: string | null = null;
      let ancestorKeys: string[] = [];

      if (menuId) {
        const idNum = parseInt(menuId, 10);
        if (!Number.isNaN(idNum)) {
          const route = data.config.routes.find((r) => r.id === idNum);
          if (route && route.path) {
            pathClick = (route.path as Record<string, string>)[menuLang] ?? (route.path as Record<string, string>).en ?? null;
          }
        }
      } else if (menuNome) {
        pathClick = findPathClickBySlug(data, menuNome, menuLang);
      }

      if (pathClick) {
        const pageIdx = getPageIndexByPathClick(data, pathClick);
        if (pageIdx >= 0) {
          const tree = buildUnifiedHeaderMenuTree(data, menuLang, pageIdx);
          const trail = getBreadcrumbTrail(tree, pathClick);
          const ancestorKeys = trail.length > 0 ? trail[trail.length - 1].ancestorKeys : [];
          setPageIndex(pageIdx);
          expandAncestors(ancestorKeys);
          onParamsProcessed?.({ type: "navigate", pageIndex: pageIdx, ancestorKeys });
        }
      }
    }

    if (mdHash && typeof window !== "undefined") {
      const el = document.getElementById(mdHash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }

    onParamsProcessed?.(null);
  }, [
    searchParams,
    data,
    language,
    setPageIndex,
    expandAncestors,
    onParamsProcessed,
    onFullscreenRequest,
  ]);
}
