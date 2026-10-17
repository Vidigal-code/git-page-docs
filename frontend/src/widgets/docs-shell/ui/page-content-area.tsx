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
import { canAccessPdfContent, resolvePdfBrowseState } from "../model/pdf-browse";
import { SourceBrowserSkeleton } from "@/widgets/repository-source-browser/ui/source-browser-skeleton";
import { isBrowseAllEnabled, buildBrowseNavConfig } from "./page-content-browse-nav";
import { HtmlContainer, MdContainer, VideoContainer, AudioContainer, PdfContainer } from "./content-type-containers";
import { markdownFileName } from "./content-type-containers/md-source-actions";
import styles from "../docs-shell.module.css";

/** Localized file path of a markdown route (`path` is a per-language record), if any. */
function mdPathFor(config: unknown, language: LanguageCode): string | undefined {
  const path = (config as { path?: unknown } | undefined)?.path;
  if (!path || typeof path !== "object") return undefined;
  const byLanguage = path as Record<string, string | undefined>;
  return byLanguage[language] ?? byLanguage.en;
}

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
interface BrowseContentSelection<T> {
  enabled: boolean;
  items: BrowseItem<T>[];
  index: number;
}

function resolveBrowseContent<T>(
  page: LoadedPage | undefined,
  ownContent: T | undefined,
  selection: BrowseContentSelection<T>,
): T | undefined {
  if (!page) return undefined;
  if (selection.enabled && selection.items.length > 0) {
    return selection.items[Math.min(selection.index, selection.items.length - 1)]?.content;
  }
  return ownContent;
}

/** Inline fullscreen stays off while the content already sits in the URL fullscreen overlay. */
function resolveInlineFullscreen(options: { isUrlFullscreen: boolean; enabled: boolean | undefined }): boolean | undefined {
  return options.isUrlFullscreen ? false : options.enabled;
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
  const pdfBrowseAll = isBrowseAllEnabled(currentPage?.pdf?.config);

  const currentMd = resolveBrowseContent(currentPage, currentPage?.md, { enabled: mdBrowseAll, items: browse.mdItems, index: browse.mdBrowseIndex });
  // The source viewer has no browse-all list here (no items/index props are
  // threaded through and its container renders no browse nav), so the current
  // page content is the only candidate regardless of its browseAll flag.
  const currentSourceViewer = currentPage?.sourceViewer;
  const currentHtml = resolveBrowseContent(
    currentPage,
    currentPage?.html,
    { enabled: htmlBrowseAll, items: browse.htmlItems, index: browse.htmlBrowseIndex },
  );
  const currentVideo = resolveBrowseContent(
    currentPage,
    currentPage?.video,
    { enabled: videoBrowseAll, items: browse.videoItems, index: browse.videoBrowseIndex },
  );
  const currentAudio = resolveBrowseContent(
    currentPage,
    currentPage?.audio,
    { enabled: audioBrowseAll, items: browse.audioItems, index: browse.audioBrowseIndex },
  );
  const pdfAccess = { authConfig: data.config.auth, canAccessPdf: navigation.canAccessPdf };
  const pdfBrowse = resolvePdfBrowseState(browse, pdfAccess);
  const currentPdf = canAccessPdfContent(currentPage?.pdf, pdfAccess)
    ? resolveBrowseContent(currentPage, currentPage.pdf, { enabled: pdfBrowseAll, items: pdfBrowse.items, index: pdfBrowse.index })
    : undefined;

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
    selection: { browseAllEnabled: boolean; itemsCount: number; currentIndex: number; setIndex: BrowseIndexSetter },
    label: { menuKey: string; fallback: string },
  ) =>
    buildBrowseNavConfig({
      ...selection,
      prevLabel: labels.browsePrevLabel,
      nextLabel: labels.browseNextLabel,
      contentTypeLabel: getLangMenuLabelFromMenu(langmenu, language, label.menuKey, label.fallback),
    });
  const mdBrowseNav = browseNavFor(
    { browseAllEnabled: mdBrowseAll, itemsCount: browse.mdItems.length, currentIndex: browse.mdBrowseIndex, setIndex: browse.setMdBrowseIndex },
    { menuKey: "titleHeaderMenuMd", fallback: "Markdown" },
  );
  const htmlBrowseNav = browseNavFor(
    { browseAllEnabled: htmlBrowseAll, itemsCount: browse.htmlItems.length, currentIndex: browse.htmlBrowseIndex, setIndex: browse.setHtmlBrowseIndex },
    { menuKey: "titleHeaderMenuHtml", fallback: "Pages" },
  );
  const videoBrowseNav = browseNavFor(
    { browseAllEnabled: videoBrowseAll, itemsCount: browse.videoItems.length, currentIndex: browse.videoBrowseIndex, setIndex: browse.setVideoBrowseIndex },
    { menuKey: "titleHeaderMenuVideo", fallback: "Video" },
  );
  const audioBrowseNav = browseNavFor(
    { browseAllEnabled: audioBrowseAll, itemsCount: browse.audioItems.length, currentIndex: browse.audioBrowseIndex, setIndex: browse.setAudioBrowseIndex },
    { menuKey: "titleHeaderMenuAudio", fallback: "Audio" },
  );
  const pdfBrowseNav = browseNavFor(
    { browseAllEnabled: pdfBrowseAll, itemsCount: pdfBrowse.items.length, currentIndex: pdfBrowse.index, setIndex: pdfBrowse.setIndex },
    { menuKey: "titleHeaderMenuPdf", fallback: "PDF" },
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
        fullscreenEnabled={resolveInlineFullscreen({ isUrlFullscreen, enabled: currentMd.fullscreenEnabled })}
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
        markdownSource={currentMd.sourceByLanguage?.[language]}
        markdownFileName={markdownFileName(mdPathFor(currentMd.config, language))}
        sourceActionLabels={{
          copy: labels.mdCopyLabel,
          copied: labels.mdCopiedLabel,
          copyError: labels.mdCopyErrorLabel,
          download: labels.mdDownloadLabel,
        }}
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
        fullscreenEnabled={resolveInlineFullscreen({ isUrlFullscreen, enabled: currentHtml.fullscreenEnabled })}
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
        mediaExclusivePlayback={data.config.site.mediaExclusivePlayback}
        fullscreenEnabled={resolveInlineFullscreen({ isUrlFullscreen, enabled: currentVideo.fullscreenEnabled })}
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
        fullscreenEnabled={resolveInlineFullscreen({ isUrlFullscreen, enabled: currentAudio.fullscreenEnabled })}
        {...fullscreenLabels}
        browseNav={audioBrowseNav}
        controlsConfig={navigation.audioRouteControlsConfig}
        onFullscreenOpen={audioFullscreenOpen}
        onFullscreenClose={onFullscreenClose}
      />
    ) : null,
    pdf: currentPdf ? (
      <PdfContainer
        key="pdf"
        pathPdf={currentPdf.pathPdfByLanguage[language] ?? ""}
        language={language}
        config={currentPdf.config}
        isDarkMode={isDarkMode}
        sitePdf={data.config.site.pdf}
        langmenu={langmenu}
        fullscreenEnabled={resolveInlineFullscreen({ isUrlFullscreen, enabled: currentPdf.fullscreenEnabled })}
        {...fullscreenLabels}
        browseNav={pdfBrowseNav}
      />
    ) : null,
  };

  return <div className={styles.contentBlocksStack}>{types.map((type) => blocks[type])}</div>;
}
