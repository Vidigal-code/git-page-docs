"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { toDocsShellCssVars, type LoadedDocsData } from "@/entities/docs";
import { useDocsPreferences } from "./model/use-docs-preferences";
import { useDocsShellConfig } from "./model/use-docs-shell-config";
import { useDocsShellKeyboard } from "./model/use-docs-shell-keyboard";
import { useDocsShellLinearNav } from "./model/use-docs-shell-linear-nav";
import { useDocsShellState } from "./model/use-docs-shell-state";
import { useDocsShellFullscreen } from "./model/use-docs-shell-fullscreen";
import { useDocsShellUrl } from "./model/use-docs-shell-url";
import { useDocsShellVersionSync } from "./model/use-docs-shell-version-sync";
import { useDocsShellLabels } from "./model/use-docs-shell-labels";
import { useDocsShellUrlParams } from "./model/use-docs-shell-url-params";
import { getBreadcrumbTrail, getUrlParamsForPathClick } from "./model/menu-tree";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { useFocusMode } from "./model/use-focus-mode";
import { useNavMenuBlockPreference } from "@/features/nav-menu-block-preference";
import { useQuickNavigation } from "./model/use-quick-navigation";
import { useVersionRouting } from "./model/use-version-routing";
import { CollapsedNavRail } from "./ui/docs-shell-collapsed-rail";
import { DocsShellMainContent } from "./ui/docs-shell-main-content";
import { DocsShellOverlays } from "./ui/docs-shell-overlays";
import { DocsShellSidebar } from "./ui/docs-shell-sidebar";
import { DocsShellProvider } from "./model/docs-shell-context";
import styles from "./docs-shell.module.css";

export function DocsShell({ data }: { data: LoadedDocsData }) {
  const { getCurrentSearchParams, replaceUrlWithoutNavigation, pathname, router } = useDocsShellUrl();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const { languageStorageKey, versionStorageKey, themeModeStorageKey, themeLayoutStorageKey } = useDocsPreferences(
    data.config.site.name,
  );
  const { blockMenuOnNav, setBlockMenuOnNav } = useNavMenuBlockPreference(data.config.site.name);
  const isLanguageSelectVisible = data.availableLanguages.length > 1;

  const state = useDocsShellState(data, {
    languageStorageKey,
    themeModeStorageKey,
    themeLayoutStorageKey,
    blockMenuOnNav,
    searchParams,
    pathname,
    getCurrentSearchParams,
    replaceUrlWithoutNavigation,
  });

  const {
    menuOpen,
    setMenuOpen,
    sidebarOpen,
    setSidebarOpen,
    versionLinksPopupOpen,
    setVersionLinksPopupOpen,
    infoPopupOpen,
    setInfoPopupOpen,
    pageIndex,
    setPageIndex,
    onMenuClick: onMenuClickState,
    toggleNode,
    isNodeExpanded,
    expandAncestors,
    mdBrowseIndex,
    htmlBrowseIndex,
    videoBrowseIndex,
    audioBrowseIndex,
    setMdBrowseIndex,
    setHtmlBrowseIndex,
    setVideoBrowseIndex,
    setAudioBrowseIndex,
    mdItems,
    htmlItems,
    videoItems,
    audioItems,
    language,
    onLanguageChange,
    activeThemeId,
    activeLayout,
    nextMode,
    canToggleMode,
    onThemeChange,
    onToggleMode,
  } = state;

  const {
    urlFullscreenParams,
    onFullscreenRequest,
    closeUrlFullscreen,
    handleInlineFullscreenOpen,
    handleInlineFullscreenClose,
  } = useDocsShellFullscreen({
    data,
    language,
    pathname,
    getCurrentSearchParams,
    replaceUrlWithoutNavigation,
    setPageIndex,
    expandAncestors,
    routerReplace: router.replace,
  });

  const safePageIndex = pageIndex >= 0 && pageIndex < (data.pages?.length ?? data.docs.length) ? pageIndex : 0;
  const currentPage = data.pages?.[safePageIndex];
  const markdownHtml =
    currentPage?.md?.markdownByLanguage[language] ??
    data.docs?.[safePageIndex]?.markdownByLanguage[language] ??
    "<p>Document not found for this language.</p>";

  const {
    headerMenuTree,
    headerMenuEntries,
    linearNavigationEntries,
    currentLinearNavigationIndex,
    canGoPrevious,
    canGoNext,
  } = useDocsShellLinearNav(data, language, safePageIndex);

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

  const versionFromQuery = searchParams.get("version");
  const pathnameValue = pathname ?? "/";
  const isRemoteRepositorySession = data.activeRepository.source === "remote";
  const { selectedVersionValue, onVersionChange: onVersionChangeInternal } = useVersionRouting({
    pathname: pathnameValue,
    versionFromQuery,
    activeVersionId: data.activeVersionId,
    availableVersions: data.availableVersions,
    isLanguageSelectVisible,
    isRemoteRepositorySession,
    language,
    getCurrentSearchParams,
    routerReplace: router.replace,
  });

  const { headerIconConfig, controlsConfig, navMenuConfig, footerEnabled, footerConfig } = useDocsShellConfig(
    data,
    activeLayout,
    language,
    selectedVersionValue,
    activeThemeId,
    canToggleMode,
    nextMode === "dark",
    currentPage,
  );

  useDocsShellUrlParams(
    searchParams,
    data,
    language,
    pageIndex,
    setPageIndex,
    expandAncestors,
    undefined,
    onFullscreenRequest,
  );

  useDocsShellVersionSync({
    showVersionSelector: controlsConfig.showVersionSelector,
    isRemoteRepositorySession,
    pathname: pathnameValue,
    versionStorageKey,
    availableVersions: data.availableVersions,
    routerReplace: router.replace,
  });

  useDocsShellKeyboard({
    activeNavigation: controlsConfig.activeNavigation,
    quickNavOpen,
    focusModeOpen,
    setMenuOpen,
    setFocusModeOpen,
    setQuickNavOpen,
    setQuickNavQuery,
  });

  const onMenuClick = useCallback(
    (pathClick: string, ancestorKeys: string[] = [], options?: { fromLinearNav?: boolean; fromQuickNav?: boolean }) => {
      onMenuClickState(pathClick, ancestorKeys, options);
      setQuickNavOpen(false);
      setFocusModeOpen(false);
      setQuickNavQuery("");
      if (pathClick && typeof window !== "undefined") {
        const params = getUrlParamsForPathClick(data, pathClick, language, getCurrentSearchParams());
        replaceUrlWithoutNavigation(pathname ?? "/", params);
      }
    },
    [onMenuClickState, setQuickNavOpen, setFocusModeOpen, setQuickNavQuery, data, language, pathname, getCurrentSearchParams, replaceUrlWithoutNavigation],
  );

  const goToLinearNavigation = useCallback(
    (offset: -1 | 1) => {
      if (currentLinearNavigationIndex < 0) return;
      const targetEntry = linearNavigationEntries[currentLinearNavigationIndex + offset];
      if (!targetEntry) return;
      onMenuClick(targetEntry.pathClick, targetEntry.ancestorKeys, { fromLinearNav: true });
    },
    [currentLinearNavigationIndex, linearNavigationEntries, onMenuClick],
  );

  const onVersionChange = useCallback(
    (versionId: string) => {
      try {
        window.localStorage.setItem(versionStorageKey, versionId);
      } catch {
        // Ignore
      }
      onVersionChangeInternal(versionId);
    },
    [versionStorageKey, onVersionChangeInternal],
  );

  function openQuickNavigation() {
    setMenuOpen(false);
    setVersionLinksPopupOpen(false);
    setInfoPopupOpen(false);
    setFocusModeOpen(false);
    openQuickNavigationInternal();
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageIndex]);

  const activeTheme = data.themes[activeLayout?.id];
  const cssVars = useMemo(
    () => toDocsShellCssVars(activeTheme, data.config.site),
    [activeTheme, data.config.site],
  );
  const labels = useDocsShellLabels(data, language);

  const {
    iconImage,
    headerName,
    useReactIcon: useReactHeaderIcon,
    reactIconTag: reactHeaderIconTag,
    reactIconStyle: headerReactIconStyle,
    iconImgWidth: iconImageMenuHeaderImgWidth,
    iconImgHeight: iconImageMenuHeaderImgHeight,
  } = headerIconConfig;

  const routeGuideEnabled = Boolean(data.config.site.RouteGuide);
  const currentPagePath =
    currentPage?.md?.config?.path?.[language as keyof typeof currentPage.md.config.path] ??
    currentPage?.html?.config?.path?.[language] ??
    (currentPage?.html?.config?.url
      ? `url:${currentPage.html.config.url[language] ?? currentPage.html.config.url.en}`
      : null) ??
    (currentPage?.video ? `page:${currentPage.id}` : null) ??
    (currentPage?.audio ? `page:${currentPage.id}` : null) ??
    "";
  const breadcrumbTrail = useMemo(
    () => (routeGuideEnabled && currentPagePath ? getBreadcrumbTrail(headerMenuTree, currentPagePath) : []),
    [routeGuideEnabled, currentPagePath, headerMenuTree],
  );
  const homePathClick = linearNavigationEntries[0]?.pathClick;
  const homeAncestorKeys = linearNavigationEntries[0]?.ancestorKeys ?? [];
  const routeGuideIconConfig = useMemo(
    () => resolveRouteGuideIconConfig(data.config.site, nextMode === "dark", getBasePath()),
    [data.config.site, nextMode],
  );

  const contextValue = {
    data,
    language,
    currentPage,
    labels,
    routeGuideConfig: { enabled: routeGuideEnabled },
  };

  const controlsProps = {
    ...controlsConfig,
    themeVarsStyle: cssVars,
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
    <DocsShellProvider value={contextValue}>
      <div className={`${styles.wrapper} ${!sidebarOpen ? styles.wrapperCollapsed : ""}`} style={cssVars}>
      <DocsShellSidebar
        siteName={headerName}
        useReactHeaderIcon={useReactHeaderIcon}
        reactHeaderIconTag={reactHeaderIconTag}
        headerReactIconStyle={headerReactIconStyle}
        activeLayoutMode={activeLayout?.mode as "light" | "dark" | undefined}
        iconImage={iconImage}
        iconImgWidth={iconImageMenuHeaderImgWidth}
        iconImgHeight={iconImageMenuHeaderImgHeight}
        menuNodes={headerMenuTree}
        menuCloseLabel={labels.menuCloseLabel}
        onMenuClick={onMenuClick}
        onToggleNode={toggleNode}
        isNodeExpanded={isNodeExpanded}
        onCollapseSidebar={() => setSidebarOpen(false)}
        blockMenuOnNav={blockMenuOnNav}
        setBlockMenuOnNav={setBlockMenuOnNav}
        navMenuConfig={navMenuConfig}
      />

      {!sidebarOpen && (
        <CollapsedNavRail
          menuOpenLabel={labels.menuOpenLabel}
          onExpand={() => setSidebarOpen(true)}
          blockMenuOnNav={blockMenuOnNav}
          setBlockMenuOnNav={setBlockMenuOnNav}
          navMenuConfig={navMenuConfig}
        />
      )}

      <DocsShellMainContent
        headerName={headerName}
        iconImage={iconImage}
        useReactHeaderIcon={useReactHeaderIcon}
        reactHeaderIconTag={reactHeaderIconTag}
        headerReactIconStyle={headerReactIconStyle}
        iconImgWidth={iconImageMenuHeaderImgWidth}
        iconImgHeight={iconImageMenuHeaderImgHeight}
        menuOpen={menuOpen}
        menuOpenLabel={labels.menuOpenLabel}
        menuCloseLabel={labels.menuCloseLabel}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        activeLayoutMode={activeLayout?.mode as "light" | "dark" | undefined}
        controlsProps={controlsProps}
        navMenuConfig={navMenuConfig}
        currentPage={currentPage}
        data={data}
        language={language}
        nextMode={nextMode}
        previousLabel={labels.previousLabel}
        nextLabel={labels.nextLabel}
        browsePrevLabel={labels.browsePrevLabel}
        browseNextLabel={labels.browseNextLabel}
        fullscreenExpandLabel={labels.fullscreenExpandLabel}
        mdBrowseIndex={mdBrowseIndex}
        htmlBrowseIndex={htmlBrowseIndex}
        videoBrowseIndex={videoBrowseIndex}
        audioBrowseIndex={audioBrowseIndex}
        setMdBrowseIndex={setMdBrowseIndex}
        setHtmlBrowseIndex={setHtmlBrowseIndex}
        setVideoBrowseIndex={setVideoBrowseIndex}
        setAudioBrowseIndex={setAudioBrowseIndex}
        mdItems={mdItems}
        htmlItems={htmlItems}
        videoItems={videoItems}
        audioItems={audioItems}
        routeGuideEnabled={routeGuideEnabled}
        breadcrumbTrail={breadcrumbTrail}
        onMenuClick={onMenuClick}
        homePathClick={homePathClick}
        homeAncestorKeys={homeAncestorKeys}
        routeGuideIconConfig={routeGuideIconConfig}
        onFullscreenOpen={handleInlineFullscreenOpen}
        onFullscreenClose={handleInlineFullscreenClose}
        linearNavigationEntries={linearNavigationEntries}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        goToLinearNavigation={goToLinearNavigation}
        footerEnabled={footerEnabled}
        footerConfig={footerConfig}
      />

      <DocsShellOverlays
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        headerName={headerName}
        headerMenuTree={headerMenuTree}
        menuCloseLabel={labels.menuCloseLabel}
        onMenuClick={onMenuClick}
        toggleNode={toggleNode}
        isNodeExpanded={isNodeExpanded}
        controlsProps={controlsProps}
        navMenuConfig={navMenuConfig}
        controlsConfig={{
          activeNavigation: controlsConfig.activeNavigation,
          focusModeEnabled: controlsConfig.focusModeEnabled,
          focusModeLabel: controlsConfig.focusModeLabel,
          versionLinksLabel: controlsConfig.versionLinksLabel,
          versionLinkOptionsWithLabels: controlsConfig.versionLinkOptionsWithLabels,
          lastUpdateLabel: controlsConfig.lastUpdateLabel,
          updateDate: controlsConfig.updateDate,
        }}
        versionLinksPopupOpen={versionLinksPopupOpen}
        setVersionLinksPopupOpen={setVersionLinksPopupOpen}
        infoPopupOpen={infoPopupOpen}
        setInfoPopupOpen={setInfoPopupOpen}
        quickNavOpen={quickNavOpen}
        quickNavPlaceholder={labels.quickNavPlaceholder}
        quickNavQuery={quickNavQuery}
        filteredQuickNavEntries={filteredQuickNavEntries}
        quickNavActiveIndex={quickNavActiveIndex}
        navigateHintLabel={labels.navigateHintLabel}
        selectHintLabel={labels.selectHintLabel}
        escHintLabel={labels.escHintLabel}
        closeHintLabel={labels.closeHintLabel}
        noNavigationResults={labels.noNavigationResults}
        quickNavListRef={quickNavListRef}
        quickNavItemRefs={quickNavItemRefs}
        closeQuickNavigation={closeQuickNavigationInternal}
        setQuickNavQuery={setQuickNavQuery}
        setQuickNavActiveIndex={setQuickNavActiveIndex}
        focusModeOpen={focusModeOpen}
        focusModeLabel={controlsConfig.focusModeLabel}
        previousLabel={labels.previousLabel}
        nextLabel={labels.nextLabel}
        focusModeCurrentHtml={focusModeCurrentHtml}
        canFocusModeGoPrevious={canFocusModeGoPrevious}
        canFocusModeGoNext={canFocusModeGoNext}
        closeFocusMode={closeFocusModeInternal}
        onFocusModeNavigate={onFocusModeNavigateInternal}
        versionLinksLabel={controlsConfig.versionLinksLabel}
        versionLinkOptionsWithLabels={controlsConfig.versionLinkOptionsWithLabels}
        lastUpdateLabel={controlsConfig.lastUpdateLabel}
        updateDate={controlsConfig.updateDate}
        urlFullscreenParams={urlFullscreenParams}
        data={data}
        language={language}
        mdBrowseIndex={mdBrowseIndex}
        htmlBrowseIndex={htmlBrowseIndex}
        videoBrowseIndex={videoBrowseIndex}
        audioBrowseIndex={audioBrowseIndex}
        setMdBrowseIndex={setMdBrowseIndex}
        setHtmlBrowseIndex={setHtmlBrowseIndex}
        setVideoBrowseIndex={setVideoBrowseIndex}
        setAudioBrowseIndex={setAudioBrowseIndex}
        mdItems={mdItems}
        htmlItems={htmlItems}
        videoItems={videoItems}
        audioItems={audioItems}
        routeGuideEnabled={routeGuideEnabled}
        breadcrumbTrail={breadcrumbTrail}
        homePathClick={homePathClick}
        homeAncestorKeys={homeAncestorKeys}
        routeGuideIconConfig={routeGuideIconConfig}
        nextMode={nextMode}
        browsePrevLabel={labels.browsePrevLabel}
        browseNextLabel={labels.browseNextLabel}
        fullscreenExpandLabel={labels.fullscreenExpandLabel}
        closeUrlFullscreen={closeUrlFullscreen}
      />
    </div>
    </DocsShellProvider>
  );
}
