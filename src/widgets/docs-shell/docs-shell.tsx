"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";
import { toDocsShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { SiteFooter } from "@/shared/ui/site-footer";
import { useDocsPreferences } from "./model/use-docs-preferences";
import { useDocsShellConfig } from "./model/use-docs-shell-config";
import { useDocsShellLanguageState } from "./model/use-docs-shell-language-state";
import { useDocsShellNavigationState } from "./model/use-docs-shell-navigation-state";
import { useDocsShellThemeState } from "./model/use-docs-shell-theme-state";
import { useFocusMode } from "./model/use-focus-mode";
import { buildHeaderMenuTree, flattenMenuTree, getRouteIndexByPath } from "./model/menu-tree";
import { useQuickNavigation } from "./model/use-quick-navigation";
import { useVersionRouting } from "./model/use-version-routing";
import { DocsShellControls } from "./ui/docs-shell-controls";
import { DocsShellHeader } from "./ui/docs-shell-header";
import { DocsShellFocusOverlay } from "./ui/docs-shell-focus-overlay";
import { DocsShellMobileDrawer } from "./ui/docs-shell-mobile-drawer";
import { DocsShellQuickNavOverlay } from "./ui/docs-shell-quick-nav-overlay";
import { DocsShellSidebar } from "./ui/docs-shell-sidebar";
import { DocsShellInfoOverlay } from "./ui/docs-shell-info-overlay";
import { DocsShellVersionLinksOverlay } from "./ui/docs-shell-version-links-overlay";
import styles from "./docs-shell.module.css";

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
  const [infoPopupOpen, setInfoPopupOpen] = useState(false);
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
  const quickNavPlaceholder = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "typeToNavigate", "Type to navigate...");
  const noNavigationResults = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "noNavigationResults", "No navigation results.");
  const navigateHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "navigateHint", "Navigate");
  const selectHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "selectHint", "Select");
  const escHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "escHint", "ESC");
  const closeHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "closeHint", menuCloseLabel);
  const isRemoteRepositorySession = data.activeRepository.source === "remote";
  const versionFromQuery = searchParams.get("version");

  const headerMenuTree = useMemo(
    () => buildHeaderMenuTree(data.config["menus-header"] ?? [], data, language, safeRouteIndex),
    [data, language, safeRouteIndex],
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

  const { headerIconConfig, controlsConfig, footerEnabled } = useDocsShellConfig(
    data,
    activeLayout,
    language,
    selectedVersionValue,
    activeThemeId,
    canToggleMode,
    nextMode === "dark",
  );
  const {
    iconImage,
    headerName,
    useReactIcon: useReactHeaderIcon,
    reactIconTag: reactHeaderIconTag,
    reactIconStyle: headerReactIconStyle,
    iconImgWidth: iconImageMenuHeaderImgWidth,
    iconImgHeight: iconImageMenuHeaderImgHeight,
  } = headerIconConfig;

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
    setInfoPopupOpen(false);
    setFocusModeOpen(false);
    openQuickNavigationInternal();
  }

  function closeQuickNavigation() {
    closeQuickNavigationInternal();
  }

  useEffect(() => {
    if (!controlsConfig.activeNavigation) {
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
  }, [controlsConfig.activeNavigation, quickNavOpen, focusModeOpen, setFocusModeOpen, setQuickNavOpen, setQuickNavQuery]);

  useEffect(() => {
    if (!controlsConfig.showVersionSelector) return;
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
        const currentPathname = typeof window !== "undefined" ? window.location.pathname : pathname;
        const basePath = currentPathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
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
      const currentPathname = typeof window !== "undefined" ? window.location.pathname : pathname;
      const base = currentPathname.replace(/\/$/, "");
      const target = `${base}/v/${urlVersion}`;
      const qs = params.toString();
      router.replace(qs ? `${target}?${qs}` : target);
      return;
    }
    try {
      const savedVersion = window.localStorage.getItem(versionStorageKey);
      if (savedVersion && data.availableVersions.some((v) => v.id === savedVersion) && !hasVersionInPath) {
        const currentPathname = typeof window !== "undefined" ? window.location.pathname : pathname;
        const base = currentPathname.replace(/\/v\/[^/]+\/?$/, "").replace(/\/$/, "");
        const target = buildVersionPath(base || currentPathname, savedVersion);
        const qs = params.toString();
        router.replace(qs ? `${target}?${qs}` : target);
      }
    } catch {
      // Ignore localStorage errors (private mode / blocked storage).
    }
  }, [controlsConfig.showVersionSelector, isRemoteRepositorySession, searchParams, versionStorageKey, data.availableVersions, data.availableLanguages, pathname, router]);

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
    setInfoPopupOpen(false);
    setVersionLinksPopupOpen(true);
  }

  function openInfoPopup() {
    setMenuOpen(false);
    setQuickNavOpen(false);
    setFocusModeOpen(false);
    setVersionLinksPopupOpen(false);
    setInfoPopupOpen(true);
  }

  function openFocusMode() {
    setMenuOpen(false);
    setQuickNavOpen(false);
    setVersionLinksPopupOpen(false);
    setInfoPopupOpen(false);
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
    ...controlsConfig,
    onOpenVersionLinksPopup: openVersionLinksPopup,
    onOpenInfoPopup: openInfoPopup,
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
        siteName={headerName}
        useReactHeaderIcon={useReactHeaderIcon}
        reactHeaderIconTag={reactHeaderIconTag}
        headerReactIconStyle={headerReactIconStyle}
        activeLayoutMode={activeLayout?.mode}
        iconImage={iconImage}
        iconImgWidth={iconImageMenuHeaderImgWidth}
        iconImgHeight={iconImageMenuHeaderImgHeight}
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
        <DocsShellHeader
          headerName={headerName}
          iconImage={iconImage}
          useReactHeaderIcon={useReactHeaderIcon}
          reactHeaderIconTag={reactHeaderIconTag}
          headerReactIconStyle={headerReactIconStyle}
          iconImgWidth={iconImageMenuHeaderImgWidth}
          iconImgHeight={iconImageMenuHeaderImgHeight}
          menuOpen={menuOpen}
          menuOpenLabel={menuOpenLabel}
          menuCloseLabel={menuCloseLabel}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          activeLayoutMode={activeLayout?.mode}
          controls={<DocsShellControls {...controlsProps} />}
        />

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
        {footerEnabled && <SiteFooter language={language} projectUrl={PROJECT_FOOTER_URL} />}
      </div>

      <DocsShellMobileDrawer
        isOpen={menuOpen}
        siteName={headerName}
        menuNodes={headerMenuTree}
        menuCloseLabel={menuCloseLabel}
        onClose={() => setMenuOpen(false)}
        onMenuClick={onMenuClick}
        onToggleNode={toggleNode}
        isNodeExpanded={isNodeExpanded}
        controls={controlsProps}
      />

      <DocsShellQuickNavOverlay
        isOpen={controlsConfig.activeNavigation && quickNavOpen}
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
        isOpen={controlsConfig.focusModeEnabled && focusModeOpen}
        focusModeLabel={controlsConfig.focusModeLabel}
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
        versionLinksLabel={controlsConfig.versionLinksLabel}
        menuCloseLabel={menuCloseLabel}
        options={controlsConfig.versionLinkOptionsWithLabels}
        onClose={() => setVersionLinksPopupOpen(false)}
        onOpenVersionLink={openVersionLink}
      />

      <DocsShellInfoOverlay
        isOpen={infoPopupOpen}
        lastUpdateLabel={controlsConfig.lastUpdateLabel}
        updateDate={controlsConfig.updateDate}
        menuCloseLabel={menuCloseLabel}
        onClose={() => setInfoPopupOpen(false)}
      />
    </div>
  );
}
