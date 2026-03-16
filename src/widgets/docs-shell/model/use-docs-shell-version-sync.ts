import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";
import { toFullPath } from "@/shared/lib/base-path";
import type { VersionEntry } from "@/entities/docs/model/types";

export function useDocsShellVersionSync(options: {
  showVersionSelector: boolean;
  isRemoteRepositorySession: boolean;
  pathname: string;
  versionStorageKey: string;
  availableVersions: VersionEntry[];
  routerReplace: (url: string) => void;
}) {
  const searchParams = useSearchParams();
  const {
    showVersionSelector,
    isRemoteRepositorySession,
    pathname,
    versionStorageKey,
    availableVersions,
    routerReplace,
  } = options;

  useEffect(() => {
    if (!showVersionSelector) return;
    const params = new URLSearchParams(searchParams.toString());
    const urlVersion = params.get("version");
    const hasVersionInPath = /\/v\/[^/]+\/?$/.test(pathname);
    const pathVersionMatch = pathname.match(/\/v\/([^/]+)\/?$/);
    const versionFromPath = pathVersionMatch?.[1];
    const hasVersionInConfig = (versionId: string | null | undefined) =>
      Boolean(versionId && availableVersions.some((v) => v.id === versionId));

    if (isRemoteRepositorySession) {
      const validUrlVersion = hasVersionInConfig(urlVersion) ? urlVersion : undefined;
      const validPathVersion = hasVersionInConfig(versionFromPath) ? versionFromPath : undefined;

      if (validUrlVersion && validUrlVersion !== validPathVersion) {
        const appBase = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
        params.delete("version");
        const targetAppPath = buildVersionPath(appBase, validUrlVersion);
        const qs = params.toString();
        const nextUrl = qs ? `${targetAppPath}?${qs}` : targetAppPath;
        if (typeof window !== "undefined") {
          window.location.replace(qs ? `${toFullPath(targetAppPath)}?${qs}` : toFullPath(targetAppPath));
        } else {
          routerReplace(nextUrl);
        }
        return;
      }

      if (urlVersion && !validUrlVersion) {
        params.delete("version");
        if (typeof window !== "undefined") {
          const qs = params.toString();
          const nextUrl = qs ? `${toFullPath(pathname)}?${qs}` : toFullPath(pathname);
          window.history.replaceState({}, "", nextUrl);
        } else {
          const qs = params.toString();
          routerReplace(qs ? `${pathname}?${qs}` : pathname);
        }
      }
      return;
    }

    params.delete("version");
    if (urlVersion && availableVersions.some((v) => v.id === urlVersion) && !hasVersionInPath) {
      const appBase = pathname.replace(/\/$/, "") || pathname;
      const target = `${appBase}/v/${urlVersion}`;
      const qs = params.toString();
      routerReplace(qs ? `${target}?${qs}` : target);
      return;
    }
    try {
      const savedVersion = window.localStorage.getItem(versionStorageKey);
      if (savedVersion && availableVersions.some((v) => v.id === savedVersion) && !hasVersionInPath) {
        const appBase = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "") || pathname;
        const target = buildVersionPath(appBase, savedVersion);
        const qs = params.toString();
        routerReplace(qs ? `${target}?${qs}` : target);
      }
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
  }, [
    showVersionSelector,
    isRemoteRepositorySession,
    searchParams,
    versionStorageKey,
    availableVersions,
    pathname,
    routerReplace,
  ]);
}
