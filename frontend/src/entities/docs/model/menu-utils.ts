import type {
  ContentType,
  ContentTypeRouteConfig,
  LanguageCode,
  LoadedDocsData,
} from "@/entities/docs/model/types";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";

export function getRouteIndexByPath(data: LoadedDocsData, language: LanguageCode, filePath: string): number {
  return data.config.routes.findIndex((route) => route.path[language] === filePath);
}

function getOrderedContentTypes(data: LoadedDocsData): ContentType[] {
  const hierarchy = data.config.hierarchyPage ?? DEFAULT_HIERARCHY;
  return (["md", "html", "video", "audio"] as ContentType[]).sort(
    (a, b) => (hierarchy[a] ?? 999) - (hierarchy[b] ?? 999),
  );
}

function getRoutePath(route: { path?: Record<string, string> }, language: LanguageCode): string | undefined {
  return route.path?.[language] ?? route.path?.en ?? Object.values(route.path ?? {})[0];
}

function findPathInRoutes(
  routes: Array<ContentTypeRouteConfig | { id: number; path?: Record<string, string> }> | undefined,
  id: number,
  language: LanguageCode,
): string | undefined {
  const route = routes?.find((candidate) => candidate.id === id);
  return route ? getRoutePath(route, language) : undefined;
}

function findPathClickByPageAndType(
  data: LoadedDocsData,
  pageIndex: number,
  contentType: ContentType,
  language: LanguageCode,
): string | undefined {
  const page = data.pages?.[pageIndex];
  if (!page) return undefined;

  if (contentType === "md" && page.md) {
    return getRoutePath(page.md.config, language);
  }
  if (contentType === "html" && page.html) {
    const cfg = page.html.config;
    const htmlPath = getRoutePath(cfg, language);
    const htmlUrl = cfg.url?.[language] ?? cfg.url?.en ?? Object.values(cfg.url ?? {})[0];
    return htmlPath ?? (htmlUrl ? `url:${htmlUrl}` : undefined);
  }
  if (contentType === "video" && page.video) {
    return `page:${page.video.routeId}`;
  }
  if (contentType === "audio" && page.audio) {
    return `page:${page.audio.routeId}`;
  }

  return undefined;
}

export function getPathClickByRouteId(
  data: LoadedDocsData,
  routeId: number,
  language: LanguageCode,
): string | null {
  const pageIndex = data.pages?.findIndex((page) => page.id === routeId) ?? -1;
  if (pageIndex >= 0) {
    for (const contentType of getOrderedContentTypes(data)) {
      const pathClick = findPathClickByPageAndType(data, pageIndex, contentType, language);
      if (pathClick) return pathClick;
    }
  }

  for (const contentType of getOrderedContentTypes(data)) {
    if (contentType === "md") {
      const path = findPathInRoutes(data.config["routes-md"] ?? data.config.routes, routeId, language);
      if (path) return path;
    }
    if (contentType === "html") {
      const route = data.config["routes-html"]?.find((candidate) => candidate.id === routeId);
      const path = route ? getRoutePath(route, language) : undefined;
      const url = route?.url?.[language] ?? route?.url?.en ?? Object.values(route?.url ?? {})[0];
      if (path) return path;
      if (url) return `url:${url}`;
    }
    if (contentType === "video" && data.config["routes-video"]?.some((route) => route.id === routeId)) {
      return `page:${routeId}`;
    }
    if (contentType === "audio" && data.config["routes-audio"]?.some((route) => route.id === routeId)) {
      return `page:${routeId}`;
    }
  }

  return null;
}

export function getPageIndexByPathClick(data: LoadedDocsData, pathClick: string): number {
  const entry = data.pathToPageMap?.[pathClick];
  if (entry) return entry.pageIndex;
  const routeIdx = data.config.routes.findIndex((r) => {
    const paths = r.path as Record<string, string>;
    return paths && Object.values(paths).includes(pathClick);
  });
  if (routeIdx >= 0 && data.pages?.length) {
    const pageId = data.config.routes[routeIdx]?.id;
    const pageIdx = data.pages.findIndex((p) => p.id === pageId);
    return pageIdx >= 0 ? pageIdx : routeIdx;
  }

  const normalizedPathClick = pathClick.startsWith("url:") ? pathClick.slice(4) : pathClick;
  const pageIdx = data.pages?.findIndex((page) => {
    const mdPath = page.md ? Object.values((page.md.config as { path?: Record<string, string> }).path ?? {}) : [];
    const htmlPath = page.html ? Object.values(page.html.config.path ?? {}) : [];
    const htmlUrl = page.html ? Object.values(page.html.config.url ?? {}) : [];
    const videoPath = page.video ? Object.values(page.video.pathVideoByLanguage ?? {}) : [];
    const audioPath = page.audio ? Object.values(page.audio.pathAudioByLanguage ?? {}) : [];
    return [...mdPath, ...htmlPath, ...htmlUrl, ...videoPath, ...audioPath].includes(normalizedPathClick);
  }) ?? -1;
  if (pageIdx >= 0) return pageIdx;

  return routeIdx;
}

function extractSlugFromPath(path: string): string {
  const basename = path.split("/").pop() ?? "";
  return basename.replace(/\.(md|html)$/i, "").toLowerCase();
}

export function getUrlParamsForPathClick(
  data: LoadedDocsData,
  pathClick: string,
  language: LanguageCode,
  existingParams?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(
    existingParams?.toString() ?? (typeof window !== "undefined" ? window.location.search : ""),
  );
  params.set("menu", language);

  const entry = data.pathToPageMap?.[pathClick];
  const page = entry ? data.pages?.[entry.pageIndex] : undefined;
  if (page) {
    params.set("id", String(page.id));
    params.delete("name");
    params.delete("nome");
  } else {
    const slug = extractSlugFromPath(pathClick);
    if (slug) {
      params.set("name", slug);
      params.delete("id");
    }
  }
  return params;
}
