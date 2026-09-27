import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { VersionEntry } from "@/entities/docs";
import { toFullPath } from "@/shared/lib/base-path";
import { readSavedVersion, resolveVersionSyncAction } from "./use-docs-shell-version-sync.helpers";
import { withQuery } from "./with-query";

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
    const action = resolveVersionSyncAction({
      isRemoteRepositorySession,
      pathname,
      params: new URLSearchParams(searchParams?.toString() ?? ""),
      availableVersions,
      savedVersion: isRemoteRepositorySession ? null : readSavedVersion(versionStorageKey),
    });
    if (!action) return;

    const hasWindow = typeof window !== "undefined";
    if (action.kind === "hard-redirect" && hasWindow) {
      window.location.replace(withQuery(toFullPath(action.path), action.params));
      return;
    }
    if (action.kind === "rewrite-url" && hasWindow) {
      window.history.replaceState({}, "", withQuery(toFullPath(action.path), action.params));
      return;
    }
    routerReplace(withQuery(action.path, action.params));
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
