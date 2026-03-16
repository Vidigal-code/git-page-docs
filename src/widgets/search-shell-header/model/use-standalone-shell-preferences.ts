"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import { toFullPath } from "@/shared/lib/base-path";
import type { LanguageCode, LayoutItem } from "@/entities/docs/model/types";

const STORAGE_KEY_PREFIX = "git-page-docs";

function buildStorageKey(prefix: string, siteName: string): string {
  return `${STORAGE_KEY_PREFIX}:${prefix}:${siteName.toLowerCase().replaceAll(" ", "-")}`;
}

export interface UseStandaloneShellPreferencesArgs {
  siteName: string;
  defaultLanguage: LanguageCode;
  availableLanguages: LanguageCode[];
  layouts: LayoutItem[];
  configuredDefaultMode: "light" | "dark";
  initialThemeBaseId: string | undefined;
  /** Optional: use for pathname when window is not available (SSR) */
  fallbackPathname?: string;
}

export function useStandaloneShellPreferences({
  siteName,
  defaultLanguage,
  availableLanguages,
  layouts,
  configuredDefaultMode,
  initialThemeBaseId,
  fallbackPathname = "/",
}: UseStandaloneShellPreferencesArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const languageStorageKey = buildStorageKey("language", siteName);
  const themeModeStorageKey = buildStorageKey("mode", siteName);
  const themeLayoutStorageKey = buildStorageKey("theme", siteName);

  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [languageRestored, setLanguageRestored] = useState(false);

  const initialThemeBase = layouts.find((l) => l.id === initialThemeBaseId) ?? layouts[0];
  const initialThemeId = initialThemeBase
    ? resolveThemeByMode(layouts, initialThemeBase, configuredDefaultMode).id
    : layouts[0]?.id ?? "";

  const [activeThemeId, setActiveThemeId] = useState(initialThemeId);
  const [themeRestored, setThemeRestored] = useState(false);

  function getCurrentPathname(): string {
    if (typeof window !== "undefined") {
      const base = (process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH ?? "").trim();
      const full = window.location.pathname;
      if (base && full.startsWith(base)) {
        return full.slice(base.length) || "/";
      }
      return full || "/";
    }
    return pathname ?? fallbackPathname;
  }

  function getCurrentSearchParams(): URLSearchParams {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(searchParams.toString());
  }

  function replaceUrl(path: string, params: URLSearchParams) {
    const qs = params.toString();
    const fullPath = toFullPath(path || "/");
    const nextUrl = qs ? `${fullPath}?${qs}` : fullPath;
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", nextUrl);
    } else {
      router.replace(qs ? `${path || "/"}?${qs}` : path || "/");
    }
  }

  // Restore language from URL → localStorage
  useEffect(() => {
    const langFromQuery = searchParams.get("lang") as LanguageCode | null;
    if (langFromQuery && availableLanguages.includes(langFromQuery)) {
      setLanguage(langFromQuery);
      setLanguageRestored(true);
      return;
    }
    if (languageRestored) return;
    try {
      const saved = window.localStorage.getItem(languageStorageKey) as LanguageCode | null;
      if (saved && availableLanguages.includes(saved)) {
        setLanguage(saved);
      }
    } catch {
      /* ignore */
    }
    setLanguageRestored(true);
  }, [searchParams, availableLanguages, languageStorageKey, languageRestored]);

  // Restore theme from URL → localStorage (once)
  useEffect(() => {
    if (themeRestored) return;
    const urlMode = searchParams.get("modetheme");
    const targetMode = urlMode === "dark" || urlMode === "light" ? urlMode : configuredDefaultMode;
    try {
      const savedMode = window.localStorage.getItem(themeModeStorageKey);
      const savedThemeId = window.localStorage.getItem(themeLayoutStorageKey);
      const mode = urlMode === "dark" || urlMode === "light" ? urlMode : savedMode === "light" || savedMode === "dark" ? savedMode : configuredDefaultMode;
      const baseLayout = layouts.find((l) => l.id === savedThemeId) ?? layouts.find((l) => l.id === initialThemeBaseId) ?? layouts[0];
      if (baseLayout) {
        const resolved = resolveThemeByMode(layouts, baseLayout, mode);
        setActiveThemeId(resolved.id);
      }
    } catch {
      /* ignore */
    }
    setThemeRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only restore once, skip when themeRestored
  }, [searchParams, configuredDefaultMode, layouts, initialThemeBaseId, themeModeStorageKey, themeLayoutStorageKey]);

  // Persist language when changed
  useEffect(() => {
    if (!languageRestored) return;
    try {
      window.localStorage.setItem(languageStorageKey, String(language));
    } catch {
      /* ignore */
    }
  }, [language, languageStorageKey, languageRestored]);

  // Persist theme mode and layout when changed
  useEffect(() => {
    if (!themeRestored) return;
    const activeLayout = layouts.find((l) => l.id === activeThemeId);
    if (activeLayout?.mode) {
      try {
        window.localStorage.setItem(themeModeStorageKey, activeLayout.mode);
        window.localStorage.setItem(themeLayoutStorageKey, activeThemeId);
      } catch {
        /* ignore */
      }
    }
  }, [themeRestored, activeThemeId, layouts, themeModeStorageKey, themeLayoutStorageKey]);

  function onLanguageChange(newLang: LanguageCode) {
    setLanguage(newLang);
    const params = getCurrentSearchParams();
    params.set("lang", newLang);
    replaceUrl(getCurrentPathname(), params);
  }

  function onThemeChange(themeId: string) {
    setActiveThemeId(themeId);
    const layout = layouts.find((l) => l.id === themeId);
    if (layout?.mode === "dark" || layout?.mode === "light") {
      const params = getCurrentSearchParams();
      params.set("modetheme", layout.mode);
      replaceUrl(getCurrentPathname(), params);
    }
  }

  function onToggleMode() {
    const activeLayout = layouts.find((l) => l.id === activeThemeId);
    if (!activeLayout?.supportsLightAndDarkModes) return;
    const nextMode = activeLayout.mode === "dark" ? "light" : "dark";
    const paired = resolveThemeByMode(layouts, activeLayout, nextMode);
    setActiveThemeId(paired.id);
    if (paired.mode === "dark" || paired.mode === "light") {
      const params = getCurrentSearchParams();
      params.set("modetheme", paired.mode);
      replaceUrl(getCurrentPathname(), params);
    }
  }

  const activeLayout = layouts.find((l) => l.id === activeThemeId) ?? layouts[0];
  const nextModeIsDark = activeLayout?.mode === "dark";
  const canToggleMode = Boolean(activeLayout?.supportsLightAndDarkModes);

  return {
    language,
    onLanguageChange,
    activeThemeId,
    onThemeChange,
    onToggleMode,
    activeLayout,
    nextModeIsDark,
    canToggleMode,
  };
}
