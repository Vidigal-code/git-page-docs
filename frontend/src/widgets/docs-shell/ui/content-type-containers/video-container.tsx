"use client";

import { getEmbedUrl, isNativeAudio, isNativeVideo, type ContentTypeRouteConfig, type LanguageCode } from "@/entities/docs";
import { ContentContainerWrapper, type BrowseNavProps } from "./content-container-wrapper";
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

interface VideoContainerProps {
  videoType: string;
  pathVideo: string;
  language: LanguageCode;
  config?: ContentTypeRouteConfig;
  fullscreenEnabled?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  isDarkMode?: boolean;
  /** When true, hide title and description - e.g. in URL fullscreen overlay */
  hideTitleDescription?: boolean;
  browseNav?: BrowseNavProps;
  /** Called when fullscreen is about to open (for URL sync) */
  onFullscreenOpen?: () => void;
  /** Called when fullscreen is about to close (for URL sync) */
  onFullscreenClose?: () => void;
}

export function VideoContainer({
  videoType,
  pathVideo,
  language,
  config,
  fullscreenEnabled = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
  isDarkMode = false,
  browseNav,
  onFullscreenOpen,
  onFullscreenClose,
  hideTitleDescription = false,
}: VideoContainerProps) {
  const type = String(videoType).toLowerCase();
  const embedUrl = getEmbedUrl(videoType, pathVideo, language);

  const title = config?.title?.[language] ?? config?.title?.en;
  const description = config?.description?.[language] ?? config?.description?.en;
  const titleIsVisible = config?.titleIsVisible ?? false;
  const descriptionIsVisible = config?.descriptionIsVisible ?? false;
  const titleCss = isDarkMode ? config?.titleDarkCss ?? config?.titleCss : config?.titleLightCss ?? config?.titleCss;
  const descCss = isDarkMode ? config?.descriptionDarkCss ?? config?.descriptionCss : config?.descriptionLightCss ?? config?.descriptionCss;

  const mediaElement = (() => {
    if (isNativeAudio(type)) {
      return (
        <div className={styles.videoWrapper}>
          <audio controls className={styles.videoNative} src={embedUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }
    if (isNativeVideo(type)) {
      return (
        <div className={styles.videoWrapper}>
          <video controls className={styles.videoNative} src={embedUrl} style={{ width: "100%", maxWidth: "100%" }}>
            Your browser does not support the video element.
          </video>
        </div>
      );
    }
    return (
      <div className={styles.videoWrapper}>
        <iframe
          title="Video embed"
          className={styles.videoIframe}
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  })();

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
      {mediaElement}
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
