import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "git-page-docs:block-menu-on-nav";

function buildStorageKey(siteName: string): string {
  return `${STORAGE_PREFIX}:${siteName.toLowerCase().replaceAll(" ", "-")}`;
}

export function useNavMenuBlockPreference(siteName: string) {
  const key = buildStorageKey(siteName);
  const [blockMenuOnNav, setBlockMenuOnNav] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === "true" || stored === "false") {
        setBlockMenuOnNav(stored === "true");
      }
    } catch {
      // Ignore (private mode, blocked storage)
    }
  }, [key]);

  /** Updates the preference and persists it for the next visit. */
  const persistBlockMenuOnNav = useCallback(
    (value: boolean) => {
      setBlockMenuOnNav(value);
      try {
        window.localStorage.setItem(key, String(value));
      } catch {
        // Ignore
      }
    },
    [key],
  );

  return { blockMenuOnNav, setBlockMenuOnNav: persistBlockMenuOnNav };
}
