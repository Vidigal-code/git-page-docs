import { useMemo } from "react";
import { buildVersionPath, type LanguageCode, type VersionEntry } from "@/entities/docs";
import { toFullPath } from "@/shared/lib/base-path";
import { buildVersionChangeParams, selectVersionValue } from "./use-version-routing.helpers";
import { getVersionFromPath, stripVersionFromPath } from "./version-url";
import { withQuery } from "./with-query";

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
  const versionFromPath = useMemo(() => getVersionFromPath(pathname), [pathname]);

  const selectedVersionValue = useMemo(
    () => selectVersionValue({ versionFromPath, versionFromQuery, activeVersionId, availableVersions }),
    [versionFromPath, versionFromQuery, activeVersionId, availableVersions],
  );

  function onVersionChange(versionId: string) {
    const targetAppPath = buildVersionPath(stripVersionFromPath(pathname), versionId);
    const hasWindow = typeof window !== "undefined";
    const current = hasWindow ? new URLSearchParams(window.location.search) : getCurrentSearchParams();
    const params = buildVersionChangeParams(current, { isRemoteRepositorySession, isLanguageSelectVisible, language });
    if (hasWindow) {
      window.location.assign(withQuery(toFullPath(targetAppPath), params));
      return;
    }
    routerReplace(withQuery(targetAppPath, params));
  }

  return { versionFromPath, selectedVersionValue, onVersionChange };
}
