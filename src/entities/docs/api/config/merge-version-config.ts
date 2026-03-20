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
  routesHtml: ContentTypeRouteConfig[];
  routesVideo: ContentTypeRouteConfig[];
  routesAudio: ContentTypeRouteConfig[];
  menusHeaderMd: GitPageDocsConfig["menus-header"];
  menusHeaderHtml: GitPageDocsConfig["menus-header"];
  menusHeaderVideo: GitPageDocsConfig["menus-header"];
  menusHeaderAudio: GitPageDocsConfig["menus-header"];
  hierarchyPage: HierarchyConfig;
  hierarchyMenu: HierarchyConfig;
}

export function mergeVersionConfig(
  baseConfig: GitPageDocsConfig,
  versionConfig: VersionRoutesConfig | undefined,
): MergedRoutesConfig {
  const defaultHierarchy = DEFAULT_HIERARCHY as HierarchyConfig;
  let auth = baseConfig.auth;
  let routesMd = baseConfig["routes-md"] ?? baseConfig.routes ?? [];
  let routesHtml = baseConfig["routes-html"] ?? [];
  let routesVideo = baseConfig["routes-video"] ?? [];
  let routesAudio = baseConfig["routes-audio"] ?? [];
  let menusHeaderMd = baseConfig["menus-header-md"] ?? baseConfig["menus-header"] ?? [];
  let menusHeaderHtml = baseConfig["menus-header-html"] ?? [];
  let menusHeaderVideo = baseConfig["menus-header-video"] ?? [];
  let menusHeaderAudio = baseConfig["menus-header-audio"] ?? [];
  let hierarchyPage = baseConfig.hierarchyPage ?? defaultHierarchy;
  let hierarchyMenu = baseConfig.hierarchyMenu ?? defaultHierarchy;

  if (versionConfig) {
    if (versionConfig.auth) auth = versionConfig.auth;
    if (versionConfig["routes-md"]?.length) routesMd = versionConfig["routes-md"];
    else if (versionConfig.routes?.length) routesMd = versionConfig.routes;
    if (versionConfig["routes-html"]?.length) routesHtml = versionConfig["routes-html"];
    if (versionConfig["routes-video"]?.length) routesVideo = versionConfig["routes-video"];
    if (versionConfig["routes-audio"]?.length) routesAudio = versionConfig["routes-audio"];
    if (versionConfig["menus-header-md"]?.length) menusHeaderMd = versionConfig["menus-header-md"];
    else if (versionConfig["menus-header"]?.length) menusHeaderMd = versionConfig["menus-header"];
    if (versionConfig["menus-header-html"]?.length) menusHeaderHtml = versionConfig["menus-header-html"];
    if (versionConfig["menus-header-video"]?.length) menusHeaderVideo = versionConfig["menus-header-video"];
    if (versionConfig["menus-header-audio"]?.length) menusHeaderAudio = versionConfig["menus-header-audio"];
    if (versionConfig.hierarchyPage) hierarchyPage = versionConfig.hierarchyPage;
    if (versionConfig.hierarchyMenu) hierarchyMenu = versionConfig.hierarchyMenu;
  }

  return {
    auth,
    routesMd,
    routesHtml,
    routesVideo,
    routesAudio,
    menusHeaderMd,
    menusHeaderHtml,
    menusHeaderVideo,
    menusHeaderAudio,
    hierarchyPage,
    hierarchyMenu,
  };
}
