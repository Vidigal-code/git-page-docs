"use client";

import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import type { BrowseNavConfig } from "../page-content-browse-nav";
import { ContentContainerWrapper } from "./content-container-wrapper";
import { AudioRouteControls, type AudioRouteControlsConfig } from "./audio-route-controls";
import { getAudioRouteCaptions } from "./captions-track";
import { getFullscreenAlign } from "./fullscreen-alignment";
import { parseCssToStyle } from "./parse-css-to-style";
import styles from "../../docs-shell.module.css";

interface AudioContainerProps {
  audioType: string;
  pathAudio: string;
  language: LanguageCode;
  config?: ContentTypeRouteConfig;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  isDarkMode?: boolean;
  browseNav?: BrowseNavConfig;
  controlsConfig?: AudioRouteControlsConfig;
  /** Called when fullscreen is about to open (for URL sync) */
  onFullscreenOpen?: () => void;
  /** Called when fullscreen is about to close (for URL sync) */
  onFullscreenClose?: () => void;
}

export function AudioContainer({
  audioType,
  pathAudio,
  language,
  config,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
  isDarkMode = false,
  browseNav,
  controlsConfig,
  onFullscreenOpen,
  onFullscreenClose,
}: Readonly<AudioContainerProps>) {
  const title = config?.title?.[language] ?? config?.title?.en;
  const description = config?.description?.[language] ?? config?.description?.en;
  const titleIsVisible = config?.titleIsVisible ?? false;
  const descriptionIsVisible = config?.descriptionIsVisible ?? false;
  const titleCss = isDarkMode ? config?.titleDarkCss ?? config?.titleCss : config?.titleLightCss ?? config?.titleCss;
  const descCss = isDarkMode ? config?.descriptionDarkCss ?? config?.descriptionCss : config?.descriptionLightCss ?? config?.descriptionCss;

  const content = (
    <article className={styles.card}>
      {titleIsVisible && title && (
        <h1
          className={styles.contentTitleVideoInside}
          style={{ textAlign: "center", ...parseCssToStyle(titleCss) }}
        >
          {title}
        </h1>
      )}
      {controlsConfig && (
        <AudioRouteControls
          audioType={audioType}
          pathAudio={pathAudio}
          language={language}
          controls={controlsConfig}
          captions={getAudioRouteCaptions(config)}
        />
      )}
      {descriptionIsVisible && description && (
        <h3
          className={styles.contentDescriptionVideoInside}
          style={{ textAlign: "center", ...parseCssToStyle(descCss) }}
        >
          {description}
        </h3>
      )}
    </article>
  );

  return (
    <ContentContainerWrapper
      fullscreenEnabled={fullscreenEnabled}
      fullscreenCloseLabel={fullscreenCloseLabel}
      fullscreenExpandLabel={fullscreenExpandLabel}
      onBeforeFullscreen={onFullscreenOpen}
      onAfterFullscreen={onFullscreenClose}
      marginTop={config?.marginTop}
      marginBottom={config?.marginBottom}
      browseNav={browseNav}
      fullscreenAlign={getFullscreenAlign("audio")}
    >
      {content}
    </ContentContainerWrapper>
  );
}
