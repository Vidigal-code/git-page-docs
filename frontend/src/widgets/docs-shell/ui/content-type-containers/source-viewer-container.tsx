"use client";

import type { ContentTypeRouteConfig, GitPageDocsConfig, LanguageCode } from "@/entities/docs";
import { parseGithubTreeUrl, DEFAULT_SOURCE_VIEWER_BRANCH, DEFAULT_SOURCE_VIEWER_OWNER, DEFAULT_SOURCE_VIEWER_REPO } from "@/entities/source-viewer";
import { RepositorySourceBrowser } from "@/widgets/repository-source-browser";
import { getLangMenuLabelFromMenu } from "@/entities/docs";
import { ContentContainerWrapper } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import styles from "../../docs-shell.module.css";

interface SourceViewerContainerProps {
  config?: ContentTypeRouteConfig;
  sourceViewerPath: string;
  site: GitPageDocsConfig["site"];
  language: LanguageCode;
  isDarkMode?: boolean;
}

function buildLabels(site: GitPageDocsConfig["site"], language: LanguageCode) {
  const langmenu = site.langmenu;
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

function resolveInitialRoute(sourceViewerPath: string) {
  return (
    parseGithubTreeUrl(sourceViewerPath) ?? {
      owner: DEFAULT_SOURCE_VIEWER_OWNER,
      repo: DEFAULT_SOURCE_VIEWER_REPO,
      branch: DEFAULT_SOURCE_VIEWER_BRANCH,
      path: "",
    }
  );
}

export function SourceViewerContainer({
  config,
  sourceViewerPath,
  site,
  language,
  isDarkMode = false,
}: SourceViewerContainerProps) {
  const header = <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />;

  return (
    <ContentContainerWrapper
      header={header}
      fullscreenEnabled={false}
      fullscreenCloseLabel=""
      fullscreenExpandLabel=""
      marginTop={config?.marginTop}
      marginBottom={config?.marginBottom}
    >
      <article className={styles.card}>
        <RepositorySourceBrowser
          initialRoute={resolveInitialRoute(sourceViewerPath)}
          labels={buildLabels(site, language)}
          showSearchForm={false}
        />
      </article>
    </ContentContainerWrapper>
  );
}
