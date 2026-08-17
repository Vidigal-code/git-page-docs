"use client";

import type { ContentTypeRouteConfig, GitPageDocsConfig, LanguageCode } from "@/entities/docs";
import { parseGithubTreeUrl, DEFAULT_SOURCE_VIEWER_BRANCH, DEFAULT_SOURCE_VIEWER_OWNER, DEFAULT_SOURCE_VIEWER_REPO } from "@/entities/source-viewer";
import { RepositorySourceBrowser, buildSourceViewerLabels } from "@/widgets/repository-source-browser";
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
          labels={buildSourceViewerLabels(site.langmenu, language)}
          showSearchForm={false}
        />
      </article>
    </ContentContainerWrapper>
  );
}
