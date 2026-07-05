"use client";

import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import { ContentContainerWrapper, type BrowseNavProps } from "./content-container-wrapper";
import { AudioRouteControls, type AudioRouteControlsConfig } from "./audio-route-controls";
import styles from "../../docs-shell.module.css";

function parseCssToStyle(css: string | undefined): React.CSSProperties {
  if (!css) return {};
  const out: Record<string, string> = {};
  css.split(";").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k || !v) return;
    const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  });
  return out as React.CSSProperties;
}

interface AudioContainerProps {
  audioType: string;
  pathAudio: string;
  language: LanguageCode;
  config?: ContentTypeRouteConfig;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  isDarkMode?: boolean;
  /** When true, hide title and description - e.g. in URL fullscreen overlay */
  hideTitleDescription?: boolean;
  browseNav?: BrowseNavProps;
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
  hideTitleDescription = false,
}: AudioContainerProps) {
  const title = config?.title?.[language] ?? config?.title?.en;
  const description = config?.description?.[language] ?? config?.description?.en;
  const titleIsVisible = config?.titleIsVisible ?? false;
  const descriptionIsVisible = config?.descriptionIsVisible ?? false;
  const titleCss = isDarkMode ? config?.titleDarkCss ?? config?.titleCss : config?.titleLightCss ?? config?.titleCss;
  const descCss = isDarkMode ? config?.descriptionDarkCss ?? config?.descriptionCss : config?.descriptionLightCss ?? config?.descriptionCss;

  const content = (
    <article className={styles.card}>
      {!hideTitleDescription && titleIsVisible && title && (
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
        />
      )}
      {!hideTitleDescription && descriptionIsVisible && description && (
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
    >
      {content}
    </ContentContainerWrapper>
  );
}
