import type { ContentType, ContentTypeRouteConfig, RouteAuthorizationConfig, RouteConfig } from "./config";
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
  /** Original markdown text per language (only languages whose file was read), for copy/download. */
  sourceByLanguage?: Record<LanguageCode, string>;
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

export interface LoadedSourceViewerContent {
  routeId: number;
  config: ContentTypeRouteConfig;
  sourceViewerPath: string;
  fullscreenEnabled?: boolean;
}

export interface LoadedPage {
  id: number;
  authorization?: RouteAuthorizationConfig;
  blocks?: LoadedContentBlock[];
  md?: LoadedMdContent;
  sourceViewer?: LoadedSourceViewerContent;
  html?: LoadedHtmlContent;
  video?: LoadedVideoContent;
  audio?: LoadedAudioContent;
  pdf?: LoadedPdfContent;
}

export type LoadedContentBlock =
  | { id: string; type: "md"; content: LoadedMdContent }
  | { id: string; type: "html"; content: LoadedHtmlContent }
  | { id: string; type: "video"; content: LoadedVideoContent }
  | { id: string; type: "audio"; content: LoadedAudioContent }
  | { id: string; type: "pdf"; content: LoadedPdfContent };

export interface LoadedPdfContent {
  routeId: number;
  config: ContentTypeRouteConfig;
  pathPdfByLanguage: Record<LanguageCode, string>;
  fullscreenEnabled?: boolean;
}

export interface PathToPageEntry {
  pageIndex: number;
  contentType: ContentType;
}
