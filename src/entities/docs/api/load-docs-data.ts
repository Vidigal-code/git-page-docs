import type {
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  HierarchyConfig,
  LoadedDocsData,
  RouteConfig,
} from "@/entities/docs/model/types";
import { loadRootConfig } from "./io/config-loader";
import { getLanguages, hasPath } from "./utils/route-utils";
import { resolveActiveVersionId, loadVersionConfig } from "./version/resolve-version";
import { loadLayoutsAndThemes } from "./layouts/load-layouts";
import { loadPages } from "./content/load-pages";
import { resolveDocsSource } from "./resolve-docs-source";

const DEFAULT_HIERARCHY: HierarchyConfig = { md: 0, html: 1, video: 2, audio: 3 };

function isLocalRuntime(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.VERCEL_ENV === "development";
}

export async function loadDocsData(slug: string[] | undefined, selectedVersionId?: string): Promise<LoadedDocsData> {
  const localConfig = await loadRootConfig<GitPageDocsConfig>();
  const {
    source,
    owner,
    repo,
    config: baseConfig,
    hasGitPageDocs,
    showRepositorySearchHome,
    isRepositoryRouteRequest,
  } = await resolveDocsSource(slug, localConfig, selectedVersionId);

  const local = isLocalRuntime();

  const availableVersions = baseConfig.VersionControl?.versions ?? [];
  const activeVersionId = resolveActiveVersionId(availableVersions, selectedVersionId, baseConfig.site.docsVersion);
  const activeVersion = activeVersionId
    ? availableVersions.find((version) => version.id === activeVersionId)
    : undefined;

  let routesMd: (ContentTypeRouteConfig | RouteConfig)[] =
    showRepositorySearchHome || (isRepositoryRouteRequest && !hasGitPageDocs)
      ? []
      : (baseConfig["routes-md"] ?? baseConfig.routes ?? []);
  let routesHtml: ContentTypeRouteConfig[] = baseConfig["routes-html"] ?? [];
  let routesVideo: ContentTypeRouteConfig[] = baseConfig["routes-video"] ?? [];
  let routesAudio: ContentTypeRouteConfig[] = baseConfig["routes-audio"] ?? [];
  let menusHeaderMd = baseConfig["menus-header-md"] ?? baseConfig["menus-header"] ?? [];
  let menusHeaderHtml = baseConfig["menus-header-html"] ?? [];
  let menusHeaderVideo = baseConfig["menus-header-video"] ?? [];
  let menusHeaderAudio = baseConfig["menus-header-audio"] ?? [];
  let hierarchyPage = baseConfig.hierarchyPage ?? DEFAULT_HIERARCHY;
  let hierarchyMenu = baseConfig.hierarchyMenu ?? DEFAULT_HIERARCHY;

  if (activeVersionId) {
    const versionEntry = activeVersion;
    if (versionEntry) {
      const versionConfig = await loadVersionConfig({
        versionEntry,
        source,
        owner,
        repo,
      });
      if (versionConfig) {
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
    }
  }

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
    "menus-header-md": menusHeaderMd,
    "menus-header-html": menusHeaderHtml,
    "menus-header-video": menusHeaderVideo,
    "menus-header-audio": menusHeaderAudio,
    hierarchyPage,
    hierarchyMenu,
  };

  const { layoutsConfig, themes } = await loadLayoutsAndThemes({
    isLocal: local,
    owner,
    repo,
    useOfficialLayouts: effectiveConfig.site.layoutsConfigPathOficial === true,
    officialLayoutsConfigPath: effectiveConfig.site.layoutsConfigPathOficialUrl,
    officialLayoutsTemplatesPath: effectiveConfig.site.layoutsConfigPathTemplatesOficial,
    layoutsConfigPath: effectiveConfig.site.layoutsConfigPath,
    layoutsConfigPathTemplates: effectiveConfig.site.layoutsConfigPathTemplates,
  });

  const languages = getLanguages(effectiveConfig, routesMd, routesHtml, routesVideo, routesAudio);

  const allIds = new Set<number>();
  routesMd.forEach((r) => allIds.add(r.id));
  routesHtml.forEach((r) => allIds.add(r.id));
  routesVideo.forEach((r) => allIds.add(r.id));
  routesAudio.forEach((r) => allIds.add(r.id));
  const sortedIds = Array.from(allIds).sort((a, b) => a - b);

  const { pages, pathToPageMap } = await loadPages({
    sortedIds,
    routesMd,
    routesHtml,
    routesVideo,
    routesAudio,
    languages,
    source,
    owner,
    repo,
  });

  const docs = pages
    .filter((p) => p.md)
    .map((p) => ({
      routeId: p.id,
      markdownByLanguage: p.md!.markdownByLanguage,
    }));

  return {
    config: effectiveConfig,
    docs,
    pages,
    pathToPageMap,
    showRepositorySearchHome,
    availableVersions,
    activeVersionId,
    activeVersion,
    activeRepository: {
      owner,
      repo,
      requested: isRepositoryRouteRequest,
      hasGitPageDocs,
      source,
    },
    availableLanguages: languages,
    layoutsConfig,
    themes,
  };
}
