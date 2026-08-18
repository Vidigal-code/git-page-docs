"use client";

import { useEffect, useMemo, useState } from "react";
import { buildSourceViewerPath, parseSourceViewerRoute, type SourceViewerRoute } from "@/entities/source-viewer";
import {
  buildFooterConfigFromData,
  getLanguageLabelFromMenu,
  toSearchShellCssVars,
  type LoadedDocsData,
} from "@/entities/docs";
import { SearchShellHeader, useStandaloneShellPreferences } from "@/widgets/search-shell-header";
import { SearchShellLayout } from "@/widgets/search-shell-layout";
import { RepositorySourceBrowser, SourceBrowserSkeleton, buildSourceViewerLabels } from "@/widgets/repository-source-browser";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { getBasePath, toFullPath } from "@/shared/lib/base-path";
import { SOURCE_VIEWER_FALLBACK_PARAM } from "@/shared/lib/source-viewer-fallback";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import styles from "./source-viewer-page.module.css";

interface SourceViewerPageProps {
  data: LoadedDocsData;
  initialRoute: SourceViewerRoute;
}


export function SourceViewerPage({ data, initialRoute }: SourceViewerPageProps) {
  // Deep links reach the exported /source-viewer/ page through the 404
  // fallback with the route in a query param; restore it (and the canonical
  // URL) before mounting the browser.
  const [resolvedInitialRoute, setResolvedInitialRoute] = useState<SourceViewerRoute | null>(null);
  useEffect(() => {
    const deepRoute = new URLSearchParams(window.location.search).get(SOURCE_VIEWER_FALLBACK_PARAM);
    if (deepRoute) {
      const route = parseSourceViewerRoute(deepRoute.split("/").filter(Boolean));
      window.history.replaceState(null, "", toFullPath(buildSourceViewerPath(route)));
      setResolvedInitialRoute(route);
      return;
    }
    setResolvedInitialRoute(initialRoute);
  }, [initialRoute]);

  const defaultLanguage = data.config.site.defaultLanguage;
  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;
  const siteName = data.config.site.name ?? "GitPageDocs";

  const {
    language,
    onLanguageChange,
    activeThemeId,
    onThemeChange,
    onToggleMode,
    activeLayout,
    nextModeIsDark,
    canToggleMode,
  } = useStandaloneShellPreferences({
    siteName,
    defaultLanguage,
    availableLanguages: data.availableLanguages,
    layouts: data.layoutsConfig.layouts,
    configuredDefaultMode,
    initialThemeBaseId,
  });

  const activeTheme = data.themes[activeLayout?.id ?? ""];
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);
  const basePath = getBasePath();
  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, activeLayout?.mode ?? "dark", basePath),
    [data.config.site, activeLayout?.mode, basePath],
  );
  const labels = useMemo(() => buildSourceViewerLabels(data.config.site.langmenu, language), [data.config.site.langmenu, language]);

  const header = (
    <SearchShellHeader
      themeVarsStyle={cssVars}
      siteName={headerIconConfig.headerName}
      basePath={basePath}
      language={language}
      languages={data.availableLanguages}
      onLanguageChange={onLanguageChange}
      activeThemeId={activeThemeId}
      layouts={data.layoutsConfig.layouts}
      onThemeChange={onThemeChange}
      nextModeIsDark={nextModeIsDark}
      canToggleMode={canToggleMode}
      onToggleMode={onToggleMode}
      iconImage={headerIconConfig.iconImage}
      iconImgWidth={headerIconConfig.iconImgWidth}
      iconImgHeight={headerIconConfig.iconImgHeight}
      useReactHeaderIcon={headerIconConfig.useReactIcon}
      reactHeaderIconTag={headerIconConfig.reactIconTag}
      headerReactIconStyle={headerIconConfig.reactIconStyle}
      getLanguageLabel={(lang) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang)}
    />
  );

  return (
    <SearchShellLayout
      header={header}
      footerEnabled={data.config.site.FooterEnabled !== false}
      projectFooterUrl={PROJECT_FOOTER_URL}
      language={language}
      style={cssVars}
      footerConfig={buildFooterConfigFromData(data, language)}
    >
      {/* A plain wrapper: SearchShellLayout already provides the page's <main>. */}
      <div className={styles.shell}>
        <div className={styles.workspace}>
          {resolvedInitialRoute ? (
            <RepositorySourceBrowser
              initialRoute={resolvedInitialRoute}
              labels={labels}
              onRouteChange={(route, options) => {
                const url = toFullPath(buildSourceViewerPath(route));
                if (options?.replace) window.history.replaceState(null, "", url);
                else window.history.pushState(null, "", url);
              }}
            />
          ) : (
            <SourceBrowserSkeleton label={labels.loadingTree} />
          )}
        </div>
      </div>
    </SearchShellLayout>
  );
}
