export {
  checkRepositoryHasGitPageDocs,
  loadRemoteDocsData,
  parseSupportedLanguage,
  loadStandaloneLayoutsAndThemes,
  fetchOfficialSiteConfig,
  type OfficialSiteConfig,
  type SupportedLanguage,
} from "./api/load-remote-docs-data-client";

export { buildFooterConfigFromData } from "./lib/footer/build-footer-config";
export { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "./lib/i18n/lang-menu";
export { resolveTranslation } from "./lib/i18n/resolve-translation";
export { extractHeadingsFromHtml, type HeadingItem } from "./lib/markdown/extract-headings";
export { hasMarkdownDocument, resolvePageMarkdownHtml, resolvePageMarkdownSource } from "./lib/markdown/resolve-page-markdown";
export { scopeMarkdownHtml, scopeMarkdownId } from "./lib/markdown/scope-markdown-html";
export { useMarkdownContent } from "./lib/markdown/use-markdown-content";
export { usePageMarkdownHtml } from "./lib/markdown/use-page-markdown-html";
export { buildContainerSearchEntries } from "./lib/pagination/container-search-entries";
export { resolveContainerPages, type PaginatedContainer, type ResolvedContainerPages } from "./lib/pagination/resolve-container-pages";
export { buildVersionPath } from "./lib/routing/version-path";
export { resolveThemeByMode } from "./lib/theme/resolve-theme-by-mode";
export { resolveThemeBackground } from "./lib/theme/resolve-theme-background";
export { ThemePreloadScript } from "./ui/theme-preload-script/theme-preload-script";
export {
  SHELL_THEME_CACHE_KEY,
  readCachedShellThemes,
  writeCachedShellThemes,
  type CachedShellThemes,
} from "./lib/theme/theme-cache";
export {
  THEME_CSS_VAR_BY_COLOR,
  toBaseThemeCssVars,
  toDocsShellCssVars,
  toSearchShellCssVars,
} from "./lib/theme/to-css-vars";
export { getEmbedUrl, isNativeAudio, isNativeVideo } from "./lib/video/embed-url";
export { getBackgroundAudioConfig, type ResolvedBackgroundAudioConfig } from "./lib/audio";
export { buildVersionLinkOptions, type VersionLinkOption } from "./lib/version-links";
export { resolvePageHierarchy } from "./lib/hierarchy/resolve-page-hierarchy";

export type * from "./model/types";
export { type MenuNode, type MenuEntry, type BreadcrumbItem, getBreadcrumbTrail } from "./model/menu";
export { getRouteIndexByPath, getPageIndexByPathClick, getPathClickByRouteId, getUrlParamsForPathClick } from "./model/menu-utils";
export type { BrowseItem } from "./model/navigation";
