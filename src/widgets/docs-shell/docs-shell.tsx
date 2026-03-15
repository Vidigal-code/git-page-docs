"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";
import { toDocsShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { SiteFooter } from "@/shared/ui/site-footer";
import { useDocsPreferences } from "./model/use-docs-preferences";
import { useDocsShellLanguageState } from "./model/use-docs-shell-language-state";
import { useDocsShellNavigationState } from "./model/use-docs-shell-navigation-state";
import { useDocsShellThemeState } from "./model/use-docs-shell-theme-state";
import { useFocusMode } from "./model/use-focus-mode";
import { buildHeaderMenuTree, flattenMenuTree, getRouteIndexByPath } from "./model/menu-tree";
import { useQuickNavigation } from "./model/use-quick-navigation";
import { useVersionRouting } from "./model/use-version-routing";
import { DocsShellControls } from "./ui/docs-shell-controls";
import { DocsShellFocusOverlay } from "./ui/docs-shell-focus-overlay";
import { DocsShellMobileDrawer } from "./ui/docs-shell-mobile-drawer";
import { DocsShellQuickNavOverlay } from "./ui/docs-shell-quick-nav-overlay";
import { DocsShellSidebar } from "./ui/docs-shell-sidebar";
import { DocsShellVersionLinksOverlay } from "./ui/docs-shell-version-links-overlay";
import styles from "./docs-shell.module.css";

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

export function DocsShell({ data }: { data: LoadedDocsData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultLanguage = data.config.site.defaultLanguage;
  const { languageStorageKey, versionStorageKey, themeModeStorageKey, themeLayoutStorageKey } = useDocsPreferences(data.config.site.name);
  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [versionLinksPopupOpen, setVersionLinksPopupOpen] = useState(false);
  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;
  const languageCount = data.availableLanguages.length;
  const isLanguageSelectVisible = languageCount > 1;

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

  const { language, onLanguageChange } = useDocsShellLanguageState({
    defaultLanguage,
    availableLanguages: data.availableLanguages,
    languageStorageKey,
    searchParams,
    pathname,
    getCurrentSearchParams,
    replaceUrlWithoutNavigation,
  });
  const {
    activeThemeId,
    activeLayout,
    nextMode,
    canToggleMode,
    onThemeChange,
    onToggleMode,
  } = useDocsShellThemeState({
    layouts: data.layoutsConfig.layouts,
    configuredDefaultMode,
    initialThemeBaseId,
    searchParams,
    themeModeStorageKey,
    themeLayoutStorageKey,
    pathname,
    getCurrentSearchParams,
    replaceUrlWithoutNavigation,
  });
  const {
    routeIndex,
    onMenuClick: onMenuClickState,
    toggleNode,
    isNodeExpanded,
  } = useDocsShellNavigationState({
    data,
    language,
    setSidebarOpen,
    setMenuOpen,
  });
  const safeRouteIndex = routeIndex >= 0 && routeIndex < data.docs.length ? routeIndex : 0;
  const currentDoc = data.docs[safeRouteIndex];
  const markdownHtml = currentDoc?.markdownByLanguage[language] ?? "<p>Document not found for this language.</p>";
  const activeTheme = data.themes[activeLayout?.id];
  const hideThemeSelector = data.config.site.HideThemeSelector;
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
    focusModeCurrentHtml,
    canFocusModeGoPrevious,
    canFocusModeGoNext,
    openFocusMode: openFocusModeInternal,
    closeFocusMode: closeFocusModeInternal,
    onFocusModeNavigate: onFocusModeNavigateInternal,
  } = useFocusMode(markdownHtml);
  const { selectedVersionValue, onVersionChange: onVersionChangeInternal } = useVersionRouting({
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

  function onMenuClick(pathClick: string, ancestorKeys: string[] = []) {
    onMenuClickState(pathClick, ancestorKeys);
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

  const controlsProps = {
    fallbackProjectLink,
    projectLabel,
    useReactProjectLinkIcon,
    projectLinkReactIconTag,
    projectLinkReactIconStyle,
    versionLinkOptionsWithLabels,
    versionLinksLabel,
    focusModeEnabled,
    focusModeLabel,
    activeNavigation,
    quickNavLabel,
    showVersionSelector,
    availableVersions: data.availableVersions,
    selectedVersionValue,
    versionLabel,
    isLanguageSelectVisible,
    availableLanguages: data.availableLanguages,
    language,
    languageLabelResolver: (lang: string) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang),
    hideThemeSelector,
    activeThemeId,
    layouts: data.layoutsConfig.layouts,
    canToggleMode,
    nextModeIsDark: nextMode === "dark",
    darkModeLabel,
    lightModeLabel,
    onOpenVersionLinksPopup: openVersionLinksPopup,
    onOpenFocusMode: openFocusMode,
    onOpenQuickNavigation: openQuickNavigation,
    onVersionChange,
    onLanguageChange,
    onThemeChange,
    onToggleMode,
  };

  return (
    <div className={`${styles.wrapper} ${!sidebarOpen ? styles.wrapperCollapsed : ""}`} style={cssVars}>
      <DocsShellSidebar
        siteName={data.config.site.name}
        useReactHeaderIcon={useReactHeaderIcon}
        reactHeaderIconTag={reactHeaderIconTag}
        headerReactIconStyle={headerReactIconStyle}
        activeLayoutMode={activeLayout?.mode}
        iconImage={iconImage}
        menuNodes={headerMenuTree}
        menuCloseLabel={menuCloseLabel}
        onMenuClick={onMenuClick}
        onToggleNode={toggleNode}
        isNodeExpanded={isNodeExpanded}
        onCollapseSidebar={() => setSidebarOpen(false)}
      />

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
              <DocsShellControls {...controlsProps} />
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

      <DocsShellMobileDrawer
        isOpen={menuOpen}
        siteName={data.config.site.name}
        menuNodes={headerMenuTree}
        menuCloseLabel={menuCloseLabel}
        onClose={() => setMenuOpen(false)}
        onMenuClick={onMenuClick}
        onToggleNode={toggleNode}
        isNodeExpanded={isNodeExpanded}
        controls={controlsProps}
      />

      <DocsShellQuickNavOverlay
        isOpen={activeNavigation && quickNavOpen}
        quickNavPlaceholder={quickNavPlaceholder}
        menuCloseLabel={menuCloseLabel}
        quickNavQuery={quickNavQuery}
        filteredQuickNavEntries={filteredQuickNavEntries}
        quickNavActiveIndex={quickNavActiveIndex}
        navigateHintLabel={navigateHintLabel}
        selectHintLabel={selectHintLabel}
        escHintLabel={escHintLabel}
        closeHintLabel={closeHintLabel}
        noNavigationResults={noNavigationResults}
        quickNavListRef={quickNavListRef}
        quickNavItemRefs={quickNavItemRefs}
        onClose={closeQuickNavigation}
        onQueryChange={setQuickNavQuery}
        onActiveIndexChange={setQuickNavActiveIndex}
        onMenuClick={onMenuClick}
      />

      <DocsShellFocusOverlay
        isOpen={focusModeEnabled && focusModeOpen}
        focusModeLabel={focusModeLabel}
        menuCloseLabel={menuCloseLabel}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        focusModeCurrentHtml={focusModeCurrentHtml}
        canFocusModeGoPrevious={canFocusModeGoPrevious}
        canFocusModeGoNext={canFocusModeGoNext}
        onClose={closeFocusMode}
        onNavigate={onFocusModeNavigate}
      />

      <DocsShellVersionLinksOverlay
        isOpen={versionLinksPopupOpen}
        versionLinksLabel={versionLinksLabel}
        menuCloseLabel={menuCloseLabel}
        options={versionLinkOptionsWithLabels}
        onClose={() => setVersionLinksPopupOpen(false)}
        onOpenVersionLink={openVersionLink}
      />
    </div>
  );
}
