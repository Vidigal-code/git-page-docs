import type { LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";

export function getRouteIndexByPath(data: LoadedDocsData, language: LanguageCode, filePath: string): number {
  return data.config.routes.findIndex((route) => route.path[language] === filePath);
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

  const routeIdx = data.config.routes.findIndex((r) => {
    const paths = r.path as Record<string, string>;
    return paths && Object.values(paths).includes(pathClick);
  });
  if (routeIdx >= 0) {
    const route = data.config.routes[routeIdx];
    params.set("id", String(route.id));
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
