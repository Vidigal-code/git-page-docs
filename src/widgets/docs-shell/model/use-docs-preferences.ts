import { useMemo, useRef } from "react";

function buildStorageKey(prefix: string, siteName: string): string {
  return `git-page-docs:${prefix}:${siteName.toLowerCase().replaceAll(" ", "-")}`;
}

export function useDocsPreferences(siteName: string) {
  const languageRestoredRef = useRef(false);
  const themeModeRestoredRef = useRef(false);
  const keys = useMemo(
    () => ({
      languageStorageKey: buildStorageKey("language", siteName),
      versionStorageKey: buildStorageKey("version", siteName),
      themeModeStorageKey: buildStorageKey("mode", siteName),
      themeLayoutStorageKey: buildStorageKey("theme", siteName),
    }),
    [siteName],
  );

  return { ...keys, languageRestoredRef, themeModeRestoredRef };
}
