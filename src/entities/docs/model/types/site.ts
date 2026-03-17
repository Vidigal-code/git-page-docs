export type LanguageCode = "pt" | "en" | "es" | string;

export type ThemeMode = "light" | "dark";

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
  /** Nav menu toggle: open button icon */
  IconNavMenuOpenLightImg?: string;
  IconNavMenuOpenDarkImg?: string;
  IconNavMenuOpenReactIcones?: boolean;
  IconNavMenuOpenReactIconesTag?: string;
  IconNavMenuOpenReactIconesTagColorDark?: string;
  IconNavMenuOpenReactIconesTagColorLight?: string;
  IconNavMenuOpenReactIconesTagSize?: string;
  IconNavMenuOpenImgWidth?: string | number;
  IconNavMenuOpenImgHeight?: string | number;
  /** Nav menu toggle: close button icon */
  IconNavMenuCloseLightImg?: string;
  IconNavMenuCloseDarkImg?: string;
  IconNavMenuCloseReactIcones?: boolean;
  IconNavMenuCloseReactIconesTag?: string;
  IconNavMenuCloseReactIconesTagColorDark?: string;
  IconNavMenuCloseReactIconesTagColorLight?: string;
  IconNavMenuCloseReactIconesTagSize?: string;
  IconNavMenuCloseImgWidth?: string | number;
  IconNavMenuCloseImgHeight?: string | number;
  /** Block menu on nav toggle: active (blocking) state icon */
  IconNavMenuBlockActiveLightImg?: string;
  IconNavMenuBlockActiveDarkImg?: string;
  IconNavMenuBlockActiveReactIcones?: boolean;
  IconNavMenuBlockActiveReactIconesTag?: string;
  IconNavMenuBlockActiveReactIconesTagColorDark?: string;
  IconNavMenuBlockActiveReactIconesTagColorLight?: string;
  IconNavMenuBlockActiveReactIconesTagSize?: string;
  IconNavMenuBlockActiveImgWidth?: string | number;
  IconNavMenuBlockActiveImgHeight?: string | number;
  /** Block menu on nav toggle: inactive state icon */
  IconNavMenuBlockInactiveLightImg?: string;
  IconNavMenuBlockInactiveDarkImg?: string;
  IconNavMenuBlockInactiveReactIcones?: boolean;
  IconNavMenuBlockInactiveReactIconesTag?: string;
  IconNavMenuBlockInactiveReactIconesTagColorDark?: string;
  IconNavMenuBlockInactiveReactIconesTagColorLight?: string;
  IconNavMenuBlockInactiveReactIconesTagSize?: string;
  IconNavMenuBlockInactiveImgWidth?: string | number;
  IconNavMenuBlockInactiveImgHeight?: string | number;
  /** If true, show breadcrumb (icon > ancestor > current) above MD container */
  RouteGuide?: boolean;
  IconRouteGuideLightImg?: string;
  IconRouteGuideDarkImg?: string;
  IconRouteGuideReactIcones?: boolean;
  IconRouteGuideReactIconesTag?: string;
  IconRouteGuideReactIconesTagColorDark?: string;
  IconRouteGuideReactIconesTagColorLight?: string;
  IconRouteGuideReactIconesTagSize?: string;
  IconRouteGuideImgWidth?: number;
  IconRouteGuideImgHeight?: number;
  /** Default TOC position when RouteguideBrand is true. "center" | "left" | "right" */
  RouteguideBrandPositionDefault?: "center" | "left" | "right";
  /** Default for RouteguideBrandContainerTop when not set per route. If false, TOC beside content on desktop. */
  RouteguideBrandContainerTopDefault?: boolean;
  /** Background music player: enable play/pause button in header */
  audioPlayerEnabled?: boolean;
  /** Background music: autoplay on page load (browser may block) */
  audioAutoPlayOnLoad?: boolean;
  /** Background music: loop current track */
  audioLoopEnabled?: boolean;
  /** Background music: allow user to choose track from playlist (when 2+ tracks) */
  audioAllowUserChoice?: boolean;
  /** Background music: site-level tracks (used when no per-page audio) */
  audioTracks?: { url: string; type: string; title?: Record<string, string> }[];
  IconAudioPlayReactIcones?: boolean;
  IconAudioPlayReactIconesTag?: string;
  IconAudioPlayReactIconesTagColorDark?: string;
  IconAudioPlayReactIconesTagColorLight?: string;
  IconAudioPlayReactIconesTagSize?: string;
  IconAudioPauseReactIcones?: boolean;
  IconAudioPauseReactIconesTag?: string;
  IconAudioPauseReactIconesTagColorDark?: string;
  IconAudioPauseReactIconesTagColorLight?: string;
  IconAudioPauseReactIconesTagSize?: string;
  /** TOC scroll max-height desktop, e.g. "min(65vh, 400px)" */
  TocScrollMaxHeightDesktop?: string;
  /** TOC scroll max-height mobile, e.g. "220px" */
  TocScrollMaxHeightMobile?: string;
  layoutsConfigPathOficial?: boolean;
  layoutsConfigPathOficialUrl?: string;
  layoutsConfigPathTemplatesOficial?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
  repositorySearchHome?: boolean;
  rendering: string;
  langmenu: Record<LanguageCode, Record<LanguageCode, string>>;
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
