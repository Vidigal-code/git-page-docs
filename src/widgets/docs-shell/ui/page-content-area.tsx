"use client";

import { useCallback } from "react";
import type {
  ContentTypeRouteConfig,
  LanguageCode,
  LoadedDocsData,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedPage,
  LoadedVideoContent,
  LoadedAudioContent,
  RouteConfig,
} from "@/entities/docs/model/types";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import { getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import type { BrowseItem } from "@/widgets/docs-shell/model/use-docs-shell-navigation-state";
import type { BreadcrumbItem } from "@/widgets/docs-shell/model/menu-tree";
import type { ResolvedRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { HtmlContainer, MdContainer, VideoContainer, AudioContainer } from "./content-type-containers";
import styles from "../docs-shell.module.css";

function isBrowseAllEnabled(config: ContentTypeRouteConfig | RouteConfig | undefined): boolean {
  return Boolean(config && "browseAll" in config && config.browseAll === true);
}

function shouldShowBrowseNav(browseAllEnabled: boolean, itemsCount: number): boolean {
  return browseAllEnabled && itemsCount > 1;
}

interface PageContentAreaProps {
  currentPage: LoadedPage | undefined;
  data: LoadedDocsData;
  language: LanguageCode;
  isDarkMode?: boolean;
  /** When set, only render this content type (used for URL fullscreen mdfull/htmlfull/videofull/audiofull) */
  contentTypeFilter?: "md" | "html" | "video" | "audio";
  /** When true, content is inside URL fullscreen overlay - hide expand button, overlay provides close */
  isUrlFullscreen?: boolean;
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel?: string;
  browseNextLabel?: string;
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  audioBrowseIndex: number;
  setMdBrowseIndex: (v: number | ((p: number) => number)) => void;
  setHtmlBrowseIndex: (v: number | ((p: number) => number)) => void;
  setVideoBrowseIndex: (v: number | ((p: number) => number)) => void;
  setAudioBrowseIndex: (v: number | ((p: number) => number)) => void;
  mdItems: BrowseItem<LoadedMdContent>[];
  htmlItems: BrowseItem<LoadedHtmlContent>[];
  videoItems: BrowseItem<LoadedVideoContent>[];
  audioItems: BrowseItem<LoadedAudioContent>[];
  routeGuideEnabled?: boolean;
  breadcrumbTrail?: BreadcrumbItem[];
  onMenuClick?: (pathClick: string, ancestorKeys: string[]) => void;
  homePathClick?: string;
  homeAncestorKeys?: string[];
  routeGuideIconConfig?: ResolvedRouteGuideIconConfig;
  /** Called when fullscreen opens (for URL sync so user can share). */
  onFullscreenOpen?: (params: FullscreenParams) => void;
  /** Called when fullscreen closes (for URL sync). */
  onFullscreenClose?: () => void;
}

export function PageContentArea({
  currentPage,
  data,
  language,
  isDarkMode = false,
  fullscreenCloseLabel,
  fullscreenExpandLabel,
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
  routeGuideEnabled = false,
  breadcrumbTrail = [],
  onMenuClick,
  homePathClick,
  homeAncestorKeys = [],
  routeGuideIconConfig,
  contentTypeFilter,
  isUrlFullscreen = false,
  onFullscreenOpen,
  onFullscreenClose,
}: PageContentAreaProps) {
  const hierarchy = data.config.hierarchyPage ?? { md: 0, html: 1, video: 2, audio: 3 };
  const mdConfig = currentPage?.md?.config;
  const htmlConfig = currentPage?.html?.config;
  const videoConfig = currentPage?.video?.config;
  const audioConfig = currentPage?.audio?.config;
  const mdBrowseAll = isBrowseAllEnabled(mdConfig);
  const htmlBrowseAll = isBrowseAllEnabled(htmlConfig);
  const videoBrowseAll = isBrowseAllEnabled(videoConfig);
  const audioBrowseAll = isBrowseAllEnabled(audioConfig);

  const currentMd =
    currentPage &&
    (mdBrowseAll && mdItems.length > 0
      ? mdItems[Math.min(mdBrowseIndex, mdItems.length - 1)]?.content
      : currentPage.md);
  const currentHtml =
    currentPage &&
    (htmlBrowseAll && htmlItems.length > 0
      ? htmlItems[Math.min(htmlBrowseIndex, htmlItems.length - 1)]?.content
      : currentPage.html);
  const currentVideo =
    currentPage &&
    (videoBrowseAll && videoItems.length > 0
      ? videoItems[Math.min(videoBrowseIndex, videoItems.length - 1)]?.content
      : currentPage.video);
  const currentAudio =
    currentPage &&
    (audioBrowseAll && audioItems.length > 0
      ? audioItems[Math.min(audioBrowseIndex, audioItems.length - 1)]?.content
      : currentPage.audio);

  const mdFullscreenOpen = useCallback(() => {
    if (!currentMd || isUrlFullscreen) return;
    const pathRec = (currentMd.config as { path?: Record<string, string> })?.path;
    const file = pathRec?.[language];
    if (file) onFullscreenOpen?.({ type: "md", lang: language, file });
  }, [currentMd, language, isUrlFullscreen, onFullscreenOpen]);

  const htmlFullscreenOpen = useCallback(() => {
    if (!currentHtml || isUrlFullscreen) return;
    const cfg = currentHtml.config as { path?: Record<string, string>; url?: Record<string, string> };
    const file = cfg?.path?.[language] ?? cfg?.url?.[language];
    if (file) onFullscreenOpen?.({ type: "html", lang: language, file });
  }, [currentHtml, language, isUrlFullscreen, onFullscreenOpen]);

  const videoFullscreenOpen = useCallback(() => {
    if (!currentVideo || isUrlFullscreen) return;
    const cfg = currentVideo.config as ContentTypeRouteConfig;
    const slug = cfg?.videoSlug?.[language];
    onFullscreenOpen?.({ type: "video", lang: language, id: currentVideo.routeId, slug });
  }, [currentVideo, language, isUrlFullscreen, onFullscreenOpen]);

  const audioFullscreenOpen = useCallback(() => {
    if (!currentAudio || isUrlFullscreen) return;
    const cfg = currentAudio.config as ContentTypeRouteConfig;
    const slug = cfg?.audioSlug?.[language];
    onFullscreenOpen?.({ type: "audio", lang: language, id: currentAudio.routeId, slug });
  }, [currentAudio, language, isUrlFullscreen, onFullscreenOpen]);

  if (!currentPage) {
    const fallbackHtml = data.docs?.[0]?.markdownByLanguage[language] ?? "<p>Document not found.</p>";
    return (
      <article className={styles.card}>
        <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
      </article>
    );
  }

  const types = (["md", "html", "video", "audio"] as const)
    .filter((t) => currentPage[t])
    .filter((t) => !contentTypeFilter || t === contentTypeFilter)
    .sort((a, b) => (hierarchy[a] ?? 999) - (hierarchy[b] ?? 999));

  const mdLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuMd", "Markdown");
  const htmlLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuHtml", "Pages");
  const videoLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuVideo", "Video");
  const audioLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuAudio", "Audio");

  const prevL = browsePrevLabel ?? previousLabel;
  const nextL = browseNextLabel ?? nextLabel;
  const mdBrowseNav = shouldShowBrowseNav(mdBrowseAll, mdItems.length)
      ? {
          onPrev: () => setMdBrowseIndex((i) => Math.max(0, i - 1)),
          onNext: () => setMdBrowseIndex((i) => Math.min(mdItems.length - 1, i + 1)),
          prevLabel: prevL,
          nextLabel: nextL,
          canPrev: mdBrowseIndex > 0,
          canNext: mdBrowseIndex < mdItems.length - 1,
          currentIndex: mdBrowseIndex,
          total: mdItems.length,
          contentTypeLabel: mdLabel,
        }
      : undefined;
  const htmlBrowseNav = shouldShowBrowseNav(htmlBrowseAll, htmlItems.length)
      ? {
          onPrev: () => setHtmlBrowseIndex((i) => Math.max(0, i - 1)),
          onNext: () => setHtmlBrowseIndex((i) => Math.min(htmlItems.length - 1, i + 1)),
          prevLabel: prevL,
          nextLabel: nextL,
          canPrev: htmlBrowseIndex > 0,
          canNext: htmlBrowseIndex < htmlItems.length - 1,
          currentIndex: htmlBrowseIndex,
          total: htmlItems.length,
          contentTypeLabel: htmlLabel,
        }
      : undefined;
  const videoBrowseNav = shouldShowBrowseNav(videoBrowseAll, videoItems.length)
      ? {
          onPrev: () => setVideoBrowseIndex((i) => Math.max(0, i - 1)),
          onNext: () => setVideoBrowseIndex((i) => Math.min(videoItems.length - 1, i + 1)),
          prevLabel: prevL,
          nextLabel: nextL,
          canPrev: videoBrowseIndex > 0,
          canNext: videoBrowseIndex < videoItems.length - 1,
          currentIndex: videoBrowseIndex,
          total: videoItems.length,
          contentTypeLabel: videoLabel,
        }
      : undefined;
  const audioBrowseNav = shouldShowBrowseNav(audioBrowseAll, audioItems.length)
      ? {
          onPrev: () => setAudioBrowseIndex((i) => Math.max(0, i - 1)),
          onNext: () => setAudioBrowseIndex((i) => Math.min(audioItems.length - 1, i + 1)),
          prevLabel: prevL,
          nextLabel: nextL,
          canPrev: audioBrowseIndex > 0,
          canNext: audioBrowseIndex < audioItems.length - 1,
          currentIndex: audioBrowseIndex,
          total: audioItems.length,
          contentTypeLabel: audioLabel,
        }
      : undefined;

  return (
    <div className={styles.contentBlocksStack}>
      {types.map((t) => {
        if (t === "md" && currentMd) {
          return (
            <MdContainer
              key="md"
              html={currentMd.markdownByLanguage[language] ?? ""}
              config={currentMd.config}
              language={language}
              isDarkMode={isDarkMode}
              fullscreenEnabled={isUrlFullscreen ? false : currentMd.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              useDefaultScrollBehavior={isUrlFullscreen}
              contentOnly={isUrlFullscreen}
              browseNav={mdBrowseNav}
              routeGuideEnabled={routeGuideEnabled}
              breadcrumbTrail={breadcrumbTrail}
              onBreadcrumbClick={onMenuClick}
              homePathClick={homePathClick}
              homeAncestorKeys={homeAncestorKeys}
              routeGuideIconConfig={routeGuideIconConfig}
              tocPositionDefault={data.config.site?.RouteguideBrandPositionDefault ?? "center"}
              tocContainerTopDefault={data.config.site?.RouteguideBrandContainerTopDefault ?? false}
              onFullscreenOpen={mdFullscreenOpen}
              onFullscreenClose={onFullscreenClose}
            />
          );
        }
        if (t === "html" && currentHtml) {
          return (
            <HtmlContainer
              key="html"
              html={currentHtml.htmlByLanguage[language] ?? ""}
              url={currentHtml.config.url?.[language] ?? currentHtml.config.url?.en}
              config={currentHtml.config}
              language={language}
              isDarkMode={isDarkMode}
              fullscreenEnabled={isUrlFullscreen ? false : currentHtml.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              browseNav={htmlBrowseNav}
              onFullscreenOpen={htmlFullscreenOpen}
              onFullscreenClose={onFullscreenClose}
              hideHeader={isUrlFullscreen}
            />
          );
        }
        if (t === "video" && currentVideo) {
          return (
            <VideoContainer
              key="video"
              videoType={currentVideo.videoTypeByLanguage[language] ?? "youtube"}
              pathVideo={currentVideo.pathVideoByLanguage[language] ?? ""}
              language={language}
              config={currentVideo.config}
              isDarkMode={isDarkMode}
              fullscreenEnabled={isUrlFullscreen ? false : currentVideo.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              browseNav={videoBrowseNav}
              onFullscreenOpen={videoFullscreenOpen}
              onFullscreenClose={onFullscreenClose}
              hideTitleDescription={isUrlFullscreen}
            />
          );
        }
        if (t === "audio" && currentAudio) {
          return (
            <AudioContainer
              key="audio"
              audioType={currentAudio.audioTypeByLanguage[language] ?? "youtube"}
              pathAudio={currentAudio.pathAudioByLanguage[language] ?? ""}
              language={language}
              config={currentAudio.config}
              isDarkMode={isDarkMode}
              fullscreenEnabled={isUrlFullscreen ? false : currentAudio.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              browseNav={audioBrowseNav}
              onFullscreenOpen={audioFullscreenOpen}
              onFullscreenClose={onFullscreenClose}
              hideTitleDescription={isUrlFullscreen}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
