import type { LanguageCode } from "./site";
import type { VersionControlConfig } from "./version";
import type { SiteConfig, UiTranslationsConfig } from "./site";

export type ContentType = "md" | "html" | "video" | "audio";
export const CONTENT_TYPES: ContentType[] = ["md", "html", "video", "audio"];

export type ExternalAuthProviderType = "authjs" | "clerk" | "firebase" | "jwt";

export interface ExternalAuthProviderConfig {
  type: ExternalAuthProviderType;
  enabled?: boolean;
  sessionEndpoint?: string;
  tokenStorageKey?: string;
  rolesClaimPath?: string;
  authHeaderPrefix?: string;
}

export interface AuthConfig {
  /** Maps access key ids to expected secrets. */
  accessKeys?: Record<string, string>;
  /** Optional localStorage key to persist custom runtime roles. */
  rolesStorageKey?: string;
  providers?: ExternalAuthProviderConfig[];
}

export interface RouteAuthorizationConfig {
  enabled?: boolean;
  /** Key id looked up in auth.accessKeys */
  accessKeyId?: string;
  /** All roles listed here must exist in the current session. */
  requiredRoles?: string[];
  /** When true, at least one configured external provider must authenticate the user. */
  requireExternalAuth?: boolean;
  /** Optional provider allow-list for this route. */
  allowedProviders?: ExternalAuthProviderType[];
}

export interface HierarchyConfig {
  md: number;
  html: number;
  video: number;
  audio?: number;
}

export interface VideoRouteConfig {
  videoType: Record<LanguageCode, string>;
  pathVideo: Record<LanguageCode, string>;
}

export interface AudioRouteConfig {
  audioType: Record<LanguageCode, string>;
  pathAudio: Record<LanguageCode, string>;
}

/** Single track for site.audioTracks or route.audio.tracks (background music player) */
export interface AudioTrackConfig {
  url: string;
  type: string; // mp3 | wav | ogg | aac | m4a | flac | opus | weba | wma | youtube | vimeo | spotify | linkedin | instagram | soundcloud | bandcamp | deezer | x | twitter | tiktok | mp4 | webm
  title?: Record<LanguageCode, string>;
  /** Custom source label per language (override of "File" / "Arquivo" display) */
  sourceLabel?: Record<LanguageCode, string>;
}

/** Per-route background audio (routes-md, routes-html, routes-video) */
export interface PageRouteAudioConfig {
  enabled?: boolean;
  autoPlayOnLoad?: boolean;
  loopEnabled?: boolean;
  allowUserChoice?: boolean;
  /** When true, advance to next track when current ends (native tracks only) */
  sequentialPlayback?: boolean;
  tracks: AudioTrackConfig[];
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
  /** routes-audio: AudioRouteConfig. routes-md/html/video: PageRouteAudioConfig (background music). Discriminate by "tracks" vs "pathAudio". */
  audio?: AudioRouteConfig | PageRouteAudioConfig;
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
  /** If true, show TOC tree of headings (#h1-#h6). If false, hide (for large MD). */
  RouteguideBrand?: boolean;
  /** Specific heading IDs to include in TOC. Empty = all headings. */
  RouteGuideSpeciFicbrand?: string[];
  /** TOC position: "center" | "left" | "right". Desktop only; mobile always center. */
  RouteguideBrandPosition?: "center" | "left" | "right";
  /** If true, TOC on top of content. If false, TOC beside content on desktop. Mobile always on top. */
  RouteguideBrandContainerTop?: boolean;
  /** For routes-video: slug per language for URL identification (e.g. ?videofull=pt&slug=copilot) */
  videoSlug?: Record<LanguageCode, string>;
  /** For routes-audio: slug per language for URL identification (e.g. ?audiofull=pt&slug=...) */
  audioSlug?: Record<LanguageCode, string>;
  /** Route-level authorization rules for access-key, roles and external providers. */
  authorization?: RouteAuthorizationConfig;
  /** Granular content hierarchy override for this specific route. */
  hierarchyPage?: HierarchyConfig;
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
  auth?: AuthConfig;
  routes: RouteConfig[];
  "menus-header": HeaderMenuItem[];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "routes-audio"?: ContentTypeRouteConfig[];
  "menus-header-md"?: HeaderMenuItem[];
  "menus-header-html"?: HeaderMenuItem[];
  "menus-header-video"?: HeaderMenuItem[];
  "menus-header-audio"?: HeaderMenuItem[];
  hierarchyPage?: HierarchyConfig;
  hierarchyMenu?: HierarchyConfig;
  VersionControl?: VersionControlConfig;
  translations?: UiTranslationsConfig;
}
