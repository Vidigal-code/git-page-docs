import { useEffect, useMemo, useState } from "react";
import { resolveThemeByMode, type LayoutItem } from "@/entities/docs";
import { THEME_URL_PARAM } from "@/shared/config/constants";
import { parseThemeMode, useFixedFamilyMode } from "@/features/theme-switcher";

type ThemeMode = "light" | "dark";

interface UseDocsShellThemeStateArgs {
  layouts: LayoutItem[];
  themeSelectionMode?: "fixed" | "selectable";
  configuredDefaultMode: ThemeMode;
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
  themeSelectionMode = "selectable",
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
  const [preferredThemeId, setActiveThemeId] = useState(initialThemeId);
  const { mode: fixedFamilyMode, selectMode: setFixedFamilyMode } = useFixedFamilyMode({
    selectionMode: themeSelectionMode, defaultMode: configuredDefaultMode,
    storageKey: themeModeStorageKey, requestedMode: parseThemeMode(searchParams.get("modetheme")),
  });
  const fixedThemeId = initialThemeBase
    ? resolveThemeByMode(layouts, initialThemeBase, fixedFamilyMode).id : "";
  const activeThemeId = themeSelectionMode === "fixed" ? fixedThemeId : preferredThemeId;
  const [themeModeRestored, setThemeModeRestored] = useState(false);

  const activeLayout = useMemo(() => layouts.find((layout) => layout.id === activeThemeId) ?? layouts[0], [layouts, activeThemeId]);
  const nextMode = activeLayout?.mode === "dark" ? "light" : "dark";
  const pairedLayout = activeLayout ? resolveThemeByMode(layouts, activeLayout, nextMode) : undefined;
  const canToggleMode = Boolean(pairedLayout && pairedLayout.id !== activeLayout?.id);

  useEffect(() => {
    if (themeSelectionMode === "fixed" || themeModeRestored) {
      return;
    }
    try {
      const urlThemeId = searchParams.get(THEME_URL_PARAM);
      const layoutFromUrl = urlThemeId ? layouts.find((layout) => layout.id === urlThemeId) : null;
      if (urlThemeId) {
        queueMicrotask(() => {
          setActiveThemeId(layoutFromUrl?.id ?? initialThemeId);
          setThemeModeRestored(true);
        });
        return;
      }
      const urlMode = parseThemeMode(searchParams.get("modetheme"));
      // Precedence: URL (theme/modetheme) > theme persisted in localStorage > repo default.
      if (!urlMode) {
        const savedThemeId = window.localStorage.getItem(themeLayoutStorageKey);
        const savedLayout = savedThemeId ? layouts.find((layout) => layout.id === savedThemeId) : null;
        if (savedLayout) {
          queueMicrotask(() => {
            setActiveThemeId(savedLayout.id);
            setThemeModeRestored(true);
          });
          return;
        }
      }
      const savedMode = parseThemeMode(window.localStorage.getItem(themeModeStorageKey));
      const targetMode = urlMode ?? savedMode ?? configuredDefaultMode;
      const baseLayout = layouts.find((layout) => layout.id === initialThemeBaseId) ?? layouts[0];
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
  }, [themeSelectionMode, themeModeStorageKey, themeLayoutStorageKey, configuredDefaultMode, layouts, initialThemeBaseId, initialThemeId, searchParams, themeModeRestored]);

  useEffect(() => {
    if (themeSelectionMode === "fixed" || !themeModeRestored || !activeLayout?.mode) {
      return;
    }
    try {
      window.localStorage.setItem(themeModeStorageKey, activeLayout.mode);
    } catch {
      // Ignore localStorage errors.
    }
  }, [themeSelectionMode, themeModeStorageKey, activeLayout?.mode, themeModeRestored]);

  useEffect(() => {
    if (themeSelectionMode === "fixed" || !themeModeRestored || !activeThemeId) {
      return;
    }
    try {
      window.localStorage.setItem(themeLayoutStorageKey, activeThemeId);
    } catch {
      // Ignore localStorage errors.
    }
  }, [themeSelectionMode, themeLayoutStorageKey, activeThemeId, themeModeRestored]);

  useEffect(() => {
    if (themeSelectionMode === "fixed" || !themeModeRestored || !activeThemeId || !activeLayout?.mode) {
      return;
    }
    const params = getCurrentSearchParams();
    const currentTheme = params.get(THEME_URL_PARAM);
    if (currentTheme !== activeThemeId) {
      params.set(THEME_URL_PARAM, activeThemeId);
      params.set("modetheme", activeLayout.mode);
      replaceUrlWithoutNavigation(pathname, params);
    }
  }, [themeSelectionMode, themeModeRestored, activeThemeId, activeLayout?.mode, pathname, getCurrentSearchParams, replaceUrlWithoutNavigation]);

  useEffect(() => {
    function syncThemeFromStorage() {
      try {
        const savedMode = window.localStorage.getItem(themeModeStorageKey);
        const targetMode = savedMode === "light" || savedMode === "dark" ? savedMode : configuredDefaultMode;
        if (themeSelectionMode === "fixed") {
          setFixedFamilyMode(targetMode);
          return;
        }
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
  }, [themeSelectionMode, themeModeStorageKey, configuredDefaultMode, layouts, activeThemeId, setFixedFamilyMode]);

  function syncThemeToUrl(themeId: string, mode?: "dark" | "light") {
    const params = getCurrentSearchParams();
    params.set(THEME_URL_PARAM, themeId);
    if (mode) params.set("modetheme", mode);
    replaceUrlWithoutNavigation(pathname, params);
  }

  function onThemeChange(themeId: string) {
    if (themeSelectionMode === "fixed") return;

    setActiveThemeId(themeId);
    const layout = layouts.find((item) => item.id === themeId);
    syncThemeToUrl(themeId, layout?.mode === "dark" || layout?.mode === "light" ? layout.mode : undefined);
  }

  function onToggleMode() {
    if (!canToggleMode || !pairedLayout) {
      return;
    }
    if (themeSelectionMode === "fixed") setFixedFamilyMode(nextMode);
    else setActiveThemeId(pairedLayout.id);
    syncThemeToUrl(pairedLayout.id, nextMode);
  }

  return { activeThemeId, activeLayout, nextMode, canToggleMode, onThemeChange, onToggleMode };
}
