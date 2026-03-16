"use client";

import type { ContentTypeRouteConfig } from "@/entities/docs/model/types";
import type { LanguageCode } from "@/entities/docs/model/types";
import { ContentContainerWrapper, type BrowseNavProps } from "./content-container-wrapper";
import { ContentHeaderBlock } from "./content-header-block";
import styles from "../../docs-shell.module.css";

function getContainerStyle(container: ContentTypeRouteConfig["container"]): React.CSSProperties {
  if (container === "full") {
    return { minHeight: "80vh", overflow: "auto" };
  }
  if (typeof container === "number" && container > 0) {
    return { height: container, overflow: "auto" };
  }
  return {};
}

interface MdContainerProps {
  html: string;
  config?: ContentTypeRouteConfig;
  language: LanguageCode;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  isDarkMode?: boolean;
  browseNav?: BrowseNavProps;
}

export function MdContainer({
  html,
  config,
  language,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
  isDarkMode = false,
  browseNav,
}: MdContainerProps) {
  const containerStyle = getContainerStyle(config?.container);
  const header = <ContentHeaderBlock config={config} language={language} isDarkMode={isDarkMode} />;
  const content = (
    <article className={styles.card}>
      <div className={styles.markdown} style={containerStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );

  return (
    <ContentContainerWrapper
      header={header}
      fullscreenEnabled={fullscreenEnabled}
      fullscreenCloseLabel={fullscreenCloseLabel}
      fullscreenExpandLabel={fullscreenExpandLabel}
      marginTop={config?.marginTop}
      marginBottom={config?.marginBottom}
      browseNav={browseNav}
    >
      {content}
    </ContentContainerWrapper>
  );
}
