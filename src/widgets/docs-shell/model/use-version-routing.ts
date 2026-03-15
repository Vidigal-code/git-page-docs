import { useMemo } from "react";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";
import type { LanguageCode, VersionEntry } from "@/entities/docs/model/types";

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

  function onVersionChange(versionId: string) {
    if (isRemoteRepositorySession) {
      if (typeof window !== "undefined") {
        const currentUrl = new URL(window.location.href);
        const cleanPath = currentUrl.pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
        currentUrl.pathname = buildVersionPath(cleanPath, versionId);
        currentUrl.searchParams.set("lang", String(language));
        currentUrl.searchParams.delete("version");
        window.location.assign(currentUrl.toString());
      } else {
        const params = getCurrentSearchParams();
        params.delete("version");
        params.set("lang", String(language));
        const cleanPath = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
        const targetPath = buildVersionPath(cleanPath, versionId);
        const qs = params.toString();
        const nextUrl = qs ? `${targetPath}?${qs}` : targetPath;
        routerReplace(nextUrl);
      }
      return;
    }

    const base = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
    const params = getCurrentSearchParams();
    params.delete("version");
    if (isLanguageSelectVisible) {
      params.set("lang", language);
    } else {
      params.delete("lang");
    }
    const target = buildVersionPath(base, versionId);
    const qs = params.toString();
    const nextUrl = qs ? `${target}?${qs}` : target;
    if (typeof window !== "undefined") {
      window.location.assign(nextUrl);
      return;
    }
    routerReplace(nextUrl);
  }

  return { versionFromPath, selectedVersionValue, onVersionChange };
}
