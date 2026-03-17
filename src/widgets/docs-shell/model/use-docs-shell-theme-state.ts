import { useEffect, useMemo, useState } from "react";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import type { LayoutItem } from "@/entities/docs/model/types";
import { THEME_URL_PARAM } from "@/shared/config/constants";

interface UseDocsShellThemeStateArgs {
  layouts: LayoutItem[];
  configuredDefaultMode: "light" | "dark";
  initialThemeBaseId: string | undefined;
  searchParams: URLSearchParams | { get(name: string): string | null };
  themeModeStorageKey: string;
  themeLayoutStorageKey: string;
  pathname: string;
  getCurrentSearchParams: () => URLSearchParams;
  replaceUrlWithoutNavigation: (nextPathname: string, params: URLSearchParams) => void;
}

export function useDocsShellThemeState({
  layouts,
  configuredDefaultMode,
  initialThemeBaseId,
  searchParams,
  themeModeStorageKey,
  themeLayoutStorageKey,
  pathname,
  getCurrentSearchParams,
  replaceUrlWithoutNavigation,
}: UseDocsShellThemeStateArgs) {
  const initialThemeBase = layouts.find((layout) => layout.id === initialThemeBaseId) ?? layouts[0];
  const initialThemeId = initialThemeBase ? resolveThemeByMode(layouts, initialThemeBase, configuredDefaultMode).id : "";
  const [activeThemeId, setActiveThemeId] = useState(initialThemeId);
  const [themeModeRestored, setThemeModeRestored] = useState(false);

  const activeLayout = useMemo(() => layouts.find((layout) => layout.id === activeThemeId) ?? layouts[0], [layouts, activeThemeId]);
  const nextMode = activeLayout?.mode === "dark" ? "light" : "dark";
  const canToggleMode = Boolean(activeLayout?.supportsLightAndDarkModes);

  useEffect(() => {
    if (themeModeRestored) {
      return;
    }
    try {
      const urlThemeId = searchParams.get(THEME_URL_PARAM);
      const layoutFromUrl = urlThemeId ? layouts.find((layout) => layout.id === urlThemeId) : null;
      if (layoutFromUrl) {
        queueMicrotask(() => {
          setActiveThemeId(layoutFromUrl.id);
          setThemeModeRestored(true);
        });
        return;
      }
      const urlMode = searchParams.get("modetheme");
      const savedMode = window.localStorage.getItem(themeModeStorageKey);
      const savedThemeId = window.localStorage.getItem(themeLayoutStorageKey);
      const targetMode =
        urlMode === "dark" || urlMode === "light"
          ? urlMode
          : savedMode === "light" || savedMode === "dark"
            ? savedMode
            : configuredDefaultMode;
      const baseLayout = layouts.find((layout) => layout.id === savedThemeId) ?? layouts.find((layout) => layout.id === initialThemeBaseId) ?? layouts[0];
      if (baseLayout) {
        const resolved = resolveThemeByMode(layouts, baseLayout, targetMode);
        queueMicrotask(() => {
          setActiveThemeId(resolved.id);
          setThemeModeRestored(true);
        });
        return;
      }
    } catch {
      // Ignore localStorage errors.
    }
    setThemeModeRestored(true);
  }, [themeModeStorageKey, themeLayoutStorageKey, configuredDefaultMode, layouts, initialThemeBaseId, searchParams, themeModeRestored]);

  useEffect(() => {
    if (!themeModeRestored || !activeLayout?.mode) {
      return;
    }
    try {
      window.localStorage.setItem(themeModeStorageKey, activeLayout.mode);
    } catch {
      // Ignore localStorage errors.
    }
  }, [themeModeStorageKey, activeLayout?.mode, themeModeRestored]);

  useEffect(() => {
    if (!themeModeRestored || !activeThemeId) {
      return;
    }
    try {
      window.localStorage.setItem(themeLayoutStorageKey, activeThemeId);
    } catch {
      // Ignore localStorage errors.
    }
  }, [themeLayoutStorageKey, activeThemeId, themeModeRestored]);

  useEffect(() => {
    if (!themeModeRestored || !activeThemeId || !activeLayout?.mode) {
      return;
    }
    const params = getCurrentSearchParams();
    const currentTheme = params.get(THEME_URL_PARAM);
    if (currentTheme !== activeThemeId) {
      params.set(THEME_URL_PARAM, activeThemeId);
      params.set("modetheme", activeLayout.mode);
      replaceUrlWithoutNavigation(pathname, params);
    }
  }, [themeModeRestored, activeThemeId, activeLayout?.mode, pathname, getCurrentSearchParams, replaceUrlWithoutNavigation]);

  useEffect(() => {
    function syncThemeFromStorage() {
      try {
        const savedMode = window.localStorage.getItem(themeModeStorageKey);
        const targetMode = savedMode === "light" || savedMode === "dark" ? savedMode : configuredDefaultMode;
        const currentBase = layouts.find((layout) => layout.id === activeThemeId) ?? layouts[0];
        if (!currentBase) {
          return;
        }
        const resolved = resolveThemeByMode(layouts, currentBase, targetMode);
        if (resolved.id !== activeThemeId) {
          setActiveThemeId(resolved.id);
        }
      } catch {
        // Ignore localStorage errors.
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key === themeModeStorageKey) {
        syncThemeFromStorage();
      }
    }

    function onVisibilityChange() {
      if (!document.hidden) {
        syncThemeFromStorage();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncThemeFromStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncThemeFromStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [themeModeStorageKey, configuredDefaultMode, layouts, activeThemeId]);

  function syncThemeToUrl(themeId: string, mode?: "dark" | "light") {
    const params = getCurrentSearchParams();
    params.set(THEME_URL_PARAM, themeId);
    if (mode) params.set("modetheme", mode);
    replaceUrlWithoutNavigation(pathname, params);
  }

  function onThemeChange(themeId: string) {
    setActiveThemeId(themeId);
    const layout = layouts.find((item) => item.id === themeId);
    syncThemeToUrl(themeId, layout?.mode === "dark" || layout?.mode === "light" ? layout.mode : undefined);
  }

  function onToggleMode() {
    if (!activeLayout) {
      return;
    }
    const paired = resolveThemeByMode(layouts, activeLayout, nextMode);
    setActiveThemeId(paired.id);
    syncThemeToUrl(paired.id, paired.mode === "dark" || paired.mode === "light" ? paired.mode : undefined);
  }

  return { activeThemeId, activeLayout, nextMode, canToggleMode, onThemeChange, onToggleMode };
}
