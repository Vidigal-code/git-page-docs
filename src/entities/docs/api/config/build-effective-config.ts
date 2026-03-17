import type {
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  RouteConfig,
} from "@/entities/docs/model/types";
import { hasPath } from "../utils/route-utils";
import type { MergedRoutesConfig } from "./merge-version-config";

export interface EffectiveConfigResult {
  effectiveConfig: GitPageDocsConfig;
  sortedIds: number[];
}

export function buildEffectiveConfig(
  baseConfig: GitPageDocsConfig,
  merged: MergedRoutesConfig,
): EffectiveConfigResult {
  const { routesMd, routesHtml, routesVideo, routesAudio, menusHeaderMd, hierarchyPage, hierarchyMenu } = merged;

  const routes = routesMd.filter((r) => hasPath(r)).map((r) => ({ id: r.id, path: r.path! }));
  const menusHeader = menusHeaderMd;

  const effectiveConfig: GitPageDocsConfig = {
    ...baseConfig,
    routes,
    "menus-header": menusHeader,
    "routes-md": routesMd,
    "routes-html": routesHtml,
    "routes-video": routesVideo,
    "routes-audio": routesAudio,
    "menus-header-md": merged.menusHeaderMd,
    "menus-header-html": merged.menusHeaderHtml,
    "menus-header-video": merged.menusHeaderVideo,
    "menus-header-audio": merged.menusHeaderAudio,
    hierarchyPage,
    hierarchyMenu,
  };

  const allIds = new Set<number>();
  routesMd.forEach((r) => allIds.add(r.id));
  routesHtml.forEach((r) => allIds.add(r.id));
  routesVideo.forEach((r) => allIds.add(r.id));
  routesAudio.forEach((r) => allIds.add(r.id));
  const sortedIds = Array.from(allIds).sort((a, b) => a - b);

  return { effectiveConfig, sortedIds };
}
