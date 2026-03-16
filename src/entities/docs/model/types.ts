export type LanguageCode = "pt" | "en" | "es" | string;

export interface SiteConfig {
  name: string;
  defaultLanguage: LanguageCode;
  HideThemeSelector: boolean;
  ThemeDefault: string;
  ThemeModeDefault?: ThemeMode;
  ProjectLink?: string;
  docsVersion?: string;
  ActiveNavigation?: boolean;
  FocusMode?: boolean;
  FooterEnabled?: boolean;
  FooterLinkName?: string;
  FooterLinkUrl?: string;
  FooterDateMode?: "browser" | "year" | "custom";
  FooterDateCustom?: string;
  SiteIconPath?: string;
  SiteHeaderName?: string;
  IconImageMenuHeaderImgWidth?: string | number;
  IconImageMenuHeaderImgHeight?: string | number;
  IconImageMenuHeader?: string;
  IconImageMenuHeaderLightImg?: string;
  IconImageMenuHeaderDarkImg?: string;
  IconImageMenuHeaderLight?: string;
  IconImageMenuHeaderDark?: string;
  IconImageMenuHeaderReactIcones?: boolean;
  IconImageMenuHeaderReactIconesTag?: string;
  IconImageMenuHeaderReactIconesTagColorDark?: string;
  IconImageMenuHeaderReactIconesTagColorLight?: string;
  IconImageMenuHeaderReactIconesTagSize?: string;
  IconProjectLinkLightImg?: string;
  IconProjectLinkDarkImg?: string;
  IconProjectLinkImgWidth?: string | number;
  IconProjectLinkImgHeight?: string | number;
  IconProjectLinkReactIcones?: boolean;
  IconProjectLinkReactIconesTag?: string;
  IconProjectLinkReactIconesTagColorDark?: string;
  IconProjectLinkReactIconesTagColorLight?: string;
  IconProjectLinkReactIconesTagSize?: string;
  IconVersionLinksLightImg?: string;
  IconVersionLinksDarkImg?: string;
  IconVersionLinksImgWidth?: string | number;
  IconVersionLinksImgHeight?: string | number;
  IconVersionLinksLight?: string;
  IconVersionLinksHeaderDark?: string;
  IconVersionLinksReactIcones?: boolean;
  IconVersionLinksReactIconesTag?: string;
  IconVersionLinksReactIconesTagColorDark?: string;
  IconVersionLinksReactIconesTagColorLight?: string;
  IconVersionLinksReactIconesTagSize?: string;
  IconInfoHeaderMenuLightImg?: string;
  IconInfoHeaderMenuDarkImg?: string;
  IconInfoHeaderMenuImgWidth?: string | number;
  IconInfoHeaderMenuImgHeight?: string | number;
  IconInfoHeaderMenuLight?: string;
  IconInfoHeaderMenuHeaderDark?: string;
  IconInfoHeaderMenuReactIcones?: boolean;
  IconInfoHeaderMenuReactIconesTag?: string;
  IconInfoHeaderMenuReactIconesTagColorDark?: string;
  IconInfoHeaderMenuReactIconesTagColorLight?: string;
  IconInfoHeaderMenuReactIconesTagSize?: string;
  IconPreviewProjectLinkLightImg?: string;
  IconPreviewProjectLinkDarkImg?: string;
  IconPreviewProjectLinkImgWidth?: string | number;
  IconPreviewProjectLinkImgHeight?: string | number;
  IconPreviewProjectLinkLight?: string;
  IconPreviewProjectLinkHeaderDark?: string;
  IconPreviewProjectLinkReactIcones?: boolean;
  IconPreviewProjectLinkReactIconesTag?: string;
  IconPreviewProjectLinkReactIconesTagColorDark?: string;
  IconPreviewProjectLinkReactIconesTagColorLight?: string;
  IconPreviewProjectLinkReactIconesTagSize?: string;
  layoutsConfigPathOficial?: boolean;
  layoutsConfigPathOficialUrl?: string;
  layoutsConfigPathTemplatesOficial?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
  repositorySearchHome?: boolean;
  rendering: string;
  langmenu: Record<LanguageCode, Record<LanguageCode, string>>;
}

export type ContentType = "md" | "html" | "video";

export type VideoType =
  | "youtube"
  | "vimeo"
  | "linkedin"
  | "instagram"
  | "x"
  | "tiktok"
  | "mp4"
  | "webm"
  | "ogg"
  | "avi"
  | "mp3"
  | "wav";

export interface HierarchyConfig {
  md: number;
  html: number;
  video: number;
}

export interface VideoRouteConfig {
  videoType: Record<LanguageCode, string>;
  pathVideo: Record<LanguageCode, string>;
}

export interface ContentTypeRouteConfig {
  id: number;
  title?: Record<LanguageCode, string>;
  titleCss?: string;
  titleDarkCss?: string;
  titleLightCss?: string;
  titlePosition?: string;
  titleIsVisible?: boolean;
  description?: Record<LanguageCode, string>;
  descriptionCss?: string;
  descriptionDarkCss?: string;
  descriptionLightCss?: string;
  descriptionPosition?: string;
  descriptionIsVisible?: boolean;
  path?: Record<LanguageCode, string>;
  video?: VideoRouteConfig;
  fullscreenEnabled?: boolean;
  /** CSS value (e.g. "16px", "1rem"). When empty, uses default. Controls container margin-top. */
  marginTop?: string;
  /** CSS value (e.g. "16px", "1rem"). When empty, uses default. Controls container margin-bottom. */
  marginBottom?: string;
  /** If true (default), HTML links open in new tab. If false, render in same context. */
  blockLink?: boolean;
  /** "full" = auto-extend height; number = fixed height in px with overflow auto. */
  container?: "full" | number;
  /** For routes-html: external URL per language. When set, iframe uses src instead of srcDoc. */
  url?: Record<LanguageCode, string>;
  /** If true, container shows prev/next buttons to browse all items of that type. */
  browseAll?: boolean;
}

export interface RouteConfig {
  id: number;
  path: Record<LanguageCode, string>;
}

export interface HeaderMenuItem {
  id: number;
  submenus?: HeaderMenuItem[];
  [language: string]: number | HeaderMenuLocalizedContent | HeaderMenuItem[] | undefined;
}

export interface HeaderMenuLocalizedContent {
  title: string;
  "path-click": string;
  submenus?: HeaderMenuLocalizedContent[];
}

export interface GitPageDocsConfig {
  site: SiteConfig;
  routes: RouteConfig[];
  "menus-header": HeaderMenuItem[];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "menus-header-md"?: HeaderMenuItem[];
  "menus-header-html"?: HeaderMenuItem[];
  "menus-header-video"?: HeaderMenuItem[];
  hierarchyPage?: HierarchyConfig;
  hierarchyMenu?: HierarchyConfig;
  VersionControl?: VersionControlConfig;
  translations?: UiTranslationsConfig;
}

export interface VersionEntry {
  id: string;
  path: string;
  PathConfig?: string;
  ProjectLink?: string;
  PreviewProject?: string;
  UpdateDate?: string;
  branch?: string;
  release?: string;
  commit?: string;
}

export interface VersionControlConfig {
  versions: VersionEntry[];
}

export interface UiTranslationEntry {
  [language: string]: string;
}

export interface UiTranslationsConfig {
  notFound?: {
    title?: UiTranslationEntry;
    description?: UiTranslationEntry;
    returnHome?: UiTranslationEntry;
  };
  navigation?: {
    previous?: UiTranslationEntry;
    next?: UiTranslationEntry;
    menuOpen?: UiTranslationEntry;
    menuClose?: UiTranslationEntry;
    browsePrev?: UiTranslationEntry;
    browseNext?: UiTranslationEntry;
  };
  footer?: {
    footerLabel?: UiTranslationEntry;
  };
}

export type ThemeMode = "light" | "dark";

export interface LayoutItem {
  id: string;
  name: string;
  author: string;
  file: string;
  preview: string;
  supportsLightAndDarkModes: boolean;
  supportsLightAndDarkModesReference?: string;
  mode: ThemeMode;
}

export interface LayoutsConfig {
  layouts: LayoutItem[];
}

export interface ThemeTemplate {
  id: string;
  name: string;
  author: string;
  version: string;
  mode: ThemeMode;
  supportsLightAndDarkModes: boolean;
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
  components: Record<string, unknown>;
  animations: Record<string, unknown>;
}

export interface DocsContent {
  routeId: number;
  markdownByLanguage: Record<LanguageCode, string>;
}

export interface LoadedMdContent {
  routeId: number;
  config: ContentTypeRouteConfig | RouteConfig;
  markdownByLanguage: Record<LanguageCode, string>;
  fullscreenEnabled?: boolean;
}

export interface LoadedHtmlContent {
  routeId: number;
  config: ContentTypeRouteConfig;
  htmlByLanguage: Record<LanguageCode, string>;
  fullscreenEnabled?: boolean;
}

export interface LoadedVideoContent {
  routeId: number;
  config: ContentTypeRouteConfig;
  videoTypeByLanguage: Record<LanguageCode, string>;
  pathVideoByLanguage: Record<LanguageCode, string>;
  fullscreenEnabled?: boolean;
}

export interface LoadedPage {
  id: number;
  md?: LoadedMdContent;
  html?: LoadedHtmlContent;
  video?: LoadedVideoContent;
}

export interface PathToPageEntry {
  pageIndex: number;
  contentType: ContentType;
}

export interface LoadedDocsData {
  config: GitPageDocsConfig;
  docs: DocsContent[];
  pages: LoadedPage[];
  pathToPageMap: Record<string, PathToPageEntry>;
  showRepositorySearchHome?: boolean;
  availableVersions: VersionEntry[];
  activeVersionId?: string;
  activeVersion?: VersionEntry;
  activeRepository: {
    owner?: string;
    repo?: string;
    requested?: boolean;
    hasGitPageDocs?: boolean;
    source: "local" | "remote";
  };
  availableLanguages: LanguageCode[];
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}
