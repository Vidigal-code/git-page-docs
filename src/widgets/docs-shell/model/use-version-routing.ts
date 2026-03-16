import { useMemo } from "react";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";
import type { LanguageCode, VersionEntry } from "@/entities/docs/model/types";
import { toFullPath } from "@/shared/lib/base-path";

interface UseVersionRoutingArgs {
  pathname: string;
  versionFromQuery: string | null;
  activeVersionId?: string;
  availableVersions: VersionEntry[];
  isLanguageSelectVisible: boolean;
  isRemoteRepositorySession: boolean;
  language: LanguageCode;
  getCurrentSearchParams: () => URLSearchParams;
  routerReplace: (url: string) => void;
}

export function useVersionRouting({
  pathname,
  versionFromQuery,
  activeVersionId,
  availableVersions,
  isLanguageSelectVisible,
  isRemoteRepositorySession,
  language,
  getCurrentSearchParams,
  routerReplace,
}: UseVersionRoutingArgs) {
  const versionFromPath = useMemo(() => {
    const match = pathname.match(/\/v\/([^/]+)\/?$/);
    return match?.[1];
  }, [pathname]);

  const selectedVersionValue = useMemo(() => {
    const isKnownVersion = (versionId: string | null | undefined) =>
      Boolean(versionId && availableVersions.some((version) => version.id === versionId));
    if (isKnownVersion(versionFromPath)) {
      return versionFromPath as string;
    }
    if (isKnownVersion(versionFromQuery)) {
      return versionFromQuery as string;
    }
    if (isKnownVersion(activeVersionId)) {
      return activeVersionId as string;
    }
    return availableVersions[0]?.id ?? "";
  }, [versionFromPath, versionFromQuery, activeVersionId, availableVersions]);

  function buildPathFromCurrentLocation(versionId: string): { targetPath: string; params: URLSearchParams } {
    const cleanPath = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : getCurrentSearchParams();
    return { targetPath: buildVersionPath(cleanPath, versionId), params };
  }

  function onVersionChange(versionId: string) {
    const cleanPath = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
    const targetAppPath = buildVersionPath(cleanPath, versionId);

    if (isRemoteRepositorySession) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("lang", String(language));
        params.delete("version");
        const qs = params.toString();
        const fullUrl = qs ? `${toFullPath(targetAppPath)}?${qs}` : toFullPath(targetAppPath);
        window.location.assign(fullUrl);
      } else {
        const params = getCurrentSearchParams();
        params.delete("version");
        params.set("lang", String(language));
        const qs = params.toString();
        routerReplace(qs ? `${targetAppPath}?${qs}` : targetAppPath);
      }
      return;
    }

    const { params } = buildPathFromCurrentLocation(versionId);
    params.delete("version");
    if (isLanguageSelectVisible) {
      params.set("lang", language);
    } else {
      params.delete("lang");
    }
    const qs = params.toString();
    const nextUrl = qs ? `${targetAppPath}?${qs}` : targetAppPath;
    if (typeof window !== "undefined") {
      window.location.assign(qs ? `${toFullPath(targetAppPath)}?${qs}` : toFullPath(targetAppPath));
      return;
    }
    routerReplace(nextUrl);
  }

  return { versionFromPath, selectedVersionValue, onVersionChange };
}
