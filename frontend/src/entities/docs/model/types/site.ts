import type { IconConfigFields } from "@/shared/lib/icons/icon-config-fields";

/**
 * Any language code a site may ship ("pt", "en" and "es" are the bundled ones).
 * Deliberately open: `Record<LanguageCode, string>` must accept any language so
 * sites can add one without touching the frontend types. The template-literal
 * form keeps the domain name distinct from a bare `string` alias.
 */
export type LanguageCode = `${string}`;

export type ThemeMode = "light" | "dark";

export interface SiteConfig extends IconConfigFields<StandardIconName> {
  name: string;
  defaultLanguage: LanguageCode;
  /**
   * Enable (true) / disable (false) each language, in menu order. A disabled
   * language is hidden from the selector and its langs/<lang>.json is skipped.
   */
  languages?: Record<LanguageCode, boolean>;
  /** The languages whose gitpagedocs/langs/<lang>.json loaded; legacy configs may list it inline. */
  supportedLanguages?: LanguageCode[];
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
  /** Header brand icon: single-image and per-mode aliases beside the standard IconImageMenuHeader* fields */
  IconImageMenuHeader?: string;
  IconImageMenuHeaderLight?: string;
  IconImageMenuHeaderDark?: string;
  /** Version links icon: extra per-mode aliases beside the standard IconVersionLinks* fields */
  IconVersionLinksLight?: string;
  IconVersionLinksHeaderDark?: string;
  /** Info header menu icon: extra per-mode aliases beside the standard IconInfoHeaderMenu* fields */
  IconInfoHeaderMenuLight?: string;
  IconInfoHeaderMenuHeaderDark?: string;
  /** Preview project link icon: extra per-mode aliases beside the standard IconPreviewProjectLink* fields */
  IconPreviewProjectLinkLight?: string;
  IconPreviewProjectLinkHeaderDark?: string;
  /** If true, show breadcrumb (icon > ancestor > current) above MD container */
  RouteGuide?: boolean;
  /** Route guide breadcrumb icon: declared inline because its dimensions are numbers, unlike IconConfigFields */
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
  /** Background music: when true, advance to next track when current ends (native tracks only) */
  audioSequentialPlayback?: boolean;
  /** Background music: site-level tracks (used when no per-page audio) */
  audioTracks?: { url: string; type: string; title?: Record<string, string> }[];
  /** Header play/pause buttons: react icon only (no image or dimension fields) */
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

  /** AI Chat toggle: enable/disable entirely */
  AiChatEnabled?: boolean;

  /** Documentation-wide password gate. When enabled with a publicKey, the
   * frontend blocks all docs until the visitor enters the password or private key. */
  docsAccess?: {
    enabled?: boolean;
    publicKey?: string;
  };

  /** If true, hide the "File: ID" line in the audio popover Now playing block */
  audioPopoverHideSource?: boolean;
  /** Custom source label for all tracks (Record<pt|en|es, string>). Empty = use track ID or track.sourceLabel */
  audioPopoverSourceCustomLabel?: Record<string, string>;
  /** If true, show elapsed time / duration (minutes:seconds) for native tracks */
  audioPopoverShowMinutes?: boolean;
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
  /** UI strings per language; assembled from the gitpagedocs/langs/<lang>.json files `languages` enables, or read inline from legacy configs. */
  langmenu: Record<LanguageCode, Record<LanguageCode, string>>;
}

export type { IconConfigFields };

/**
 * Icon slots `SiteConfig` configures through the standard nine `Icon<Name>*`
 * fields of `IconConfigFields` (light/dark image, react-icon toggle, tag,
 * per-mode colors, size and image dimensions). Each name here stands for one
 * such group; slots with a different shape stay declared inline above.
 */
export type StandardIconName =
  /** Header brand icon */
  | "ImageMenuHeader"
  /** Project link icon */
  | "ProjectLink"
  /** Version links icon */
  | "VersionLinks"
  /** Info header menu icon */
  | "InfoHeaderMenu"
  /** Preview project link icon */
  | "PreviewProjectLink"
  /** Nav menu toggle: open button icon */
  | "NavMenuOpen"
  /** Nav menu toggle: close button icon */
  | "NavMenuClose"
  /** Nav menu mobile drawer: open button / hamburger (override; falls back to IconNavMenuOpen) */
  | "NavMenuMobileOpen"
  /** Nav menu mobile drawer: close button (override; falls back to IconNavMenuClose) */
  | "NavMenuMobileClose"
  /** Sidebar toggle: collapse icon */
  | "SidebarCollapse"
  /** Sidebar toggle: expand icon */
  | "SidebarExpand"
  /** Documentation lock button (clears the access cache to re-block the docs) */
  | "DocsLock"
  /** Block menu on nav toggle: active (blocking) state icon */
  | "NavMenuBlockActive"
  /** Block menu on nav toggle: inactive state icon */
  | "NavMenuBlockInactive"
  /** Audio player popover (choose track): close button icon */
  | "AudioPlayerPopoverClose"
  /** Audio player popover: play button icon */
  | "AudioPlayerPopoverPlay"
  /** Audio player popover: pause button icon */
  | "AudioPlayerPopoverPause"
  /** Audio player popover: restart button icon */
  | "AudioPlayerPopoverRestart"
  /** Audio player popover: loop on icon */
  | "AudioPlayerPopoverLoopOn"
  /** Audio player popover: loop off icon */
  | "AudioPlayerPopoverLoopOff"
  /** AI Chat toggle: open icon */
  | "AiChatOpen"
  /** AI Chat toggle: close icon */
  | "AiChatClose"
  /** AI Chat: settings icon */
  | "AiChatSettings"
  /** AI Chat: send button icon */
  | "AiChatSend"
  /** AI Chat: cancel generation icon */
  | "AiChatCancel"
  /** AI Chat: trash/clear icon */
  | "AiChatTrash"
  /** AI Chat: clear chat icon */
  | "AiChatClearChat"
  /** AI Chat: clear data icon */
  | "AiChatClearData"
  /** AI Chat: expand to popup mode icon */
  | "AiChatExpand"
  /** AI Chat: collapse to drawer mode icon */
  | "AiChatCollapse";

export interface UiTranslationEntry {
  [language: string]: string;
}

/** A type alias (not an interface) so it stays assignable to the tools' inline-translations shape. */
export type UiTranslationsConfig = {
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
};
