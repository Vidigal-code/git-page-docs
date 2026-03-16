"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import { toDocsShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { SiteFooter } from "@/shared/ui/site-footer";
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
import { useFocusMode } from "./model/use-focus-mode";
import { useQuickNavigation } from "./model/use-quick-navigation";
import { useVersionRouting } from "./model/use-version-routing";
import { DocsShellControls } from "./ui/docs-shell-controls";
import { DocsShellFocusOverlay } from "./ui/docs-shell-focus-overlay";
import { DocsShellHeader } from "./ui/docs-shell-header";
import { DocsShellInfoOverlay } from "./ui/docs-shell-info-overlay";
import { DocsShellMobileDrawer } from "./ui/docs-shell-mobile-drawer";
import { DocsShellQuickNavOverlay } from "./ui/docs-shell-quick-nav-overlay";
import { DocsShellSidebar } from "./ui/docs-shell-sidebar";
import { DocsShellVersionLinksOverlay } from "./ui/docs-shell-version-links-overlay";
import { PageContentArea } from "./ui/page-content-area";
import styles from "./docs-shell.module.css";

export function DocsShell({ data }: { data: LoadedDocsData }) {
  const { getCurrentSearchParams, replaceUrlWithoutNavigation, pathname, router } = useDocsShellUrl();
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
    mdBrowseIndex,
    htmlBrowseIndex,
    videoBrowseIndex,
    setMdBrowseIndex,
    setHtmlBrowseIndex,
    setVideoBrowseIndex,
    mdItems,
    htmlItems,
    videoItems,
  } = useDocsShellNavigationState({
    data,
    language,
    setSidebarOpen,
    setMenuOpen,
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

  const { headerIconConfig, controlsConfig, footerEnabled, footerConfig } = useDocsShellConfig(
    data,
    activeLayout,
    language,
    selectedVersionValue,
    activeThemeId,
    canToggleMode,
    nextMode === "dark",
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
    (pathClick: string, ancestorKeys: string[] = []) => {
      onMenuClickState(pathClick, ancestorKeys);
      setQuickNavOpen(false);
      setFocusModeOpen(false);
      setQuickNavQuery("");
    },
    [onMenuClickState, setQuickNavOpen, setFocusModeOpen, setQuickNavQuery],
  );

  const goToLinearNavigation = useCallback(
    (offset: -1 | 1) => {
      if (currentLinearNavigationIndex < 0) return;
      const targetEntry = linearNavigationEntries[currentLinearNavigationIndex + offset];
      if (!targetEntry) return;
      onMenuClick(targetEntry.pathClick, targetEntry.ancestorKeys);
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
  const cssVars = useMemo(() => toDocsShellCssVars(activeTheme), [activeTheme]);
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
          <PageContentArea
            currentPage={currentPage}
            data={data}
            language={language}
            isDarkMode={nextMode === "dark"}
            fullscreenCloseLabel={menuCloseLabel}
            fullscreenExpandLabel={getLangMenuLabelFromMenu(
              data.config.site.langmenu,
              language,
              "showMenu",
              "Fullscreen",
            )}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            browsePrevLabel={browsePrevLabel}
            browseNextLabel={browseNextLabel}
            mdBrowseIndex={mdBrowseIndex}
            htmlBrowseIndex={htmlBrowseIndex}
            videoBrowseIndex={videoBrowseIndex}
            setMdBrowseIndex={setMdBrowseIndex}
            setHtmlBrowseIndex={setHtmlBrowseIndex}
            setVideoBrowseIndex={setVideoBrowseIndex}
            mdItems={mdItems}
            htmlItems={htmlItems}
            videoItems={videoItems}
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
        onClose={closeQuickNavigationInternal}
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
        onClose={closeFocusModeInternal}
        onNavigate={onFocusModeNavigateInternal}
      />

      <DocsShellVersionLinksOverlay
        isOpen={versionLinksPopupOpen}
        versionLinksLabel={controlsConfig.versionLinksLabel}
        menuCloseLabel={menuCloseLabel}
        options={controlsConfig.versionLinkOptionsWithLabels}
        onClose={() => setVersionLinksPopupOpen(false)}
        onOpenVersionLink={(url) => window.open(url, "_blank", "noreferrer")}
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
