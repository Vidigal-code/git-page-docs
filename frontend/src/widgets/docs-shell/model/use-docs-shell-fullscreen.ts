import { useCallback, useRef, useState } from "react";
import type { LoadedDocsData } from "@/entities/docs";
import { toFullPath } from "@/shared/lib/base-path";
import {
  applyFullscreenParams,
  resolveFullscreenPathClick,
  stripFullscreenParams,
} from "./use-docs-shell-fullscreen.helpers";
import { resolvePageTarget, type FullscreenParams } from "./use-docs-shell-url-params.helpers";
import { withQuery } from "./with-query";

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

function readWindowSearchParams(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
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
      const pathClick = resolveFullscreenPathClick(data, params);
      const target = pathClick ? resolvePageTarget(data, params.lang ?? language, pathClick) : null;
      if (target) {
        setPageIndex(target.pageIndex);
        expandAncestors(target.ancestorKeys);
      }
      setUrlFullscreenParams(params);
    },
    [data, language, setPageIndex, expandAncestors],
  );

  const closeUrlFullscreen = useCallback(() => {
    const params = readWindowSearchParams();
    stripFullscreenParams(params, "always");
    const appPath = pathname ?? "/";
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", withQuery(toFullPath(appPath), params));
    } else {
      routerReplace(withQuery(appPath, params));
    }
    setUrlFullscreenParams(null);
  }, [pathname, routerReplace]);

  const handleInlineFullscreenOpen = useCallback(
    (params: FullscreenParams) => {
      skipUrlFullscreenFromInlineRef.current = true;
      const current = getCurrentSearchParams();
      applyFullscreenParams(current, params);
      replaceUrlWithoutNavigation(pathname ?? "/", current);
    },
    [getCurrentSearchParams, replaceUrlWithoutNavigation, pathname],
  );

  const handleInlineFullscreenClose = useCallback(() => {
    skipUrlFullscreenFromInlineRef.current = false;
    const params = readWindowSearchParams();
    stripFullscreenParams(params, "media-only");
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
