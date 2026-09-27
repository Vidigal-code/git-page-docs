"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import {
  getLangMenuLabelFromMenu,
  resolvePageHierarchy,
  type BrowseItem,
  type ContentType,
  type ContentTypeRouteConfig,
  type LanguageCode,
  type LoadedDocsData,
  type LoadedPage,
} from "@/entities/docs";
import type { FullscreenParams } from "../model/use-docs-shell-url-params";
import type { BrowseIndexSetter, BrowseNavigationProps, BrowseState, ContentLabels } from "../model/content-browse-props";
import { SourceBrowserSkeleton } from "@/widgets/repository-source-browser/ui/source-browser-skeleton";
import { isBrowseAllEnabled, buildBrowseNavConfig } from "./page-content-browse-nav";
import { HtmlContainer, MdContainer, VideoContainer, AudioContainer } from "./content-type-containers";
import styles from "../docs-shell.module.css";

// The source browser (tree building + markdown preview) is only needed on
// source-viewer routes, so it is loaded lazily. Its skeleton reserves the
// browser's height while the import resolves, so the card never renders
// collapsed and then stretches. The skeleton comes from its own module rather
// than the widget barrel, to keep this import to the placeholder alone.
const SourceViewerContainer = dynamic(
  () => import("./content-type-containers/source-viewer-container").then((mod) => mod.SourceViewerContainer),
  { loading: () => <SourceBrowserSkeleton showSearchForm={false} /> },
);

/**
 * The browse-all item at `index` (clamped to the list) while browsing is on,
 * else the page's own content; nothing without a page.
 */
function resolveBrowseContent<T>(
  page: LoadedPage | undefined,
  ownContent: T | undefined,
  browseAll: boolean,
  items: BrowseItem<T>[],
  index: number,
): T | undefined {
  if (!page) return undefined;
  if (browseAll && items.length > 0) {
    return items[Math.min(index, items.length - 1)]?.content;
  }
  return ownContent;
}

/** Inline fullscreen stays off while the content already sits in the URL fullscreen overlay. */
function resolveInlineFullscreen(isUrlFullscreen: boolean, enabled: boolean | undefined): boolean | undefined {
  return isUrlFullscreen ? false : enabled;
}

interface PageContentAreaProps {
  currentPage: LoadedPage | undefined;
  data: LoadedDocsData;
  language: LanguageCode;
  isDarkMode?: boolean;
  /** Active site layout id: picks the source viewer's matching token palette. */
  activeThemeId?: string;
  /** When set, only render this content type (used for URL fullscreen mdfull/htmlfull/videofull/audiofull) */
  contentTypeFilter?: ContentType;
  /** When true, content is inside URL fullscreen overlay - hide expand button, overlay provides close */
  isUrlFullscreen?: boolean;
  labels: ContentLabels;
  browse: BrowseState;
  navigation: BrowseNavigationProps;
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
  activeThemeId,
  labels,
  browse,
  navigation,
  contentTypeFilter,
  isUrlFullscreen = false,
  onFullscreenOpen,
  onFullscreenClose,
}: Readonly<PageContentAreaProps>) {
  const types = resolvePageHierarchy(currentPage, data.config, contentTypeFilter);

  const mdBrowseAll = isBrowseAllEnabled(currentPage?.md?.config);
  const htmlBrowseAll = isBrowseAllEnabled(currentPage?.html?.config);
  const videoBrowseAll = isBrowseAllEnabled(currentPage?.video?.config);
  const audioBrowseAll = isBrowseAllEnabled(currentPage?.audio?.config);

  const currentMd = resolveBrowseContent(currentPage, currentPage?.md, mdBrowseAll, browse.mdItems, browse.mdBrowseIndex);
  // The source viewer has no browse-all list here (no items/index props are
  // threaded through and its container renders no browse nav), so the current
  // page content is the only candidate regardless of its browseAll flag.
  const currentSourceViewer = currentPage?.sourceViewer;
  const currentHtml = resolveBrowseContent(
    currentPage,
    currentPage?.html,
    htmlBrowseAll,
    browse.htmlItems,
    browse.htmlBrowseIndex,
  );
  const currentVideo = resolveBrowseContent(
    currentPage,
    currentPage?.video,
    videoBrowseAll,
    browse.videoItems,
    browse.videoBrowseIndex,
  );
  const currentAudio = resolveBrowseContent(
    currentPage,
    currentPage?.audio,
    audioBrowseAll,
    browse.audioItems,
    browse.audioBrowseIndex,
  );

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

  if (types.length === 0) return null;

  const langmenu = data.config.site.langmenu;
  // Every content type pages through its browse-all list with the same prev/next labels.
  const browseNavFor = (
    browseAllEnabled: boolean,
    itemsCount: number,
    currentIndex: number,
    setIndex: BrowseIndexSetter,
    menuKey: string,
    fallbackLabel: string,
  ) =>
    buildBrowseNavConfig({
      browseAllEnabled,
      itemsCount,
      currentIndex,
      setIndex,
      prevLabel: labels.browsePrevLabel,
      nextLabel: labels.browseNextLabel,
      contentTypeLabel: getLangMenuLabelFromMenu(langmenu, language, menuKey, fallbackLabel),
    });
  const mdBrowseNav = browseNavFor(
    mdBrowseAll,
    browse.mdItems.length,
    browse.mdBrowseIndex,
    browse.setMdBrowseIndex,
    "titleHeaderMenuMd",
    "Markdown",
  );
  const htmlBrowseNav = browseNavFor(
    htmlBrowseAll,
    browse.htmlItems.length,
    browse.htmlBrowseIndex,
    browse.setHtmlBrowseIndex,
    "titleHeaderMenuHtml",
    "Pages",
  );
  const videoBrowseNav = browseNavFor(
    videoBrowseAll,
    browse.videoItems.length,
    browse.videoBrowseIndex,
    browse.setVideoBrowseIndex,
    "titleHeaderMenuVideo",
    "Video",
  );
  const audioBrowseNav = browseNavFor(
    audioBrowseAll,
    browse.audioItems.length,
    browse.audioBrowseIndex,
    browse.setAudioBrowseIndex,
    "titleHeaderMenuAudio",
    "Audio",
  );

  // Labels every content block shares: the inline fullscreen controls.
  const fullscreenLabels = {
    fullscreenExpandLabel: labels.fullscreenExpandLabel,
    fullscreenCloseLabel: labels.menuCloseLabel,
  };

  // One block per content type; the page hierarchy decides which render, in
  // which order. Types whose content is missing render nothing.
  const blocks: Record<ContentType, React.ReactNode> = {
    md: currentMd ? (
      <MdContainer
        key="md"
        html={currentMd.markdownByLanguage[language] ?? ""}
        config={currentMd.config}
        language={language}
        isDarkMode={isDarkMode}
        fullscreenEnabled={resolveInlineFullscreen(isUrlFullscreen, currentMd.fullscreenEnabled)}
        {...fullscreenLabels}
        useDefaultScrollBehavior={isUrlFullscreen}
        contentOnly={isUrlFullscreen}
        browseNav={mdBrowseNav}
        routeGuideEnabled={navigation.routeGuideEnabled}
        breadcrumbTrail={navigation.breadcrumbTrail}
        onBreadcrumbClick={navigation.onMenuClick}
        homePathClick={navigation.homePathClick}
        homeAncestorKeys={navigation.homeAncestorKeys}
        routeGuideIconConfig={navigation.routeGuideIconConfig}
        tocPositionDefault={data.config.site?.RouteguideBrandPositionDefault ?? "center"}
        tocContainerTopDefault={data.config.site?.RouteguideBrandContainerTopDefault ?? false}
        onFullscreenOpen={mdFullscreenOpen}
        onFullscreenClose={onFullscreenClose}
      />
    ) : null,
    "source-viewer": currentSourceViewer ? (
      <SourceViewerContainer
        key="source-viewer"
        config={currentSourceViewer.config}
        sourceViewerPath={currentSourceViewer.sourceViewerPath}
        site={data.config.site}
        language={language}
        isDarkMode={isDarkMode}
        activeThemeId={activeThemeId}
      />
    ) : null,
    html: currentHtml ? (
      <HtmlContainer
        key="html"
        html={currentHtml.htmlByLanguage[language] ?? ""}
        url={currentHtml.config.url?.[language] ?? currentHtml.config.url?.en}
        config={currentHtml.config}
        language={language}
        isDarkMode={isDarkMode}
        fullscreenEnabled={resolveInlineFullscreen(isUrlFullscreen, currentHtml.fullscreenEnabled)}
        {...fullscreenLabels}
        browseNav={htmlBrowseNav}
        onFullscreenOpen={htmlFullscreenOpen}
        onFullscreenClose={onFullscreenClose}
        hideHeader={isUrlFullscreen}
      />
    ) : null,
    video: currentVideo ? (
      <VideoContainer
        key="video"
        videoType={currentVideo.videoTypeByLanguage[language] ?? "youtube"}
        pathVideo={currentVideo.pathVideoByLanguage[language] ?? ""}
        language={language}
        config={currentVideo.config}
        isDarkMode={isDarkMode}
        fullscreenEnabled={resolveInlineFullscreen(isUrlFullscreen, currentVideo.fullscreenEnabled)}
        {...fullscreenLabels}
        browseNav={videoBrowseNav}
        onFullscreenOpen={videoFullscreenOpen}
        onFullscreenClose={onFullscreenClose}
        hideTitleDescription={isUrlFullscreen}
      />
    ) : null,
    audio: currentAudio ? (
      <AudioContainer
        key="audio"
        audioType={currentAudio.audioTypeByLanguage[language] ?? "youtube"}
        pathAudio={currentAudio.pathAudioByLanguage[language] ?? ""}
        language={language}
        config={currentAudio.config}
        isDarkMode={isDarkMode}
        fullscreenEnabled={resolveInlineFullscreen(isUrlFullscreen, currentAudio.fullscreenEnabled)}
        {...fullscreenLabels}
        browseNav={audioBrowseNav}
        controlsConfig={navigation.audioRouteControlsConfig}
        onFullscreenOpen={audioFullscreenOpen}
        onFullscreenClose={onFullscreenClose}
      />
    ) : null,
  };

  return <div className={styles.contentBlocksStack}>{types.map((type) => blocks[type])}</div>;
}
