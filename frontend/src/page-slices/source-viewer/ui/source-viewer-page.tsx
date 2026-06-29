"use client";

import { useMemo } from "react";
import { buildSourceViewerPath, type SourceViewerRoute } from "@/entities/source-viewer";
import {
  buildFooterConfigFromData,
  getLanguageLabelFromMenu,
  getLangMenuLabelFromMenu,
  toSearchShellCssVars,
  type LoadedDocsData,
} from "@/entities/docs";
import { SearchShellHeader, useStandaloneShellPreferences } from "@/widgets/search-shell-header";
import { SearchShellLayout } from "@/widgets/search-shell-layout";
import { RepositorySourceBrowser } from "@/widgets/repository-source-browser";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import styles from "./source-viewer-page.module.css";

interface SourceViewerPageProps {
  data: LoadedDocsData;
  initialRoute: SourceViewerRoute;
}

function buildSourceViewerLabels(data: LoadedDocsData, language: string) {
  const langmenu = data.config.site.langmenu;
  return {
    owner: getLangMenuLabelFromMenu(langmenu, language, "searchOwnerLabel", "Owner"),
    repo: getLangMenuLabelFromMenu(langmenu, language, "searchRepoLabel", "Repository"),
    branch: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerBranchLabel", "Branch"),
    submit: getLangMenuLabelFromMenu(langmenu, language, "searchButtonLabel", "Search"),
    filter: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerFilterLabel", "Filter files"),
    clear: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerClearLabel", "Clear"),
    loadingTree: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerLoadingTree", "Loading source tree..."),
    loadingFile: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerLoadingFile", "Loading file..."),
    notFound: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerNotFound", "Repository, branch, or source tree was not found."),
    fileError: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerFileError", "File could not be loaded."),
    empty: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerEmpty", "No entries found."),
    selectFile: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerSelectFile", "Select a file"),
    preview: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerPreview", "Preview"),
    code: getLangMenuLabelFromMenu(langmenu, language, "sourceViewerCode", "Code"),
  };
}

export function SourceViewerPage({ data, initialRoute }: SourceViewerPageProps) {
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
  const labels = useMemo(() => buildSourceViewerLabels(data, language), [data, language]);

  const header = (
    <SearchShellHeader
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
      <main className={styles.shell}>
        <div className={styles.workspace}>
          <RepositorySourceBrowser
            initialRoute={initialRoute}
            labels={labels}
            onRouteChange={(route) => window.history.pushState(null, "", buildSourceViewerPath(route))}
          />
        </div>
      </main>
    </SearchShellLayout>
  );
}
