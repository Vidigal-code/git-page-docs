import type { ContentType, ContentTypeRouteConfig, RouteConfig } from "./config";
import type { LanguageCode } from "./site";

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

export interface LoadedAudioContent {
  routeId: number;
  config: ContentTypeRouteConfig;
  audioTypeByLanguage: Record<LanguageCode, string>;
  pathAudioByLanguage: Record<LanguageCode, string>;
  fullscreenEnabled?: boolean;
}

export interface LoadedPage {
  id: number;
  md?: LoadedMdContent;
  html?: LoadedHtmlContent;
  video?: LoadedVideoContent;
  audio?: LoadedAudioContent;
}

export interface PathToPageEntry {
  pageIndex: number;
  contentType: ContentType;
}
