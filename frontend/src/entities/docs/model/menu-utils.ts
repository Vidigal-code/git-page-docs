import type {
  ContentType,
  ContentTypeRouteConfig,
  LanguageCode,
  LoadedDocsData,
} from "@/entities/docs/model/types";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";

/** Config sections whose routes resolve to a `page:<id>` path click. */
type PageRoutesKey = "routes-source-viewer" | "routes-video" | "routes-audio";

const PAGE_ROUTES_KEY_BY_CONTENT_TYPE: Partial<Record<ContentType, PageRoutesKey>> = {
  "source-viewer": "routes-source-viewer",
  video: "routes-video",
  audio: "routes-audio",
};

export function getRouteIndexByPath(data: LoadedDocsData, language: LanguageCode, filePath: string): number {
  return data.config.routes.findIndex((route) => route.path[language] === filePath);
}

function getOrderedContentTypes(data: LoadedDocsData): ContentType[] {
  const hierarchy = data.config.hierarchyPage ?? DEFAULT_HIERARCHY;
  return (["md", "source-viewer", "html", "video", "audio"] as ContentType[]).sort(
    (a, b) => (hierarchy[a] ?? 999) - (hierarchy[b] ?? 999),
  );
}

/** Value for the language, then English, then whichever language is declared first. */
function getLocalizedValue(record: Record<string, string> | undefined, language: LanguageCode): string | undefined {
  return record?.[language] ?? record?.en ?? Object.values(record ?? {})[0];
}

function getRoutePath(route: { path?: Record<string, string> }, language: LanguageCode): string | undefined {
  return getLocalizedValue(route.path, language);
}

function toUrlPathClick(url: string | undefined): string | undefined {
  return url ? `url:${url}` : undefined;
}

/** HTML routes may point at an external URL instead of a local file. */
function getHtmlPathClick(route: ContentTypeRouteConfig, language: LanguageCode): string | undefined {
  return getRoutePath(route, language) ?? toUrlPathClick(getLocalizedValue(route.url, language));
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
    return getHtmlPathClick(page.html.config, language);
  }
  if (contentType === "source-viewer" && page.sourceViewer) {
    return `page:${page.sourceViewer.routeId}`;
  }
  if (contentType === "video" && page.video) {
    return `page:${page.video.routeId}`;
  }
  if (contentType === "audio" && page.audio) {
    return `page:${page.audio.routeId}`;
  }

  return undefined;
}

/** Path click for a route id straight from the config sections, when no loaded page carries it. */
function findPathClickInConfigRoutes(
  data: LoadedDocsData,
  routeId: number,
  contentType: ContentType,
  language: LanguageCode,
): string | undefined {
  if (contentType === "md") {
    return findPathInRoutes(data.config["routes-md"] ?? data.config.routes, routeId, language);
  }
  if (contentType === "html") {
    const route = data.config["routes-html"]?.find((candidate) => candidate.id === routeId);
    return route ? getHtmlPathClick(route, language) : undefined;
  }
  const routesKey = PAGE_ROUTES_KEY_BY_CONTENT_TYPE[contentType];
  const hasRoute = routesKey ? data.config[routesKey]?.some((route) => route.id === routeId) : false;
  return hasRoute ? `page:${routeId}` : undefined;
}

export function getPathClickByRouteId(
  data: LoadedDocsData,
  routeId: number,
  language: LanguageCode,
): string | null {
  const orderedContentTypes = getOrderedContentTypes(data);
  const pageIndex = data.pages?.findIndex((page) => page.id === routeId) ?? -1;
  if (pageIndex >= 0) {
    for (const contentType of orderedContentTypes) {
      const pathClick = findPathClickByPageAndType(data, pageIndex, contentType, language);
      if (pathClick) return pathClick;
    }
  }

  for (const contentType of orderedContentTypes) {
    const pathClick = findPathClickInConfigRoutes(data, routeId, contentType, language);
    if (pathClick) return pathClick;
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
    const sourceViewerPath = page.sourceViewer ? [page.sourceViewer.sourceViewerPath, `page:${page.sourceViewer.routeId}`] : [];
    const videoPath = page.video ? Object.values(page.video.pathVideoByLanguage ?? {}) : [];
    const audioPath = page.audio ? Object.values(page.audio.pathAudioByLanguage ?? {}) : [];
    return [...mdPath, ...sourceViewerPath, ...htmlPath, ...htmlUrl, ...videoPath, ...audioPath].includes(normalizedPathClick);
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
