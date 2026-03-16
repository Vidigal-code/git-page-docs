"use client";

import type {
  ContentTypeRouteConfig,
  LanguageCode,
  LoadedDocsData,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedPage,
  LoadedVideoContent,
  RouteConfig,
} from "@/entities/docs/model/types";
import { getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import type { BrowseItem } from "@/widgets/docs-shell/model/use-docs-shell-navigation-state";
import { HtmlContainer, MdContainer, VideoContainer } from "./content-type-containers";
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
  fullscreenCloseLabel: string;
  fullscreenExpandLabel: string;
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel?: string;
  browseNextLabel?: string;
  mdBrowseIndex: number;
  htmlBrowseIndex: number;
  videoBrowseIndex: number;
  setMdBrowseIndex: (v: number | ((p: number) => number)) => void;
  setHtmlBrowseIndex: (v: number | ((p: number) => number)) => void;
  setVideoBrowseIndex: (v: number | ((p: number) => number)) => void;
  mdItems: BrowseItem<LoadedMdContent>[];
  htmlItems: BrowseItem<LoadedHtmlContent>[];
  videoItems: BrowseItem<LoadedVideoContent>[];
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
  setMdBrowseIndex,
  setHtmlBrowseIndex,
  setVideoBrowseIndex,
  mdItems,
  htmlItems,
  videoItems,
}: PageContentAreaProps) {
  if (!currentPage) {
    const fallbackHtml = data.docs?.[0]?.markdownByLanguage[language] ?? "<p>Document not found.</p>";
    return (
      <article className={styles.card}>
        <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
      </article>
    );
  }

  const hierarchy = data.config.hierarchyPage ?? { md: 0, html: 1, video: 2 };
  const types = (["md", "html", "video"] as const)
    .filter((t) => currentPage[t])
    .sort((a, b) => (hierarchy[a] ?? 999) - (hierarchy[b] ?? 999));

  const mdConfig = currentPage.md?.config;
  const htmlConfig = currentPage.html?.config;
  const videoConfig = currentPage.video?.config;
  const mdBrowseAll = isBrowseAllEnabled(mdConfig);
  const htmlBrowseAll = isBrowseAllEnabled(htmlConfig);
  const videoBrowseAll = isBrowseAllEnabled(videoConfig);

  const currentMd = mdBrowseAll && mdItems.length > 0
    ? mdItems[Math.min(mdBrowseIndex, mdItems.length - 1)]?.content
    : currentPage.md;
  const currentHtml = htmlBrowseAll && htmlItems.length > 0
    ? htmlItems[Math.min(htmlBrowseIndex, htmlItems.length - 1)]?.content
    : currentPage.html;
  const currentVideo = videoBrowseAll && videoItems.length > 0
    ? videoItems[Math.min(videoBrowseIndex, videoItems.length - 1)]?.content
    : currentPage.video;

  const mdLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuMd", "Markdown");
  const htmlLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuHtml", "Pages");
  const videoLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "titleHeaderMenuVideo", "Video");

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
              fullscreenEnabled={currentMd.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              browseNav={mdBrowseNav}
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
              fullscreenEnabled={currentHtml.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              browseNav={htmlBrowseNav}
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
              fullscreenEnabled={currentVideo.fullscreenEnabled}
              fullscreenExpandLabel={fullscreenExpandLabel}
              fullscreenCloseLabel={fullscreenCloseLabel}
              browseNav={videoBrowseNav}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
