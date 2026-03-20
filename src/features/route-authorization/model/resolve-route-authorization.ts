import type {
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  LanguageCode,
  LoadedDocsData,
  RouteAuthorizationConfig,
} from "@/entities/docs";
import type { RouteAuthorizationTarget } from "./types";

function getLocalizedTitle(
  route: { title?: Record<string, string> },
  language: LanguageCode,
): string | undefined {
  return route.title?.[language] ?? route.title?.en;
}

function routeHasPathMatch(route: { path?: Record<string, string> }, pathClick: string): boolean {
  if (!route.path) return false;
  return Object.values(route.path).includes(pathClick);
}

function routeHasUrlMatch(route: { url?: Record<string, string> }, pathClick: string): boolean {
  if (!route.url) return false;
  return Object.values(route.url).some((urlValue) => pathClick === urlValue || pathClick === `url:${urlValue}`);
}

function routeHasVideoMatch(route: { video?: { pathVideo: Record<string, string> } }, pathClick: string): boolean {
  if (!route.video) return false;
  return Object.values(route.video.pathVideo).includes(pathClick);
}

function routeHasAudioMatch(route: { audio?: { pathAudio: Record<string, string> } }, pathClick: string): boolean {
  if (!route.audio) return false;
  return Object.values(route.audio.pathAudio).includes(pathClick);
}

function extractAuthorization(route: unknown): RouteAuthorizationConfig | undefined {
  if (!route || typeof route !== "object") return undefined;
  const candidate = route as { authorization?: RouteAuthorizationConfig };
  return candidate.authorization;
}

function toTarget(
  route: ContentTypeRouteConfig,
  contentType: "md" | "html" | "video" | "audio",
  language: LanguageCode,
): RouteAuthorizationTarget {
  return {
    routeId: route.id,
    contentType,
    authorization: extractAuthorization(route),
    title: getLocalizedTitle(route, language),
  };
}

function findById(
  routes: ContentTypeRouteConfig[] | undefined,
  id: number,
  language: LanguageCode,
  contentType: "video" | "audio",
): RouteAuthorizationTarget | undefined {
  if (!routes?.length) return undefined;
  const route = routes.find((candidate) => candidate.id === id);
  if (!route) return undefined;
  return toTarget(route, contentType, language);
}

function findByPath(
  routes: ContentTypeRouteConfig[] | undefined,
  pathClick: string,
  language: LanguageCode,
  contentType: "md" | "html" | "video" | "audio",
): RouteAuthorizationTarget | undefined {
  if (!routes?.length) return undefined;
  const route = routes.find((candidate) => routeHasPathMatch(candidate, pathClick));
  if (!route) return undefined;
  return toTarget(route, contentType, language);
}

function resolvePageRouteTarget(
  config: GitPageDocsConfig,
  pathClick: string,
  language: LanguageCode,
): RouteAuthorizationTarget | undefined {
  const pageMatch = pathClick.match(/^page:(\d+)$/);
  if (!pageMatch) return undefined;
  const routeId = Number.parseInt(pageMatch[1] ?? "", 10);
  if (Number.isNaN(routeId)) return undefined;
  return (
    findById(config["routes-video"], routeId, language, "video") ??
    findById(config["routes-audio"], routeId, language, "audio")
  );
}

export function resolveRouteAuthorizationTarget(
  data: LoadedDocsData,
  pathClick: string,
  language: LanguageCode,
): RouteAuthorizationTarget | undefined {
  const pageTarget = resolvePageRouteTarget(data.config, pathClick, language);
  if (pageTarget) return pageTarget;

  const mdRoutes = (data.config["routes-md"] ?? []).filter(
    (route): route is ContentTypeRouteConfig => "path" in route,
  );
  const mdTarget = findByPath(mdRoutes, pathClick, language, "md");
  if (mdTarget) return mdTarget;

  const htmlRoutes = data.config["routes-html"] ?? [];
  const htmlPathTarget = findByPath(htmlRoutes, pathClick, language, "html");
  if (htmlPathTarget) return htmlPathTarget;
  const htmlUrlRoute = htmlRoutes.find((route) => routeHasUrlMatch(route, pathClick));
  if (htmlUrlRoute) return toTarget(htmlUrlRoute, "html", language);

  const videoRoutes = data.config["routes-video"] ?? [];
  const videoPathTarget = findByPath(videoRoutes, pathClick, language, "video");
  if (videoPathTarget) return videoPathTarget;
  const videoUrlRoute = videoRoutes.find((route) => routeHasVideoMatch(route, pathClick));
  if (videoUrlRoute) return toTarget(videoUrlRoute, "video", language);

  const audioRoutes = data.config["routes-audio"] ?? [];
  const audioPathTarget = findByPath(audioRoutes, pathClick, language, "audio");
  if (audioPathTarget) return audioPathTarget;
  const audioUrlRoute = audioRoutes.find((route) => routeHasAudioMatch(route, pathClick));
  if (audioUrlRoute) return toTarget(audioUrlRoute, "audio", language);

  return undefined;
}
