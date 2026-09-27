import type {
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  HierarchyConfig,
  RouteConfig,
} from "@/entities/docs/model/types";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";
import type { VersionRoutesConfig } from "../version/resolve-version";

export interface MergedRoutesConfig {
  auth: GitPageDocsConfig["auth"];
  routesMd: (ContentTypeRouteConfig | RouteConfig)[];
  routesSourceViewer: ContentTypeRouteConfig[];
  routesHtml: ContentTypeRouteConfig[];
  routesVideo: ContentTypeRouteConfig[];
  routesAudio: ContentTypeRouteConfig[];
  menusHeaderMd: GitPageDocsConfig["menus-header"];
  menusHeaderSourceViewer: GitPageDocsConfig["menus-header"];
  menusHeaderHtml: GitPageDocsConfig["menus-header"];
  menusHeaderVideo: GitPageDocsConfig["menus-header"];
  menusHeaderAudio: GitPageDocsConfig["menus-header"];
  hierarchyPage: HierarchyConfig;
  hierarchyMenu: HierarchyConfig;
}

/** The root config's lists: a present-but-empty list is kept (only absent keys fall through). */
function readBaseRoutesConfig(baseConfig: GitPageDocsConfig): MergedRoutesConfig {
  const defaultHierarchy = DEFAULT_HIERARCHY as HierarchyConfig;
  return {
    auth: baseConfig.auth,
    routesMd: baseConfig["routes-md"] ?? baseConfig.routes ?? [],
    routesSourceViewer: baseConfig["routes-source-viewer"] ?? [],
    routesHtml: baseConfig["routes-html"] ?? [],
    routesVideo: baseConfig["routes-video"] ?? [],
    routesAudio: baseConfig["routes-audio"] ?? [],
    menusHeaderMd: baseConfig["menus-header-md"] ?? baseConfig["menus-header"] ?? [],
    menusHeaderSourceViewer: baseConfig["menus-header-source-viewer"] ?? [],
    menusHeaderHtml: baseConfig["menus-header-html"] ?? [],
    menusHeaderVideo: baseConfig["menus-header-video"] ?? [],
    menusHeaderAudio: baseConfig["menus-header-audio"] ?? [],
    hierarchyPage: baseConfig.hierarchyPage ?? defaultHierarchy,
    hierarchyMenu: baseConfig.hierarchyMenu ?? defaultHierarchy,
  };
}

/** First override that has at least one entry wins; an empty or absent override keeps the current list. */
function pickNonEmpty<T>(current: T[], ...overrides: (T[] | undefined)[]): T[] {
  return overrides.find((list) => list?.length) ?? current;
}

/** A version config only replaces what it actually provides. */
function applyVersionOverrides(base: MergedRoutesConfig, versionConfig: VersionRoutesConfig): MergedRoutesConfig {
  return {
    auth: versionConfig.auth ?? base.auth,
    routesMd: pickNonEmpty(base.routesMd, versionConfig["routes-md"], versionConfig.routes),
    routesSourceViewer: pickNonEmpty(base.routesSourceViewer, versionConfig["routes-source-viewer"]),
    routesHtml: pickNonEmpty(base.routesHtml, versionConfig["routes-html"]),
    routesVideo: pickNonEmpty(base.routesVideo, versionConfig["routes-video"]),
    routesAudio: pickNonEmpty(base.routesAudio, versionConfig["routes-audio"]),
    menusHeaderMd: pickNonEmpty(base.menusHeaderMd, versionConfig["menus-header-md"], versionConfig["menus-header"]),
    menusHeaderSourceViewer: pickNonEmpty(base.menusHeaderSourceViewer, versionConfig["menus-header-source-viewer"]),
    menusHeaderHtml: pickNonEmpty(base.menusHeaderHtml, versionConfig["menus-header-html"]),
    menusHeaderVideo: pickNonEmpty(base.menusHeaderVideo, versionConfig["menus-header-video"]),
    menusHeaderAudio: pickNonEmpty(base.menusHeaderAudio, versionConfig["menus-header-audio"]),
    hierarchyPage: versionConfig.hierarchyPage ?? base.hierarchyPage,
    hierarchyMenu: versionConfig.hierarchyMenu ?? base.hierarchyMenu,
  };
}

export function mergeVersionConfig(
  baseConfig: GitPageDocsConfig,
  versionConfig: VersionRoutesConfig | undefined,
): MergedRoutesConfig {
  const base = readBaseRoutesConfig(baseConfig);
  return versionConfig ? applyVersionOverrides(base, versionConfig) : base;
}
