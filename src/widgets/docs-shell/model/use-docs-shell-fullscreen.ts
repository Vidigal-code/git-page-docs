import { useCallback, useRef, useState } from "react";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { buildUnifiedHeaderMenuTree, getBreadcrumbTrail, getPageIndexByPathClick } from "./menu-tree";
import { toFullPath } from "@/shared/lib/base-path";
import type { FullscreenParams } from "./use-docs-shell-url-params";

interface UseDocsShellFullscreenArgs {
  data: LoadedDocsData;
  language: string;
  pathname: string | null;
  getCurrentSearchParams: () => URLSearchParams;
  replaceUrlWithoutNavigation: (path: string, params: URLSearchParams) => void;
  setPageIndex: (index: number) => void;
  expandAncestors: (keys: string[]) => void;
  routerReplace: (url: string) => void;
}

export function useDocsShellFullscreen(args: UseDocsShellFullscreenArgs) {
  const {
    data,
    language,
    pathname,
    getCurrentSearchParams,
    replaceUrlWithoutNavigation,
    setPageIndex,
    expandAncestors,
    routerReplace,
  } = args;

  const [urlFullscreenParams, setUrlFullscreenParams] = useState<FullscreenParams | null>(null);
  const skipUrlFullscreenFromInlineRef = useRef(false);

  const onFullscreenRequest = useCallback(
    (params: FullscreenParams) => {
      if (skipUrlFullscreenFromInlineRef.current) {
        return;
      }
      let pathClick: string | null = null;
      const lang = params.lang ?? language;
      if (params.type === "md" && params.file) {
        pathClick = params.file;
      } else if (params.type === "html" && params.file) {
        pathClick = params.file;
      } else if (params.type === "video" && params.id != null) {
        pathClick = `page:${params.id}`;
      } else if (params.type === "video" && params.slug) {
        const entry = Object.entries(data.pathToPageMap ?? {}).find(
          ([k, v]) => v.contentType === "video" && k.toLowerCase().includes(params.slug!.toLowerCase()),
        );
        pathClick = entry?.[0] ?? null;
      } else if (params.type === "audio" && params.id != null) {
        pathClick = `page:${params.id}`;
      } else if (params.type === "audio" && params.slug) {
        const entry = Object.entries(data.pathToPageMap ?? {}).find(
          ([k, v]) => v.contentType === "audio" && k.toLowerCase().includes(params.slug!.toLowerCase()),
        );
        pathClick = entry?.[0] ?? null;
      }
      if (pathClick) {
        const pageIdx = getPageIndexByPathClick(data, pathClick);
        if (pageIdx >= 0) {
          const tree = buildUnifiedHeaderMenuTree(data, lang, pageIdx);
          const trail = getBreadcrumbTrail(tree, pathClick);
          const ancestorKeys = trail.length > 0 ? trail[trail.length - 1].ancestorKeys : [];
          setPageIndex(pageIdx);
          expandAncestors(ancestorKeys);
        }
      }
      setUrlFullscreenParams(params);
    },
    [data, language, setPageIndex, expandAncestors],
  );

  const closeUrlFullscreen = useCallback(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.delete("mdfull");
    params.delete("htmlfull");
    params.delete("videofull");
    params.delete("audiofull");
    params.delete("file");
    params.delete("slug");
    params.delete("id");
    const qs = params.toString();
    const appPath = pathname ?? "/";
    if (typeof window !== "undefined") {
      const fullUrl = qs ? `${toFullPath(appPath)}?${qs}` : toFullPath(appPath);
      window.history.replaceState({}, "", fullUrl);
    } else {
      routerReplace(qs ? `${appPath}?${qs}` : appPath);
    }
    setUrlFullscreenParams(null);
  }, [pathname, routerReplace]);

  const handleInlineFullscreenOpen = useCallback(
    (params: FullscreenParams) => {
      skipUrlFullscreenFromInlineRef.current = true;
      const current = getCurrentSearchParams();
      if (params.type === "md" && params.file) {
        current.set("mdfull", params.lang);
        current.set("file", params.file);
      } else if (params.type === "html" && params.file) {
        current.set("htmlfull", params.lang);
        current.set("file", params.file);
      } else if (params.type === "video") {
        current.set("videofull", params.lang);
        if (params.id != null) current.set("id", String(params.id));
        if (params.slug) current.set("slug", params.slug);
      } else if (params.type === "audio") {
        current.set("audiofull", params.lang);
        if (params.id != null) current.set("id", String(params.id));
        if (params.slug) current.set("slug", params.slug);
      }
      replaceUrlWithoutNavigation(pathname ?? "/", current);
    },
    [getCurrentSearchParams, replaceUrlWithoutNavigation, pathname],
  );

  const handleInlineFullscreenClose = useCallback(() => {
    skipUrlFullscreenFromInlineRef.current = false;
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const hadVideoFullscreen = params.has("videofull");
    const hadAudioFullscreen = params.has("audiofull");
    params.delete("mdfull");
    params.delete("htmlfull");
    params.delete("videofull");
    params.delete("audiofull");
    params.delete("file");
    params.delete("slug");
    if (hadVideoFullscreen || hadAudioFullscreen) {
      params.delete("id");
    }
    replaceUrlWithoutNavigation(pathname ?? "/", params);
    setUrlFullscreenParams(null);
  }, [pathname, replaceUrlWithoutNavigation]);

  return {
    urlFullscreenParams,
    onFullscreenRequest,
    closeUrlFullscreen,
    handleInlineFullscreenOpen,
    handleInlineFullscreenClose,
  };
}
