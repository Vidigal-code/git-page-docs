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
export { buildVersionPath } from "./lib/routing/version-path";
export { resolveThemeByMode } from "./lib/theme/resolve-theme-by-mode";
export { toBaseThemeCssVars, toDocsShellCssVars, toSearchShellCssVars } from "./lib/theme/to-css-vars";
export { getEmbedUrl, isNativeAudio, isNativeVideo } from "./lib/video/embed-url";
export { getBackgroundAudioConfig, type ResolvedBackgroundAudioConfig } from "./lib/audio";
export { buildVersionLinkOptions, type VersionLinkOption } from "./lib/version-links";

export type * from "./model/types";
export { type MenuNode, type MenuEntry, type BreadcrumbItem, getBreadcrumbTrail } from "./model/menu";
export { getRouteIndexByPath, getPageIndexByPathClick, getUrlParamsForPathClick } from "./model/menu-utils";
export type { BrowseItem } from "./model/navigation";
