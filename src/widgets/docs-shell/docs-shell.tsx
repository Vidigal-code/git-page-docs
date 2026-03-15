"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";
import { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import { toDocsShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type {
  HeaderMenuItem,
  HeaderMenuLocalizedContent,
  LanguageCode,
  LoadedDocsData,
} from "@/entities/docs/model/types";
import { LanguageSelector } from "@/features/language-selector/ui/language-selector";
import { QuickNavigationTrigger } from "@/features/quick-navigation/ui/quick-navigation-trigger";
import { ThemeModeToggle } from "@/features/theme-switcher/ui/theme-mode-toggle";
import { VersionSelector } from "@/features/version-selector/ui/version-selector";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { SiteFooter } from "@/shared/ui/site-footer";
import { useDocsPreferences } from "./model/use-docs-preferences";
import { useFocusMode } from "./model/use-focus-mode";
import { useQuickNavigation } from "./model/use-quick-navigation";
import { useVersionRouting } from "./model/use-version-routing";
import styles from "./docs-shell.module.css";

function getRouteIndexByPath(data: LoadedDocsData, language: LanguageCode, filePath: string): number {
  return data.config.routes.findIndex((route) => route.path[language] === filePath);
}


interface MenuEntry {
  key: string;
  id: number;
  title: string;
  pathClick: string;
  active: boolean;
  level: number;
  searchLabel: string;
  ancestorKeys: string[];
}

interface MenuNode {
  key: string;
  id: number;
  title: string;
  pathClick: string;
  active: boolean;
  level: number;
  searchLabel: string;
  ancestorKeys: string[];
  children: MenuNode[];
}

interface VersionLinkOption {
  id: "branch" | "release" | "commit";
  label: string;
  url: string;
}

function buildVersionLinkOptions(activeVersion: LoadedDocsData["activeVersion"]): VersionLinkOption[] {
  if (!activeVersion) {
    return [];
  }

  const options: VersionLinkOption[] = [];
  const branch = activeVersion.branch?.trim();
  const release = activeVersion.release?.trim();
  const commit = activeVersion.commit?.trim();

  if (branch) {
    options.push({ id: "branch", label: "Branch", url: branch });
  }
  if (release) {
    options.push({ id: "release", label: "Release", url: release });
  }
  if (commit) {
    options.push({ id: "commit", label: "Commit", url: commit });
  }

  return options;
}


function buildLocalizedSubmenuTree(
  submenus: HeaderMenuLocalizedContent[],
  parentKey: string,
  parentTrail: string[],
  parentAncestors: string[],
  level: number,
  data: LoadedDocsData,
  language: LanguageCode,
  routeIndex: number,
): MenuNode[] {
  const entries: MenuNode[] = [];

  submenus.forEach((submenu, index) => {
    const pathClick = submenu["path-click"] ?? "";
    const title = submenu.title ?? "Menu";
    const trail = [...parentTrail, title];
    const key = `${parentKey}-l${level}-${index}`;
    const ancestorKeys = [...parentAncestors];
    const children = submenu.submenus?.length
      ? buildLocalizedSubmenuTree(submenu.submenus, key, trail, [...ancestorKeys, key], level + 1, data, language, routeIndex)
      : [];

    entries.push({
      key,
      id: index,
      title,
      pathClick,
      active: routeIndex === getRouteIndexByPath(data, language, pathClick),
      level,
      searchLabel: trail.join(" / "),
      ancestorKeys,
      children,
    });
  });

  return entries;
}

function buildHeaderMenuTree(
  menus: HeaderMenuItem[],
  data: LoadedDocsData,
  language: LanguageCode,
  routeIndex: number,
  level = 0,
  parentTrail: string[] = [],
  parentAncestors: string[] = [],
): MenuNode[] {
  const entries: MenuNode[] = [];

  menus.forEach((menu) => {
    const value = menu[language] as HeaderMenuLocalizedContent | undefined;
    const title = value?.title ?? "Menu";
    const pathClick = value?.["path-click"] ?? "";
    const trail = [...parentTrail, title];
    const key = `${trail.join("-")}-${menu.id}`;
    const ancestorKeys = [...parentAncestors];
    const nestedByItem = Array.isArray(menu.submenus)
      ? buildHeaderMenuTree(menu.submenus, data, language, routeIndex, level + 1, trail, [...ancestorKeys, key])
      : [];
    const nestedByLanguage = value?.submenus?.length
      ? buildLocalizedSubmenuTree(
          value.submenus,
          `${menu.id}`,
          trail,
          [...ancestorKeys, key],
          level + 1,
          data,
          language,
          routeIndex,
        )
      : [];

    entries.push({
      key,
      id: menu.id,
      title,
      pathClick,
      active: routeIndex === getRouteIndexByPath(data, language, pathClick),
      level,
      searchLabel: trail.join(" / "),
      ancestorKeys,
      children: [...nestedByItem, ...nestedByLanguage],
    });
  });

  return entries;
}

function flattenMenuTree(nodes: MenuNode[]): MenuEntry[] {
  const result: MenuEntry[] = [];
  nodes.forEach((node) => {
    result.push({
      key: node.key,
      id: node.id,
      title: node.title,
      pathClick: node.pathClick,
      active: node.active,
      level: node.level,
      searchLabel: node.searchLabel,
      ancestorKeys: node.ancestorKeys,
    });
    if (node.children.length) {
      result.push(...flattenMenuTree(node.children));
    }
  });
  return result;
}

export function DocsShell({ data }: { data: LoadedDocsData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultLanguage = data.config.site.defaultLanguage;
  const { languageStorageKey, versionStorageKey, themeModeStorageKey, themeLayoutStorageKey, languageRestoredRef, themeModeRestoredRef } =
    useDocsPreferences(data.config.site.name);
  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [routeIndex, setRouteIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [versionLinksPopupOpen, setVersionLinksPopupOpen] = useState(false);
  const [expandedMenuMap, setExpandedMenuMap] = useState<Record<string, boolean>>({});

  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;
  const initialThemeBase =
    data.layoutsConfig.layouts.find((layout) => layout.id === initialThemeBaseId) ?? data.layoutsConfig.layouts[0];
  const initialThemeId = initialThemeBase
    ? resolveThemeByMode(data.layoutsConfig.layouts, initialThemeBase, configuredDefaultMode).id
    : "";
  const [activeThemeId, setActiveThemeId] = useState(initialThemeId);

  const activeLayout = data.layoutsConfig.layouts.find((layout) => layout.id === activeThemeId) ?? data.layoutsConfig.layouts[0];
  const activeTheme = data.themes[activeLayout?.id];

  const nextMode = activeLayout?.mode === "dark" ? "light" : "dark";
  const canToggleMode = Boolean(activeLayout?.supportsLightAndDarkModes);
  const hideThemeSelector = data.config.site.HideThemeSelector;

  const safeRouteIndex = routeIndex >= 0 && routeIndex < data.docs.length ? routeIndex : 0;
  const currentDoc = data.docs[safeRouteIndex];
  const markdownHtml = currentDoc?.markdownByLanguage[language] ?? "<p>Document not found for this language.</p>";

  const languageCount = data.availableLanguages.length;
  const isLanguageSelectVisible = languageCount > 1;

  const cssVars = useMemo(() => toDocsShellCssVars(activeTheme), [activeTheme]);
  const previousLabel = resolveTranslation(
    data.config.translations?.navigation?.previous,
    language,
    "Previous",
  );
  const nextLabel = resolveTranslation(data.config.translations?.navigation?.next, language, "Next Markdown");
  const activeNavigation = Boolean(data.config.site.ActiveNavigation);
  const focusModeEnabled = Boolean(data.config.site.FocusMode);
  const versionLinkOptions = useMemo(() => buildVersionLinkOptions(data.activeVersion), [data.activeVersion]);
  const fallbackProjectLink = data.activeVersion?.ProjectLink?.trim() || data.config.site.ProjectLink?.trim();
  const iconImage =
    (activeLayout?.mode === "dark"
      ? data.config.site.IconImageMenuHeaderDark?.trim()
      : data.config.site.IconImageMenuHeaderLight?.trim()) || data.config.site.IconImageMenuHeader?.trim();
  const useReactHeaderIcon = Boolean(data.config.site.IconImageMenuHeaderReactIcones);
  const reactHeaderIconTag = data.config.site.IconImageMenuHeaderReactIconesTag;
  const headerReactIconColor =
    activeLayout?.mode === "dark"
      ? data.config.site.IconImageMenuHeaderReactIconesTagColorDark
      : data.config.site.IconImageMenuHeaderReactIconesTagColorLight;
  const headerReactIconSize = data.config.site.IconImageMenuHeaderReactIconesTagSize;
  const headerReactIconStyle: React.CSSProperties = {
    color: headerReactIconColor?.trim() || undefined,
    fontSize: headerReactIconSize?.trim() || undefined,
  };
  const useReactProjectLinkIcon = Boolean(data.config.site.IconProjectLinkReactIcones);
  const projectLinkReactIconTag = data.config.site.IconProjectLinkReactIconesTag;
  const projectLinkReactIconColor =
    activeLayout?.mode === "dark"
      ? data.config.site.IconProjectLinkReactIconesTagColorDark
      : data.config.site.IconProjectLinkReactIconesTagColorLight;
  const projectLinkReactIconSize = data.config.site.IconProjectLinkReactIconesTagSize;
  const projectLinkReactIconStyle: React.CSSProperties = {
    color: projectLinkReactIconColor?.trim() || undefined,
    fontSize: projectLinkReactIconSize?.trim() || undefined,
  };
  const menuOpenLabel = getLangMenuLabelFromMenu(
    data.config.site.langmenu,
    language,
    "menuOpen",
    resolveTranslation(data.config.translations?.navigation?.menuOpen, language, "Menu"),
  );
  const menuCloseLabel = getLangMenuLabelFromMenu(
    data.config.site.langmenu,
    language,
    "menuClose",
    resolveTranslation(data.config.translations?.navigation?.menuClose, language, "Close"),
  );
  const quickNavLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "quickNavigation", "Ctrl+K");
  const quickNavPlaceholder = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "typeToNavigate", "Type to navigate...");
  const noNavigationResults = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "noNavigationResults", "No navigation results.");
  const navigateHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "navigateHint", "Navigate");
  const selectHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "selectHint", "Select");
  const escHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "escHint", "ESC");
  const closeHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "closeHint", menuCloseLabel);
  const darkModeLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "darkMode", "Dark mode");
  const lightModeLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "lightMode", "Light mode");
  const versionLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "versionLabel", "Version");
  const focusModeLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "focusMode", "Focus mode");
  const versionLinksLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "versionLinksLabel", "Repository links");
  const branchLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "branchLabel", "Branch");
  const releaseLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "releaseLabel", "Release");
  const commitLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "commitLabel", "Commit");
  const projectLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "projectLabel", "Project");
  const showVersionSelector = data.availableVersions.length > 1;
  const footerEnabled = data.config.site.FooterEnabled !== false;
  const projectFooterUrl = "https://github.com/Vidigal-code/git-page-docs";
  const isRemoteRepositorySession = data.activeRepository.source === "remote";
  const versionFromQuery = searchParams.get("version");

  const headerMenuTree = useMemo(
    () => buildHeaderMenuTree(data.config["menus-header"] ?? [], data, language, safeRouteIndex),
    [data, language, safeRouteIndex],
  );
  const versionLinkOptionsWithLabels = useMemo(
    () =>
      versionLinkOptions.map((option) => ({
        ...option,
        label: option.id === "branch" ? branchLabel : option.id === "release" ? releaseLabel : commitLabel,
      })),
    [versionLinkOptions, branchLabel, releaseLabel, commitLabel],
  );

  const headerMenuEntries = useMemo(() => flattenMenuTree(headerMenuTree), [headerMenuTree]);
  const {
    quickNavOpen,
    setQuickNavOpen,
    quickNavQuery,
    setQuickNavQuery,
    quickNavActiveIndex,
    setQuickNavActiveIndex,
    quickNavListRef,
    quickNavItemRefs,
    filteredQuickNavEntries,
    openQuickNavigation: openQuickNavigationInternal,
    closeQuickNavigation: closeQuickNavigationInternal,
  } = useQuickNavigation(headerMenuEntries);
  const {
    focusModeOpen,
    setFocusModeOpen,
    focusModePages,
    safeFocusModePageIndex,
    focusModeCurrentHtml,
    canFocusModeGoPrevious,
    canFocusModeGoNext,
    openFocusMode: openFocusModeInternal,
    closeFocusMode: closeFocusModeInternal,
    onFocusModeNavigate: onFocusModeNavigateInternal,
  } = useFocusMode(markdownHtml);
  const { versionFromPath, selectedVersionValue, onVersionChange: onVersionChangeInternal } = useVersionRouting({
    pathname,
    versionFromQuery,
    activeVersionId: data.activeVersionId,
    availableVersions: data.availableVersions,
    isLanguageSelectVisible,
    isRemoteRepositorySession,
    language,
    getCurrentSearchParams,
    routerReplace: router.replace,
  });

  const linearNavigationEntries = useMemo(() => {
    const seen = new Set<string>();
    return headerMenuEntries.filter((entry) => {
      if (!entry.pathClick || seen.has(entry.pathClick)) {
        return false;
      }
      const hasRoute = getRouteIndexByPath(data, language, entry.pathClick) >= 0;
      if (!hasRoute) {
        return false;
      }
      seen.add(entry.pathClick);
      return true;
    });
  }, [headerMenuEntries, data, language]);

  const currentRoutePath = data.config.routes[safeRouteIndex]?.path[language] ?? "";
  const currentLinearNavigationIndex = useMemo(
    () => linearNavigationEntries.findIndex((entry) => entry.pathClick === currentRoutePath),
    [linearNavigationEntries, currentRoutePath],
  );
  const canGoPrevious = currentLinearNavigationIndex > 0;
  const canGoNext =
    currentLinearNavigationIndex >= 0 && currentLinearNavigationIndex < linearNavigationEntries.length - 1;

  function openQuickNavigation() {
    setMenuOpen(false);
    setVersionLinksPopupOpen(false);
    setFocusModeOpen(false);
    openQuickNavigationInternal();
  }

  function closeQuickNavigation() {
    closeQuickNavigationInternal();
  }

  useEffect(() => {
    if (!activeNavigation) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setFocusModeOpen(false);
        setQuickNavOpen((prev) => !prev);
        if (!quickNavOpen) {
          setQuickNavQuery("");
        }
      }

      if (event.key === "Escape" && focusModeOpen) {
        event.preventDefault();
        setFocusModeOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeNavigation, quickNavOpen, focusModeOpen, setFocusModeOpen, setQuickNavOpen, setQuickNavQuery]);

  useEffect(() => {
    const langFromQuery = searchParams.get("lang") as LanguageCode | null;
    if (langFromQuery && data.availableLanguages.includes(langFromQuery)) {
      setLanguage(langFromQuery);
      languageRestoredRef.current = true;
    }
  }, [searchParams, data.availableLanguages, languageRestoredRef]);

  useEffect(() => {
    if (languageRestoredRef.current) {
      return;
    }

    try {
      const savedLanguage = window.localStorage.getItem(languageStorageKey);
      if (savedLanguage && data.availableLanguages.includes(savedLanguage)) {
        queueMicrotask(() => {
          setLanguage(savedLanguage);
          languageRestoredRef.current = true;
        });
        return;
      }
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }

    languageRestoredRef.current = true;
  }, [languageStorageKey, data.availableLanguages, languageRestoredRef]);

  useEffect(() => {
    if (!languageRestoredRef.current) {
      return;
    }

    try {
      window.localStorage.setItem(languageStorageKey, String(language));
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
  }, [language, languageStorageKey, languageRestoredRef]);

  useEffect(() => {
    if (themeModeRestoredRef.current) {
      return;
    }

    try {
      const urlMode = searchParams.get("modetheme");
      const savedMode = window.localStorage.getItem(themeModeStorageKey);
      const savedThemeId = window.localStorage.getItem(themeLayoutStorageKey);
      const targetMode =
        urlMode === "dark" || urlMode === "light"
          ? urlMode
          : savedMode === "light" || savedMode === "dark"
            ? savedMode
            : configuredDefaultMode;
      const baseLayout =
        data.layoutsConfig.layouts.find((layout) => layout.id === savedThemeId) ??
        data.layoutsConfig.layouts.find((layout) => layout.id === initialThemeBaseId) ??
        data.layoutsConfig.layouts[0];
      if (baseLayout) {
        const resolved = resolveThemeByMode(data.layoutsConfig.layouts, baseLayout, targetMode);
        queueMicrotask(() => {
          setActiveThemeId(resolved.id);
          themeModeRestoredRef.current = true;
        });
        return;
      }
    } catch {
      // Ignore localStorage errors.
    }

    themeModeRestoredRef.current = true;
  }, [themeModeStorageKey, themeLayoutStorageKey, configuredDefaultMode, data.layoutsConfig.layouts, initialThemeBaseId, searchParams, themeModeRestoredRef]);

  useEffect(() => {
    if (!themeModeRestoredRef.current || !activeLayout?.mode) {
      return;
    }

    try {
      window.localStorage.setItem(themeModeStorageKey, activeLayout.mode);
    } catch {
      // Ignore localStorage errors.
    }
  }, [themeModeStorageKey, activeLayout?.mode, themeModeRestoredRef]);

  useEffect(() => {
    if (!themeModeRestoredRef.current || !activeThemeId) {
      return;
    }

    try {
      window.localStorage.setItem(themeLayoutStorageKey, activeThemeId);
    } catch {
      // Ignore localStorage errors.
    }
  }, [themeLayoutStorageKey, activeThemeId, themeModeRestoredRef]);

  useEffect(() => {
    function syncThemeFromStorage() {
      try {
        const savedMode = window.localStorage.getItem(themeModeStorageKey);
        const targetMode = savedMode === "light" || savedMode === "dark" ? savedMode : configuredDefaultMode;
        const currentBase =
          data.layoutsConfig.layouts.find((layout) => layout.id === activeThemeId) ?? data.layoutsConfig.layouts[0];
        if (!currentBase) {
          return;
        }
        const resolved = resolveThemeByMode(data.layoutsConfig.layouts, currentBase, targetMode);
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
  }, [themeModeStorageKey, configuredDefaultMode, data.layoutsConfig.layouts, activeThemeId]);

  useEffect(() => {
    if (!showVersionSelector) return;
    const params = new URLSearchParams(searchParams.toString());
    const urlVersion = params.get("version");
    const hasVersionInPath = /\/v\/[^/]+\/?$/.test(pathname);
    const pathVersionMatch = pathname.match(/\/v\/([^/]+)\/?$/);
    const versionFromPath = pathVersionMatch?.[1];
    const hasVersionInConfig = (versionId: string | null | undefined) =>
      Boolean(versionId && data.availableVersions.some((v) => v.id === versionId));

    if (isRemoteRepositorySession) {
      const validUrlVersion = hasVersionInConfig(urlVersion) ? urlVersion : undefined;
      const validPathVersion = hasVersionInConfig(versionFromPath) ? versionFromPath : undefined;

      if (validUrlVersion && validUrlVersion !== validPathVersion) {
        const basePath = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
        params.delete("version");
        const target = buildVersionPath(basePath, validUrlVersion);
        const qs = params.toString();
        const nextUrl = qs ? `${target}?${qs}` : target;
        if (typeof window !== "undefined") {
          window.location.replace(nextUrl);
        } else {
          router.replace(nextUrl);
        }
        return;
      }

      if (urlVersion && !validUrlVersion) {
        // Remove invalid version from query to avoid inconsistent state.
        params.delete("version");
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname || "/";
          const qs = params.toString();
          const nextUrl = qs ? `${currentPath}?${qs}` : currentPath;
          window.history.replaceState({}, "", nextUrl);
        } else {
          const qs = params.toString();
          const nextUrl = qs ? `${pathname}?${qs}` : pathname;
          router.replace(nextUrl);
        }
      }
      return;
    }

    params.delete("version");
    if (urlVersion && data.availableVersions.some((v) => v.id === urlVersion) && !hasVersionInPath) {
      const base = pathname.replace(/\/$/, "");
      const target = `${base}/v/${urlVersion}`;
      const qs = params.toString();
      router.replace(qs ? `${target}?${qs}` : target);
      return;
    }
    try {
      const savedVersion = window.localStorage.getItem(versionStorageKey);
      if (savedVersion && data.availableVersions.some((v) => v.id === savedVersion) && !hasVersionInPath) {
        const base = pathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
        const target = buildVersionPath(base || pathname, savedVersion);
        const qs = params.toString();
        router.replace(qs ? `${target}?${qs}` : target);
      }
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
  }, [showVersionSelector, isRemoteRepositorySession, searchParams, versionStorageKey, data.availableVersions, data.availableLanguages, pathname, router]);

  function getCurrentSearchParams(): URLSearchParams {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(searchParams.toString());
  }

  function replaceUrlWithoutNavigation(nextPathname: string, params: URLSearchParams): void {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname || "/";
      const qs = params.toString();
      const nextUrl = qs ? `${currentPath}?${qs}` : currentPath;
      window.history.replaceState({}, "", nextUrl);
      return;
    }
    const normalizedPath = nextPathname || pathname || "/";
    const qs = params.toString();
    const nextUrl = qs ? `${normalizedPath}?${qs}` : normalizedPath;
    router.replace(nextUrl);
  }

  function updateModethemeInUrl(mode: "dark" | "light") {
    const params = getCurrentSearchParams();
    params.set("modetheme", mode);
    replaceUrlWithoutNavigation(pathname, params);
  }

  function onThemeChange(themeId: string) {
    setActiveThemeId(themeId);
    const layout = data.layoutsConfig.layouts.find((l) => l.id === themeId);
    if (layout?.mode === "dark" || layout?.mode === "light") {
      updateModethemeInUrl(layout.mode);
    }
  }

  function onToggleMode() {
    if (!activeLayout) {
      return;
    }
    const paired = resolveThemeByMode(data.layoutsConfig.layouts, activeLayout, nextMode);
    setActiveThemeId(paired.id);
    if (paired.mode === "dark" || paired.mode === "light") {
      updateModethemeInUrl(paired.mode);
    }
  }

  function onMenuClick(pathClick: string, ancestorKeys: string[] = []) {
    const idx = getRouteIndexByPath(data, language, pathClick);
    if (idx >= 0) {
      setRouteIndex(idx);
    }
    if (ancestorKeys.length) {
      setExpandedMenuMap((prev) => {
        const nextMap = { ...prev };
        ancestorKeys.forEach((key) => {
          nextMap[key] = true;
        });
        return nextMap;
      });
    }
    setSidebarOpen(true);
    setMenuOpen(false);
    setQuickNavOpen(false);
    setFocusModeOpen(false);
    setQuickNavQuery("");
  }

  function onVersionChange(versionId: string) {
    try {
      window.localStorage.setItem(versionStorageKey, versionId);
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
    onVersionChangeInternal(versionId);
  }

  function onLanguageChange(newLang: LanguageCode) {
    setLanguage(newLang);
    const params = getCurrentSearchParams();
    params.set("lang", newLang);
    params.delete("version");
    const cleanPath = pathname.replace(/\/$/, "") || pathname;
    replaceUrlWithoutNavigation(cleanPath, params);
  }

  function goToLinearNavigation(offset: -1 | 1) {
    if (currentLinearNavigationIndex < 0) {
      return;
    }
    const targetEntry = linearNavigationEntries[currentLinearNavigationIndex + offset];
    if (!targetEntry) {
      return;
    }
    onMenuClick(targetEntry.pathClick, targetEntry.ancestorKeys);
  }

  function openVersionLinksPopup() {
    setMenuOpen(false);
    setQuickNavOpen(false);
    setFocusModeOpen(false);
    setVersionLinksPopupOpen(true);
  }

  function openFocusMode() {
    setMenuOpen(false);
    setQuickNavOpen(false);
    setVersionLinksPopupOpen(false);
    openFocusModeInternal();
  }

  function closeFocusMode() {
    closeFocusModeInternal();
  }

  function onFocusModeNavigate(offset: -1 | 1) {
    onFocusModeNavigateInternal(offset);
  }

  function openVersionLink(url: string) {
    window.open(url, "_blank", "noreferrer");
  }

  function toggleNode(nodeKey: string) {
    setExpandedMenuMap((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  }

  function isNodeExpanded(node: MenuNode): boolean {
    return expandedMenuMap[node.key] ?? true;
  }

  function renderMenuTree(nodes: MenuNode[], keyPrefix: string) {
    return nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const expanded = isNodeExpanded(node);

      return (
        <div key={`${keyPrefix}-${node.key}`} className={styles.menuNode}>
          <div className={styles.menuNodeRow}>
            {hasChildren ? (
              <div className={`${styles.menuActionContainer} ${node.active ? styles.menuButtonActive : ""}`}>
                <button
                  className={styles.menuActionMain}
                  onClick={() => onMenuClick(node.pathClick, node.ancestorKeys)}
                >
                  {`${node.level > 0 ? "› ".repeat(node.level) : ""}${node.title}`}
                </button>
                <button
                  className={styles.menuExpandInline}
                  onClick={() => toggleNode(node.key)}
                  aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
                  title={expanded ? "Collapse submenu" : "Expand submenu"}
                >
                  {expanded ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />}
                </button>
              </div>
            ) : (
              <button
                className={`${styles.menuButton} ${node.active ? styles.menuButtonActive : ""}`}
                onClick={() => onMenuClick(node.pathClick, node.ancestorKeys)}
              >
                {`${node.level > 0 ? "› ".repeat(node.level) : ""}${node.title}`}
              </button>
            )}
          </div>
          {hasChildren && expanded && <div className={styles.menuChildren}>{renderMenuTree(node.children, keyPrefix)}</div>}
        </div>
      );
    });
  }

  return (
    <div className={`${styles.wrapper} ${!sidebarOpen ? styles.wrapperCollapsed : ""}`} style={cssVars}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          {useReactHeaderIcon ? (
            <span className={styles.brandReactIcon} style={headerReactIconStyle}>
              <ReactIconByTag
                tag={reactHeaderIconTag}
                fallback={activeLayout?.mode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />}
              />
            </span>
          ) : iconImage ? (
            <Image
              src={iconImage}
              alt={data.config.site.name}
              width={28}
              height={28}
              className={styles.brandIcon}
              unoptimized
            />
          ) : null}
          <span>{data.config.site.name}</span>
        </div>
        <nav className={styles.menuList}>
          {renderMenuTree(headerMenuTree, "desktop")}
        </nav>
        <div className={styles.sidebarFooter}>
          <button
            className={`${styles.button} ${styles.sidebarRailButton}`}
            onClick={() => setSidebarOpen(false)}
            aria-label={menuCloseLabel}
            title={menuCloseLabel}
          >
            ❮❮
          </button>
        </div>
      </aside>

      {!sidebarOpen && (
        <div className={styles.collapsedNavRail}>
          <button
            className={`${styles.button} ${styles.sidebarRailButton}`}
            onClick={() => setSidebarOpen(true)}
            aria-label={menuOpenLabel}
            title={menuOpenLabel}
          >
            ❯❯
          </button>
        </div>
      )}

      <div className={styles.contentArea}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              {useReactHeaderIcon ? (
                <span className={styles.headerReactIcon} style={headerReactIconStyle}>
                  <ReactIconByTag
                    tag={reactHeaderIconTag}
                    fallback={activeLayout?.mode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />}
                  />
                </span>
              ) : iconImage ? (
                <Image
                  src={iconImage}
                  alt={data.config.site.name}
                  width={28}
                  height={28}
                  className={styles.headerIcon}
                  unoptimized
                />
              ) : null}
              <strong>{data.config.site.name}</strong>
              <button
                className={`${styles.button} ${styles.mobileToggle}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? menuCloseLabel : menuOpenLabel}
                title={menuOpen ? menuCloseLabel : menuOpenLabel}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>

            <div className={styles.headerRight}>
              {fallbackProjectLink && (
                <a
                  href={fallbackProjectLink}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.button} ${styles.githubLinkButton}`}
                  aria-label="Open project repository"
                  title="Open project repository"
                >
                  {useReactProjectLinkIcon ? (
                    <ReactIconByTag tag={projectLinkReactIconTag} style={projectLinkReactIconStyle} />
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden className={styles.githubIcon}>
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.85 9.72.5.1.68-.22.68-.5 0-.24-.01-.9-.01-1.77-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.93.85.09-.67.35-1.12.64-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.88a9.3 9.3 0 0 1 2.5.35c1.9-1.33 2.74-1.05 2.74-1.05.54 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.94-2.33 4.8-4.56 5.06.36.31.68.92.68 1.86 0 1.35-.01 2.43-.01 2.76 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
                      />
                    </svg>
                  )}
                </a>
              )}
              {!!versionLinkOptionsWithLabels.length && (
                <button className={styles.button} onClick={openVersionLinksPopup} aria-label={versionLinksLabel}>
                  {versionLinksLabel}
                </button>
              )}
              {focusModeEnabled && (
                <button className={styles.button} onClick={openFocusMode} aria-label={focusModeLabel}>
                  {focusModeLabel}
                </button>
              )}
              {activeNavigation && (
                <QuickNavigationTrigger className={styles.button} label={quickNavLabel} onClick={openQuickNavigation} />
              )}
              {showVersionSelector && (
                <VersionSelector
                  className={styles.select}
                  versions={data.availableVersions}
                  value={selectedVersionValue}
                  onChange={onVersionChange}
                  ariaLabel={versionLabel}
                />
              )}
              {isLanguageSelectVisible && (
                <LanguageSelector
                  className={styles.select}
                  languages={data.availableLanguages}
                  value={language}
                  onChange={onLanguageChange}
                  getLabel={(lang) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang)}
                  ariaLabel="Language selector"
                />
              )}

              {!hideThemeSelector && (
                <select
                  className={styles.select}
                  value={activeThemeId}
                  onChange={(event) => onThemeChange(event.target.value)}
                  aria-label="Theme selector"
                >
                  {data.layoutsConfig.layouts.map((layout) => (
                    <option key={layout.id} value={layout.id}>
                      {layout.name}
                    </option>
                  ))}
                </select>
              )}

              <ThemeModeToggle
                className={`${styles.button} ${styles.modeIconButton}`}
                isDarkMode={nextMode === "dark"}
                canToggle={canToggleMode}
                label={nextMode === "dark" ? darkModeLabel : lightModeLabel}
                onToggle={onToggleMode}
              />
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <article className={styles.card}>
            <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: markdownHtml }} />

            {linearNavigationEntries.length > 1 && (
              <div className={styles.footerActions}>
                <button className={styles.button} onClick={() => goToLinearNavigation(-1)} disabled={!canGoPrevious}>
                  {previousLabel}
                </button>
                <button className={styles.button} onClick={() => goToLinearNavigation(1)} disabled={!canGoNext}>
                  {nextLabel}
                </button>
              </div>
            )}
          </article>
        </main>
        {footerEnabled && <SiteFooter language={language} projectUrl={projectFooterUrl} />}
      </div>

      {menuOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setMenuOpen(false)}>
          <aside className={styles.mobileDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <strong>{data.config.site.name}</strong>
              <button
                className={`${styles.button} ${styles.mobileDrawerClose}`}
                onClick={() => setMenuOpen(false)}
                aria-label={menuCloseLabel}
                title={menuCloseLabel}
              >
                ✕
              </button>
            </div>

            <nav className={styles.mobileMenu}>
              {renderMenuTree(headerMenuTree, "mobile")}
            </nav>

            <div className={styles.mobileControls}>
              {fallbackProjectLink && (
                <a
                  href={fallbackProjectLink}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.button} ${styles.githubLinkButton}`}
                  aria-label={projectLabel}
                  title={projectLabel}
                >
                  {useReactProjectLinkIcon ? (
                    <ReactIconByTag tag={projectLinkReactIconTag} style={projectLinkReactIconStyle} />
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden className={styles.githubIcon}>
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.85 9.72.5.1.68-.22.68-.5 0-.24-.01-.9-.01-1.77-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.93.85.09-.67.35-1.12.64-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.88a9.3 9.3 0 0 1 2.5.35c1.9-1.33 2.74-1.05 2.74-1.05.54 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.94-2.33 4.8-4.56 5.06.36.31.68.92.68 1.86 0 1.35-.01 2.43-.01 2.76 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
                      />
                    </svg>
                  )}
                </a>
              )}
              {!!versionLinkOptionsWithLabels.length && (
                <button className={styles.button} onClick={openVersionLinksPopup} aria-label={versionLinksLabel}>
                  {versionLinksLabel}
                </button>
              )}
              {focusModeEnabled && (
                <button className={styles.button} onClick={openFocusMode} aria-label={focusModeLabel}>
                  {focusModeLabel}
                </button>
              )}

              {activeNavigation && (
                <QuickNavigationTrigger className={styles.button} label={quickNavLabel} onClick={openQuickNavigation} />
              )}

              {showVersionSelector && (
                <VersionSelector
                  className={styles.select}
                  versions={data.availableVersions}
                  value={selectedVersionValue}
                  onChange={onVersionChange}
                  ariaLabel={versionLabel}
                />
              )}

              {isLanguageSelectVisible && (
                <LanguageSelector
                  className={styles.select}
                  languages={data.availableLanguages}
                  value={language}
                  onChange={onLanguageChange}
                  getLabel={(lang) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang)}
                  ariaLabel="Language selector"
                />
              )}

              {!hideThemeSelector && (
                <select
                  className={styles.select}
                  value={activeThemeId}
                  onChange={(event) => onThemeChange(event.target.value)}
                  aria-label="Theme selector"
                >
                  {data.layoutsConfig.layouts.map((layout) => (
                    <option key={layout.id} value={layout.id}>
                      {layout.name}
                    </option>
                  ))}
                </select>
              )}

              <ThemeModeToggle
                className={`${styles.button} ${styles.modeIconButton}`}
                isDarkMode={nextMode === "dark"}
                canToggle={canToggleMode}
                label={nextMode === "dark" ? darkModeLabel : lightModeLabel}
                onToggle={onToggleMode}
              />
            </div>
          </aside>
        </div>
      )}

      {activeNavigation && quickNavOpen && (
        <div className={styles.quickNavOverlay} onClick={closeQuickNavigation}>
          <div className={styles.quickNavCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.quickNavHeader}>
              <span className={styles.quickNavHeaderTitle}>{quickNavPlaceholder}</span>
              <button
                className={`${styles.button} ${styles.quickNavCloseButton}`}
                onClick={closeQuickNavigation}
                aria-label={menuCloseLabel}
                title={menuCloseLabel}
              >
                <FiX aria-hidden />
              </button>
            </div>
            <input
              className={styles.quickNavInput}
              placeholder={quickNavPlaceholder}
              autoFocus
              value={quickNavQuery}
              onChange={(event) => {
                setQuickNavQuery(event.target.value);
                setQuickNavActiveIndex(0);
              }}
              onKeyDown={(event) => {
                if (!filteredQuickNavEntries.length) {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeQuickNavigation();
                  }
                  return;
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setQuickNavActiveIndex((prev) => Math.min(prev + 1, filteredQuickNavEntries.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setQuickNavActiveIndex((prev) => Math.max(prev - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const selectedEntry = filteredQuickNavEntries[quickNavActiveIndex];
                  if (selectedEntry) {
                    onMenuClick(selectedEntry.pathClick, selectedEntry.ancestorKeys);
                  }
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  closeQuickNavigation();
                }
              }}
            />
            <div className={styles.quickNavList} ref={quickNavListRef}>
              {filteredQuickNavEntries.map((entry, index) => (
                <button
                  key={`quick-${entry.key}`}
                  ref={(element) => {
                    quickNavItemRefs.current[index] = element;
                  }}
                  className={`${styles.menuButton} ${index === quickNavActiveIndex ? styles.quickNavItemActive : ""}`}
                  onClick={() => onMenuClick(entry.pathClick, entry.ancestorKeys)}
                  onMouseEnter={() => setQuickNavActiveIndex(index)}
                >
                  {entry.searchLabel}
                </button>
              ))}
              {!filteredQuickNavEntries.length && <p className={styles.repoInfo}>{noNavigationResults}</p>}
            </div>
            <div className={styles.quickNavFooter}>
              <span>↓ ↑ {navigateHintLabel}</span>
              <span>↵ {selectHintLabel}</span>
              <span>{escHintLabel} {closeHintLabel}</span>
            </div>
          </div>
        </div>
      )}

      {focusModeEnabled && focusModeOpen && (
        <div className={styles.focusModeOverlay} onClick={closeFocusMode}>
          <div className={styles.focusModeCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.focusModeHeader}>
              <strong>{focusModeLabel}</strong>
              <button
                className={`${styles.button} ${styles.focusModeCloseButton}`}
                onClick={closeFocusMode}
                aria-label={menuCloseLabel}
                title={menuCloseLabel}
              >
                <FiX aria-hidden />
              </button>
            </div>
            <div className={styles.focusModeBody}>
              <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: focusModeCurrentHtml }} />
            </div>
            <div className={styles.focusModeFooter}>
              <button className={styles.button} onClick={() => onFocusModeNavigate(-1)} disabled={!canFocusModeGoPrevious}>
                {previousLabel}
              </button>
              <button className={styles.button} onClick={() => onFocusModeNavigate(1)} disabled={!canFocusModeGoNext}>
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {versionLinksPopupOpen && !!versionLinkOptionsWithLabels.length && (
        <div className={styles.versionLinksOverlay} onClick={() => setVersionLinksPopupOpen(false)}>
          <div className={styles.versionLinksCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.versionLinksHeader}>
              <strong>{versionLinksLabel}</strong>
              <button
                className={`${styles.button} ${styles.versionLinksCloseButton}`}
                onClick={() => setVersionLinksPopupOpen(false)}
                aria-label={menuCloseLabel}
                title={menuCloseLabel}
              >
                <FiX aria-hidden />
              </button>
            </div>
            <div className={styles.versionLinksList}>
              {versionLinkOptionsWithLabels.map((option) => (
                <button
                  key={`version-link-${option.id}`}
                  className={styles.button}
                  onClick={() => {
                    openVersionLink(option.url);
                    setVersionLinksPopupOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
