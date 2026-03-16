import type {
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  HierarchyConfig,
  LoadedDocsData,
  RouteConfig,
} from "@/entities/docs/model/types";
import { readJsonFile } from "./io/file-reader";
import { readRemoteJsonFromRepo } from "./io/remote-fetcher";
import { parseOwnerRepoFromRenderingUrl } from "./utils/url-utils";
import { getLanguages, hasPath } from "./utils/route-utils";
import { resolveActiveVersionId, loadVersionConfig } from "./version/resolve-version";
import { loadLayoutsAndThemes } from "./layouts/load-layouts";
import { loadPages } from "./content/load-pages";

const DEFAULT_CONFIG_PATH = "gitpagedocs/config.json";
const DEFAULT_HIERARCHY: HierarchyConfig = { md: 0, html: 1, video: 2 };

function isLocalRuntime(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.VERCEL_ENV === "development";
}

export async function loadDocsData(slug: string[] | undefined, selectedVersionId?: string): Promise<LoadedDocsData> {
  const localConfig = await readJsonFile<GitPageDocsConfig>(DEFAULT_CONFIG_PATH);
  const local = isLocalRuntime();
  const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
  const repositorySearchEnabledByEnv = process.env.GITPAGEDOCS_REPOSITORY_SEARCH === "true";
  const repositorySearchEnabled = isGithubPagesBuild || repositorySearchEnabledByEnv;
  const renderingRef = parseOwnerRepoFromRenderingUrl(localConfig.site.rendering);
  const projectRef = parseOwnerRepoFromRenderingUrl(localConfig.site.ProjectLink || "");
  const buildRepositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1]?.toLowerCase();
  const isOfficialSearchAggregatorRepo =
    renderingRef.repo?.toLowerCase() === "git-page-docs" ||
    projectRef.repo?.toLowerCase() === "git-page-docs" ||
    buildRepositoryName === "git-page-docs";

  const requestedOwner = slug?.[0];
  const requestedRepo = slug?.[1];
  const isRepositoryRouteRequest = Boolean(repositorySearchEnabled && requestedOwner && requestedRepo);
  const repositorySearchHomeEnabled = (() => {
    if (isGithubPagesBuild && !isOfficialSearchAggregatorRepo) {
      return false;
    }
    if (typeof localConfig.site.repositorySearchHome === "boolean") {
      return localConfig.site.repositorySearchHome;
    }
    if (isGithubPagesBuild) {
      return isOfficialSearchAggregatorRepo;
    }
    return true;
  })();
  const showRepositorySearchHome = Boolean(
    repositorySearchEnabled && repositorySearchHomeEnabled && !requestedOwner && !requestedRepo && !selectedVersionId,
  );
  const renderingFallback = parseOwnerRepoFromRenderingUrl(localConfig.site.rendering);
  const projectLinkFallback = parseOwnerRepoFromRenderingUrl(localConfig.site.ProjectLink || "");

  let source: "local" | "remote" = "local";
  let owner: string | undefined;
  let repo: string | undefined;

  const isLocalRepo = Boolean(
    requestedOwner &&
    requestedRepo &&
    ((requestedOwner.toLowerCase() === projectLinkFallback.owner?.toLowerCase() &&
      requestedRepo.toLowerCase() === projectLinkFallback.repo?.toLowerCase()) ||
      (requestedOwner.toLowerCase() === renderingFallback.owner?.toLowerCase() &&
        requestedRepo.toLowerCase() === renderingFallback.repo?.toLowerCase())),
  );

  if (repositorySearchEnabled && requestedOwner && requestedRepo && !isLocalRepo) {
    source = "remote";
    owner = requestedOwner;
    repo = requestedRepo;
  }

  let config = localConfig;
  let hasGitPageDocs = true;

  if (isLocalRepo) {
    source = "local";
    owner = requestedOwner;
    repo = requestedRepo;
  }
  if (owner && repo) {
    const remoteConfig = await readRemoteJsonFromRepo<GitPageDocsConfig>(owner, repo, DEFAULT_CONFIG_PATH);
    if (remoteConfig) {
      config = remoteConfig;
    } else if (isRepositoryRouteRequest) {
      hasGitPageDocs = false;
      config = localConfig;
    }
  }

  const availableVersions = config.VersionControl?.versions ?? [];
  const activeVersionId = resolveActiveVersionId(availableVersions, selectedVersionId, config.site.docsVersion);
  const activeVersion = activeVersionId
    ? availableVersions.find((version) => version.id === activeVersionId)
    : undefined;

  let routesMd: (ContentTypeRouteConfig | RouteConfig)[] =
    showRepositorySearchHome || (isRepositoryRouteRequest && !hasGitPageDocs)
      ? []
      : (config["routes-md"] ?? config.routes ?? []);
  let routesHtml: ContentTypeRouteConfig[] = config["routes-html"] ?? [];
  let routesVideo: ContentTypeRouteConfig[] = config["routes-video"] ?? [];
  let menusHeaderMd = config["menus-header-md"] ?? config["menus-header"] ?? [];
  let menusHeaderHtml = config["menus-header-html"] ?? [];
  let menusHeaderVideo = config["menus-header-video"] ?? [];
  let hierarchyPage = config.hierarchyPage ?? DEFAULT_HIERARCHY;
  let hierarchyMenu = config.hierarchyMenu ?? DEFAULT_HIERARCHY;

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
        if (versionConfig["menus-header-md"]?.length) menusHeaderMd = versionConfig["menus-header-md"];
        else if (versionConfig["menus-header"]?.length) menusHeaderMd = versionConfig["menus-header"];
        if (versionConfig["menus-header-html"]?.length) menusHeaderHtml = versionConfig["menus-header-html"];
        if (versionConfig["menus-header-video"]?.length) menusHeaderVideo = versionConfig["menus-header-video"];
        if (versionConfig.hierarchyPage) hierarchyPage = versionConfig.hierarchyPage;
        if (versionConfig.hierarchyMenu) hierarchyMenu = versionConfig.hierarchyMenu;
      }
    }
  }

  const routes = routesMd.filter((r) => hasPath(r)).map((r) => ({ id: r.id, path: r.path! }));
  const menusHeader = menusHeaderMd;

  const effectiveConfig: GitPageDocsConfig = {
    ...config,
    routes,
    "menus-header": menusHeader,
    "routes-md": routesMd,
    "routes-html": routesHtml,
    "routes-video": routesVideo,
    "menus-header-md": menusHeaderMd,
    "menus-header-html": menusHeaderHtml,
    "menus-header-video": menusHeaderVideo,
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

  const languages = getLanguages(effectiveConfig, routesMd, routesHtml, routesVideo);

  const allIds = new Set<number>();
  routesMd.forEach((r) => allIds.add(r.id));
  routesHtml.forEach((r) => allIds.add(r.id));
  routesVideo.forEach((r) => allIds.add(r.id));
  const sortedIds = Array.from(allIds).sort((a, b) => a - b);

  const { pages, pathToPageMap } = await loadPages({
    sortedIds,
    routesMd,
    routesHtml,
    routesVideo,
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
