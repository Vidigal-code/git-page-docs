"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import { toDocsShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { VersionLinkOption } from "@/entities/docs/lib/version-links";
import type { LoadedDocsData, LoadedPage } from "@/entities/docs/model/types";
import type { BreadcrumbItem, MenuNode } from "@/entities/docs/model/menu";
import { SiteFooter, type FooterConfig } from "@/shared/ui/site-footer";
import { useDocsPreferences } from "./model/use-docs-preferences";
import { useDocsShellConfig } from "./model/use-docs-shell-config";
import { useDocsShellKeyboard } from "./model/use-docs-shell-keyboard";
import { useDocsShellLinearNav } from "./model/use-docs-shell-linear-nav";
import { useDocsShellPopups } from "./model/use-docs-shell-popups";
import { useDocsShellThemeState } from "./model/use-docs-shell-theme-state";
import { useDocsShellUrl } from "./model/use-docs-shell-url";
import { useDocsShellVersionSync } from "./model/use-docs-shell-version-sync";
import { useDocsShellLanguageState } from "./model/use-docs-shell-language-state";
import { useDocsShellNavigationState } from "./model/use-docs-shell-navigation-state";
import { useDocsShellUrlParams } from "./model/use-docs-shell-url-params";
import type { MenuEntry } from "./model/menu-tree";
import { buildUnifiedHeaderMenuTree, getBreadcrumbTrail, getPageIndexByPathClick, getUrlParamsForPathClick } from "./model/menu-tree";
import { getBasePath, toFullPath } from "@/shared/lib/base-path";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { useFocusMode } from "./model/use-focus-mode";
import { useNavMenuBlockPreference, NavMenuBlockToggle } from "@/features/nav-menu-block-preference";
import { useQuickNavigation } from "./model/use-quick-navigation";
import { useVersionRouting } from "./model/use-version-routing";
import { DocsShellControls, type DocsShellControlsProps } from "./ui/docs-shell-controls";
import { DocsShellFocusOverlay } from "./ui/docs-shell-focus-overlay";
import { DocsShellHeader } from "./ui/docs-shell-header";
import { DocsShellInfoOverlay } from "./ui/docs-shell-info-overlay";
import { DocsShellMobileDrawer } from "./ui/docs-shell-mobile-drawer";
import { DocsShellQuickNavOverlay } from "./ui/docs-shell-quick-nav-overlay";
import { DocsShellSidebar } from "./ui/docs-shell-sidebar";
import { DocsShellVersionLinksOverlay } from "./ui/docs-shell-version-links-overlay";
import { DocsShellUrlFullscreenOverlay } from "./ui/docs-shell-url-fullscreen-overlay";
import { PageContentArea } from "./ui/page-content-area";
import type { FullscreenParams } from "./model/use-docs-shell-url-params";
import styles from "./docs-shell.module.css";

export function DocsShell({ data }: { data: LoadedDocsData }) {
  const { getCurrentSearchParams, replaceUrlWithoutNavigation, pathname, router } = useDocsShellUrl();

  const replaceUrlParams = useCallback(
    (params: URLSearchParams) => {
      if (typeof window !== "undefined") {
        const appPath = pathname ?? "/";
        const qs = params.toString();
        const nextUrl = qs ? `${toFullPath(appPath)}?${qs}` : toFullPath(appPath);
        window.history.replaceState({}, "", nextUrl);
      }
    },
    [pathname],
  );
  const searchParams = useSearchParams();
  const {
    menuOpen,
    setMenuOpen,
    sidebarOpen,
    setSidebarOpen,
    versionLinksPopupOpen,
    setVersionLinksPopupOpen,
    infoPopupOpen,
    setInfoPopupOpen,
  } = useDocsShellPopups();

  const { languageStorageKey, versionStorageKey, themeModeStorageKey, themeLayoutStorageKey } = useDocsPreferences(
    data.config.site.name,
  );
  const { blockMenuOnNav, setBlockMenuOnNav } = useNavMenuBlockPreference(data.config.site.name);
  const defaultLanguage = data.config.site.defaultLanguage;
  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;
  const isLanguageSelectVisible = data.availableLanguages.length > 1;

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
  } = useDocsShellNavigationState({
    data,
    language,
    setSidebarOpen,
    setMenuOpen,
    blockSidebarOpenOnNav: blockMenuOnNav,
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

  const [urlFullscreenParams, setUrlFullscreenParams] = useState<FullscreenParams | null>(null);
  const skipUrlFullscreenFromInlineRef = useRef(false);

  const onFullscreenRequest = useCallback(
    (params: FullscreenParams) => {
      if (skipUrlFullscreenFromInlineRef.current) {
        return;
      }
      let pathClick: string | null = null;
      const lang = params.lang ?? language;
      if (params.type === "md" && params.file) {
        pathClick = params.file;
      } else if (params.type === "html" && params.file) {
        pathClick = params.file;
      } else if (params.type === "video" && params.id != null) {
        pathClick = `page:${params.id}`;
      } else if (params.type === "video" && params.slug) {
        const entry = Object.entries(data.pathToPageMap ?? {}).find(
          ([k, v]) => v.contentType === "video" && k.toLowerCase().includes(params.slug!.toLowerCase()),
        );
        pathClick = entry?.[0] ?? null;
      } else if (params.type === "audio" && params.id != null) {
        pathClick = `page:${params.id}`;
      } else if (params.type === "audio" && params.slug) {
        const entry = Object.entries(data.pathToPageMap ?? {}).find(
          ([k, v]) => v.contentType === "audio" && k.toLowerCase().includes(params.slug!.toLowerCase()),
        );
        pathClick = entry?.[0] ?? null;
      }
      if (pathClick) {
        const pageIdx = getPageIndexByPathClick(data, pathClick);
        if (pageIdx >= 0) {
          const tree = buildUnifiedHeaderMenuTree(data, lang, pageIdx);
          const trail = getBreadcrumbTrail(tree, pathClick);
          const ancestorKeys = trail.length > 0 ? trail[trail.length - 1].ancestorKeys : [];
          setPageIndex(pageIdx);
          expandAncestors(ancestorKeys);
        }
      }
      setUrlFullscreenParams(params);
    },
    [data, language, setPageIndex, expandAncestors],
  );

  const closeUrlFullscreen = useCallback(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.delete("mdfull");
    params.delete("htmlfull");
    params.delete("videofull");
    params.delete("audiofull");
    params.delete("file");
    params.delete("slug");
    params.delete("id");
    const qs = params.toString();
    const appPath = pathname ?? "/";
    if (typeof window !== "undefined") {
      const fullUrl = qs ? `${toFullPath(appPath)}?${qs}` : toFullPath(appPath);
      window.history.replaceState({}, "", fullUrl);
    } else {
      router.replace(qs ? `${appPath}?${qs}` : appPath);
    }
    setUrlFullscreenParams(null);
  }, [pathname, router]);

  const handleInlineFullscreenOpen = useCallback(
    (params: FullscreenParams) => {
      skipUrlFullscreenFromInlineRef.current = true;
      const current = getCurrentSearchParams();
      if (params.type === "md" && params.file) {
        current.set("mdfull", params.lang);
        current.set("file", params.file);
      } else if (params.type === "html" && params.file) {
        current.set("htmlfull", params.lang);
        current.set("file", params.file);
      } else if (params.type === "video") {
        current.set("videofull", params.lang);
        if (params.id != null) current.set("id", String(params.id));
        if (params.slug) current.set("slug", params.slug);
      } else if (params.type === "audio") {
        current.set("audiofull", params.lang);
        if (params.id != null) current.set("id", String(params.id));
        if (params.slug) current.set("slug", params.slug);
      }
      replaceUrlWithoutNavigation(pathname ?? "/", current);
    },
    [getCurrentSearchParams, replaceUrlWithoutNavigation, pathname],
  );

  const handleInlineFullscreenClose = useCallback(() => {
    skipUrlFullscreenFromInlineRef.current = false;
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const hadVideoFullscreen = params.has("videofull");
    const hadAudioFullscreen = params.has("audiofull");
    params.delete("mdfull");
    params.delete("htmlfull");
    params.delete("videofull");
    params.delete("audiofull");
    params.delete("file");
    params.delete("slug");
    if (hadVideoFullscreen || hadAudioFullscreen) {
      params.delete("id");
    }
    replaceUrlWithoutNavigation(pathname ?? "/", params);
    setUrlFullscreenParams(null);
  }, [pathname, replaceUrlWithoutNavigation]);

  const versionFromQuery = searchParams.get("version");
  const isRemoteRepositorySession = data.activeRepository.source === "remote";
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
    pathname,
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
    (pathClick: string, ancestorKeys: string[] = [], options?: { fromLinearNav?: boolean }) => {
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
  const previousLabel = resolveTranslation(data.config.translations?.navigation?.previous, language, "Previous");
  const nextLabel = resolveTranslation(data.config.translations?.navigation?.next, language, "Next");
  const browsePrevLabel = resolveTranslation(
    data.config.translations?.navigation?.browsePrev,
    language,
    previousLabel,
  );
  const browseNextLabel = resolveTranslation(data.config.translations?.navigation?.browseNext, language, nextLabel);
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
  const quickNavPlaceholder = getLangMenuLabelFromMenu(
    data.config.site.langmenu,
    language,
    "typeToNavigate",
    "Type to navigate...",
  );
  const noNavigationResults = getLangMenuLabelFromMenu(
    data.config.site.langmenu,
    language,
    "noNavigationResults",
    "No navigation results.",
  );
  const navigateHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "navigateHint", "Navigate");
  const selectHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "selectHint", "Select");
  const escHintLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "escHint", "ESC");
  const closeHintLabel = getLangMenuLabelFromMenu(
    data.config.site.langmenu,
    language,
    "closeHint",
    menuCloseLabel,
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
        activeLayoutMode={activeLayout?.mode as "light" | "dark" | undefined}
        iconImage={iconImage}
        iconImgWidth={iconImageMenuHeaderImgWidth}
        iconImgHeight={iconImageMenuHeaderImgHeight}
        menuNodes={headerMenuTree}
        menuCloseLabel={menuCloseLabel}
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
          menuOpenLabel={menuOpenLabel}
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
        menuOpenLabel={menuOpenLabel}
        menuCloseLabel={menuCloseLabel}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        activeLayoutMode={activeLayout?.mode as "light" | "dark" | undefined}
        controlsProps={controlsProps}
        navMenuConfig={navMenuConfig}
        currentPage={currentPage}
        data={data}
        language={language}
        nextMode={nextMode}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        browsePrevLabel={browsePrevLabel}
        browseNextLabel={browseNextLabel}
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
        menuCloseLabel={menuCloseLabel}
        onMenuClick={onMenuClick}
        toggleNode={toggleNode}
        isNodeExpanded={isNodeExpanded}
        controlsProps={controlsProps}
        navMenuConfig={navMenuConfig}
        controlsConfig={controlsConfig}
        versionLinksPopupOpen={versionLinksPopupOpen}
        setVersionLinksPopupOpen={setVersionLinksPopupOpen}
        infoPopupOpen={infoPopupOpen}
        setInfoPopupOpen={setInfoPopupOpen}
        quickNavOpen={quickNavOpen}
        quickNavPlaceholder={quickNavPlaceholder}
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
        closeQuickNavigation={closeQuickNavigationInternal}
        setQuickNavQuery={setQuickNavQuery}
        setQuickNavActiveIndex={setQuickNavActiveIndex}
        focusModeOpen={focusModeOpen}
        focusModeLabel={controlsConfig.focusModeLabel}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
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
        browsePrevLabel={browsePrevLabel}
        browseNextLabel={browseNextLabel}
        closeUrlFullscreen={closeUrlFullscreen}
      />
    </div>
  );
}

function CollapsedNavRail({
  menuOpenLabel,
  onExpand,
  blockMenuOnNav,
  setBlockMenuOnNav,
  navMenuConfig,
}: {
  menuOpenLabel: string;
  onExpand: () => void;
  blockMenuOnNav: boolean;
  setBlockMenuOnNav: (v: boolean) => void;
  navMenuConfig: import("./model/use-docs-shell-config").NavMenuConfig;
}) {
  return (
    <div className={styles.collapsedNavRail}>
      <NavMenuBlockToggle
        blockMenuOnNav={blockMenuOnNav}
        onToggle={() => setBlockMenuOnNav(!blockMenuOnNav)}
        activeIcon={navMenuConfig.navMenuBlockActiveIcon}
        inactiveIcon={navMenuConfig.navMenuBlockInactiveIcon}
        labelActive={navMenuConfig.blockMenuOnNavLabelActive}
        labelInactive={navMenuConfig.blockMenuOnNavLabelInactive}
        className={`${styles.button} ${styles.sidebarRailButton}`}
      />
      <button
        className={`${styles.button} ${styles.sidebarRailButton}`}
        onClick={onExpand}
        aria-label={menuOpenLabel}
        title={menuOpenLabel}
      >
        ❯❯
      </button>
    </div>
  );
}

function DocsShellMainContent(props: {
  headerName: string;
  iconImage: string | undefined;
  useReactHeaderIcon: boolean;
  reactHeaderIconTag: string | undefined;
  headerReactIconStyle: React.CSSProperties;
  iconImgWidth: number;
  iconImgHeight: number;
  menuOpen: boolean;
  menuOpenLabel: string;
  menuCloseLabel: string;
  onToggleMenu: () => void;
  activeLayoutMode?: string;
  controlsProps: DocsShellControlsProps;
  navMenuConfig: import("./model/use-docs-shell-config").NavMenuConfig;
  currentPage: LoadedPage | undefined;
  data: LoadedDocsData;
  language: string;
  nextMode: string;
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel: string;
  browseNextLabel: string;
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  audioBrowseIndex: number;
  setMdBrowseIndex: (v: number | ((p: number) => number)) => void;
  setHtmlBrowseIndex: (v: number | ((p: number) => number)) => void;
  setVideoBrowseIndex: (v: number | ((p: number) => number)) => void;
  setAudioBrowseIndex: (v: number | ((p: number) => number)) => void;
  mdItems: unknown[];
  htmlItems: unknown[];
  videoItems: unknown[];
  audioItems: unknown[];
  routeGuideEnabled: boolean;
  breadcrumbTrail: BreadcrumbItem[];
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  homePathClick: string | undefined;
  homeAncestorKeys: string[];
  routeGuideIconConfig: ReturnType<typeof resolveRouteGuideIconConfig>;
  onFullscreenOpen: (params: FullscreenParams) => void;
  onFullscreenClose: () => void;
  linearNavigationEntries: { pathClick: string; ancestorKeys: string[] }[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToLinearNavigation: (offset: -1 | 1) => void;
  footerEnabled: boolean;
  footerConfig: FooterConfig;
}) {
  const {
    headerName,
    iconImage,
    useReactHeaderIcon,
    reactHeaderIconTag,
    headerReactIconStyle,
    iconImgWidth,
    iconImgHeight,
    menuOpen,
    menuOpenLabel,
    menuCloseLabel,
    onToggleMenu,
    activeLayoutMode,
    controlsProps,
    currentPage,
    data,
    language,
    nextMode,
    previousLabel,
    nextLabel,
    browsePrevLabel,
    browseNextLabel,
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
    routeGuideEnabled,
    breadcrumbTrail,
    onMenuClick,
    homePathClick,
    homeAncestorKeys,
    routeGuideIconConfig,
    onFullscreenOpen,
    onFullscreenClose,
    linearNavigationEntries,
    canGoPrevious,
    canGoNext,
    goToLinearNavigation,
    footerEnabled,
    footerConfig,
  } = props;

  return (
    <div className={styles.contentArea}>
      <DocsShellHeader
        headerName={headerName}
        iconImage={iconImage}
        useReactHeaderIcon={useReactHeaderIcon}
        reactHeaderIconTag={reactHeaderIconTag}
        headerReactIconStyle={headerReactIconStyle}
        iconImgWidth={iconImgWidth}
        iconImgHeight={iconImgHeight}
        menuOpen={menuOpen}
        menuOpenLabel={menuOpenLabel}
        menuCloseLabel={menuCloseLabel}
        onToggleMenu={props.onToggleMenu}
        activeLayoutMode={activeLayoutMode as "light" | "dark" | undefined}
        navMenuConfig={props.navMenuConfig}
        controls={<DocsShellControls {...controlsProps} />}
      />

      <main className={styles.main}>
        <PageContentArea
          currentPage={currentPage}
          data={data}
          language={language}
          isDarkMode={nextMode === "dark"}
          fullscreenCloseLabel={menuCloseLabel}
          fullscreenExpandLabel={getLangMenuLabelFromMenu(data.config.site.langmenu, language, "showMenu", "Fullscreen")}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          browsePrevLabel={browsePrevLabel}
          browseNextLabel={browseNextLabel}
          mdBrowseIndex={mdBrowseIndex}
          htmlBrowseIndex={htmlBrowseIndex}
          videoBrowseIndex={videoBrowseIndex}
          audioBrowseIndex={audioBrowseIndex}
          setMdBrowseIndex={setMdBrowseIndex}
          setHtmlBrowseIndex={setHtmlBrowseIndex}
          setVideoBrowseIndex={setVideoBrowseIndex}
          setAudioBrowseIndex={setAudioBrowseIndex}
          mdItems={mdItems as Parameters<typeof PageContentArea>[0]["mdItems"]}
          htmlItems={htmlItems as Parameters<typeof PageContentArea>[0]["htmlItems"]}
          videoItems={videoItems as Parameters<typeof PageContentArea>[0]["videoItems"]}
          audioItems={audioItems as Parameters<typeof PageContentArea>[0]["audioItems"]}
          routeGuideEnabled={routeGuideEnabled}
          breadcrumbTrail={breadcrumbTrail}
          onMenuClick={onMenuClick}
          homePathClick={homePathClick}
          homeAncestorKeys={homeAncestorKeys}
          routeGuideIconConfig={routeGuideIconConfig}
          onFullscreenOpen={onFullscreenOpen}
          onFullscreenClose={onFullscreenClose}
        />
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
      </main>
      {footerEnabled && (
        <SiteFooter
          language={language}
          projectLabel={footerConfig.projectLabel}
          linkName={footerConfig.linkName}
          linkUrl={footerConfig.linkUrl}
          dateMode={footerConfig.dateMode}
          dateCustom={footerConfig.dateCustom}
        />
      )}
    </div>
  );
}

function DocsShellOverlays(props: {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headerName: string;
  headerMenuTree: MenuNode[];
  menuCloseLabel: string;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
  toggleNode: (key: string) => void;
  isNodeExpanded: (key: string) => boolean;
  controlsProps: DocsShellControlsProps;
  navMenuConfig: import("./model/use-docs-shell-config").NavMenuConfig;
  controlsConfig: { activeNavigation: boolean; focusModeEnabled: boolean; focusModeLabel: string; versionLinksLabel: string; versionLinkOptionsWithLabels: unknown[]; lastUpdateLabel: string; updateDate: string };
  versionLinksPopupOpen: boolean;
  setVersionLinksPopupOpen: (v: boolean) => void;
  infoPopupOpen: boolean;
  setInfoPopupOpen: (v: boolean) => void;
  quickNavOpen: boolean;
  quickNavPlaceholder: string;
  quickNavQuery: string;
  filteredQuickNavEntries: MenuEntry[];
  quickNavActiveIndex: number;
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  noNavigationResults: string;
  quickNavListRef: React.RefObject<HTMLDivElement | null>;
  quickNavItemRefs: React.RefObject<Array<HTMLButtonElement | null>>;
  closeQuickNavigation: () => void;
  setQuickNavQuery: (q: string) => void;
  setQuickNavActiveIndex: (nextIndex: number | ((prev: number) => number)) => void;
  focusModeOpen: boolean;
  focusModeLabel: string;
  previousLabel: string;
  nextLabel: string;
  focusModeCurrentHtml: string;
  canFocusModeGoPrevious: boolean;
  canFocusModeGoNext: boolean;
  closeFocusMode: () => void;
  onFocusModeNavigate: (offset: -1 | 1) => void;
  versionLinksLabel: string;
  versionLinkOptionsWithLabels: VersionLinkOption[];
  lastUpdateLabel: string;
  updateDate: string;
  urlFullscreenParams: FullscreenParams | null;
  data: LoadedDocsData;
  language: string;
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  audioBrowseIndex: number;
  setMdBrowseIndex: (v: number | ((p: number) => number)) => void;
  setHtmlBrowseIndex: (v: number | ((p: number) => number)) => void;
  setVideoBrowseIndex: (v: number | ((p: number) => number)) => void;
  setAudioBrowseIndex: (v: number | ((p: number) => number)) => void;
  mdItems: unknown[];
  htmlItems: unknown[];
  videoItems: unknown[];
  audioItems: unknown[];
  routeGuideEnabled: boolean;
  breadcrumbTrail: BreadcrumbItem[];
  homePathClick: string | undefined;
  homeAncestorKeys: string[];
  routeGuideIconConfig: ReturnType<typeof resolveRouteGuideIconConfig>;
  closeUrlFullscreen: () => void;
  nextMode: string;
  browsePrevLabel: string;
  browseNextLabel: string;
}) {
  const { controlsProps, controlsConfig } = props;
  return (
    <>
      <DocsShellMobileDrawer
        isOpen={props.menuOpen}
        siteName={props.headerName}
        menuNodes={props.headerMenuTree}
        menuCloseLabel={props.menuCloseLabel}
        onClose={() => props.setMenuOpen(false)}
        onMenuClick={props.onMenuClick}
        onToggleNode={props.toggleNode}
        isNodeExpanded={props.isNodeExpanded}
        controls={controlsProps}
        navMenuCloseIcon={props.navMenuConfig.navMenuMobileCloseIcon}
      />
      <DocsShellQuickNavOverlay
        isOpen={controlsConfig.activeNavigation && props.quickNavOpen}
        quickNavPlaceholder={props.quickNavPlaceholder}
        menuCloseLabel={props.menuCloseLabel}
        quickNavQuery={props.quickNavQuery}
        filteredQuickNavEntries={props.filteredQuickNavEntries}
        quickNavActiveIndex={props.quickNavActiveIndex}
        navigateHintLabel={props.navigateHintLabel}
        selectHintLabel={props.selectHintLabel}
        escHintLabel={props.escHintLabel}
        closeHintLabel={props.closeHintLabel}
        noNavigationResults={props.noNavigationResults}
        quickNavListRef={props.quickNavListRef}
        quickNavItemRefs={props.quickNavItemRefs}
        onClose={props.closeQuickNavigation}
        onQueryChange={props.setQuickNavQuery}
        onActiveIndexChange={props.setQuickNavActiveIndex}
        onMenuClick={props.onMenuClick}
      />
      <DocsShellFocusOverlay
        isOpen={controlsConfig.focusModeEnabled && props.focusModeOpen}
        focusModeLabel={props.focusModeLabel}
        menuCloseLabel={props.menuCloseLabel}
        previousLabel={props.previousLabel}
        nextLabel={props.nextLabel}
        focusModeCurrentHtml={props.focusModeCurrentHtml}
        canFocusModeGoPrevious={props.canFocusModeGoPrevious}
        canFocusModeGoNext={props.canFocusModeGoNext}
        onClose={props.closeFocusMode}
        onNavigate={props.onFocusModeNavigate}
      />
      <DocsShellVersionLinksOverlay
        isOpen={props.versionLinksPopupOpen}
        versionLinksLabel={props.versionLinksLabel}
        menuCloseLabel={props.menuCloseLabel}
        options={props.versionLinkOptionsWithLabels}
        onClose={() => props.setVersionLinksPopupOpen(false)}
        onOpenVersionLink={(url) => window.open(url, "_blank", "noreferrer")}
      />
      <DocsShellInfoOverlay
        isOpen={props.infoPopupOpen}
        lastUpdateLabel={props.lastUpdateLabel}
        updateDate={props.updateDate}
        menuCloseLabel={props.menuCloseLabel}
        onClose={() => props.setInfoPopupOpen(false)}
      />
      <DocsShellUrlFullscreenOverlay
        isOpen={Boolean(props.urlFullscreenParams)}
        params={props.urlFullscreenParams}
        data={props.data}
        language={props.language}
        isDarkMode={props.nextMode === "dark"}
        menuCloseLabel={props.menuCloseLabel}
        fullscreenExpandLabel={getLangMenuLabelFromMenu(props.data.config.site.langmenu, props.language, "showMenu", "Fullscreen")}
        previousLabel={props.previousLabel}
        nextLabel={props.nextLabel}
        browsePrevLabel={props.browsePrevLabel}
        browseNextLabel={props.browseNextLabel}
        mdBrowseIndex={props.mdBrowseIndex}
        htmlBrowseIndex={props.htmlBrowseIndex}
        videoBrowseIndex={props.videoBrowseIndex}
        audioBrowseIndex={props.audioBrowseIndex}
        setMdBrowseIndex={props.setMdBrowseIndex}
        setHtmlBrowseIndex={props.setHtmlBrowseIndex}
        setVideoBrowseIndex={props.setVideoBrowseIndex}
        setAudioBrowseIndex={props.setAudioBrowseIndex}
        mdItems={props.mdItems as Parameters<typeof DocsShellUrlFullscreenOverlay>[0]["mdItems"]}
        htmlItems={props.htmlItems as Parameters<typeof DocsShellUrlFullscreenOverlay>[0]["htmlItems"]}
        videoItems={props.videoItems as Parameters<typeof DocsShellUrlFullscreenOverlay>[0]["videoItems"]}
        audioItems={props.audioItems as Parameters<typeof DocsShellUrlFullscreenOverlay>[0]["audioItems"]}
        routeGuideEnabled={props.routeGuideEnabled}
        breadcrumbTrail={props.breadcrumbTrail}
        onMenuClick={props.onMenuClick}
        homePathClick={props.homePathClick}
        homeAncestorKeys={props.homeAncestorKeys}
        routeGuideIconConfig={props.routeGuideIconConfig}
        onClose={props.closeUrlFullscreen}
      />
    </>
  );
}
