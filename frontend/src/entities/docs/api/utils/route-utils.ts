import type {
  AudioRouteConfig,
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  RouteConfig,
} from "@/entities/docs/model/types";
import type { LanguageCode } from "@/entities/docs/model/types";

export function hasPath(route: ContentTypeRouteConfig | RouteConfig): route is ContentTypeRouteConfig & { path: Record<LanguageCode, string> } {
  return "path" in route && typeof (route as ContentTypeRouteConfig).path === "object";
}

export function hasVideo(route: ContentTypeRouteConfig): route is ContentTypeRouteConfig & { video: NonNullable<ContentTypeRouteConfig["video"]> } {
  return Boolean(route.video?.pathVideo && route.video?.videoType);
}

/** routes-audio: narrows to AudioRouteConfig (pathAudio, audioType), not PageRouteAudioConfig (tracks) */
export function hasAudio(route: ContentTypeRouteConfig): route is ContentTypeRouteConfig & { audio: AudioRouteConfig } {
  const a = route.audio;
  return Boolean(a && "pathAudio" in a && "audioType" in a && a.pathAudio && a.audioType);
}

export function getLanguagesFromPathRecord(pathRecord: Record<string, string> | undefined): LanguageCode[] {
  if (!pathRecord || typeof pathRecord !== "object") return [];
  return Object.keys(pathRecord);
}

export function getLanguages(
  config: GitPageDocsConfig,
  routesMd: (ContentTypeRouteConfig | RouteConfig)[],
  routesHtml: ContentTypeRouteConfig[],
  routesVideo: ContentTypeRouteConfig[],
  routesAudio?: ContentTypeRouteConfig[],
): LanguageCode[] {
  const firstMd = routesMd[0];
  const firstHtml = routesHtml[0];
  const firstVideo = routesVideo[0];
  const firstAudio = routesAudio?.[0];
  if (firstMd && hasPath(firstMd)) return getLanguagesFromPathRecord(firstMd.path);
  if (firstHtml?.path) return getLanguagesFromPathRecord(firstHtml.path);
  if (firstVideo?.video?.pathVideo) return getLanguagesFromPathRecord(firstVideo.video.pathVideo);
  if (firstAudio && hasAudio(firstAudio)) return getLanguagesFromPathRecord(firstAudio.audio.pathAudio);
  if (config.routes?.[0]?.path) return getLanguagesFromPathRecord(config.routes[0].path);
  return [config.site.defaultLanguage];
}
