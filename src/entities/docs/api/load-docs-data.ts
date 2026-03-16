import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";
import { buildGithubRawCandidates, ensureTrailingSlash, toRawGithubUrl } from "@/entities/docs/lib/remote/github-url";
import {
  type ContentType,
  type ContentTypeRouteConfig,
  type GitPageDocsConfig,
  type HierarchyConfig,
  type LanguageCode,
  type LayoutItem,
  type LayoutsConfig,
  type LoadedDocsData,
  type LoadedHtmlContent,
  type LoadedMdContent,
  type LoadedPage,
  type LoadedVideoContent,
  type PathToPageEntry,
  type RouteConfig,
  type ThemeTemplate,
  type VersionEntry,
} from "@/entities/docs/model/types";

const DEFAULT_CONFIG_PATH = "gitpagedocs/config.json";
const DEFAULT_LAYOUTS_PATH = "gitpagedocs/layouts/layoutsConfig.json";
const DEFAULT_TEMPLATES_BASE_PATH = "gitpagedocs/layouts/";

function parseOwnerRepoFromRenderingUrl(rendering: string): { owner?: string; repo?: string } {
  try {
    const parsed = new URL(rendering);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    return {};
  }
  return {};
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

async function readLocalText(filePath: string): Promise<string | null> {
  if (isBrowser()) {
    try {
      // Normalize path to avoid double slashes and handle base path if necessary
      const baseUrl = window.location.origin;
      const configuredBasePath = process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH?.trim() ?? "";
      const pathPrefix = configuredBasePath && window.location.pathname.startsWith(configuredBasePath) ? configuredBasePath : "";
      const url = `${baseUrl}${pathPrefix}/${filePath.replace(/^\//, "")}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
  try {
    const fullPath = path.join(process.cwd(), filePath);
    return await fs.readFile(fullPath, "utf-8");
  } catch {
    return null;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const text = await readLocalText(filePath);
  if (text === null) {
    throw new Error(`Failed to read local file: ${filePath}`);
  }
  return JSON.parse(text) as T;
}

async function tryReadJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(filePath);
  } catch {
    return null;
  }
}

function isLocalRuntime(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.VERCEL_ENV === "development";
}

async function tryFetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "git-page-docs",
      },
    });
    if (!response.ok) {
      return null;
    }
    return response.text();
  } catch {
    return null;
  }
}

async function readRemoteJson<T>(url: string): Promise<T | null> {
  const rawUrl = toRawGithubUrl(url);
  const text = await tryFetchText(rawUrl);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function readRemoteJsonFromRepo<T>(owner: string, repo: string, relativePath: string): Promise<T | null> {
  const text = await readRemoteText(owner, repo, relativePath);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function buildRepoRawBase(owner: string, repo: string, relativeBasePath: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${ensureTrailingSlash(relativeBasePath)}`;
}

function deriveRemoteTemplatesBaseUrl(
  layoutsConfigPath: string | undefined,
  templatesPathOverride: string | undefined,
  owner: string | undefined,
  repo: string | undefined,
): string | undefined {
  if (templatesPathOverride) {
    return ensureTrailingSlash(toRawGithubUrl(templatesPathOverride));
  }

  if (layoutsConfigPath) {
    const rawUrl = toRawGithubUrl(layoutsConfigPath);
    return ensureTrailingSlash(rawUrl.slice(0, rawUrl.lastIndexOf("/") + 1));
  }

  if (owner && repo) {
    return buildRepoRawBase(owner, repo, DEFAULT_TEMPLATES_BASE_PATH);
  }

  return undefined;
}

function buildRemoteTemplateUrl(layoutFile: string, remoteTemplatesBaseUrl: string): string {
  const normalizedBase = ensureTrailingSlash(remoteTemplatesBaseUrl);
  const basePath = new URL(normalizedBase).pathname;
  const baseEndsWithTemplates = /\/templates\/$/i.test(basePath);
  const normalizedFile = layoutFile.replace(/^\.\//, "");
  const fileWithoutTemplatesPrefix = normalizedFile.replace(/^templates\//i, "");
  const filePath = baseEndsWithTemplates ? fileWithoutTemplatesPrefix : normalizedFile;
  return new URL(filePath, normalizedBase).toString();
}

async function readRemoteText(owner: string, repo: string, relativePath: string): Promise<string | null> {
  const candidates = buildGithubRawCandidates(owner, repo, relativePath);
  for (const candidate of candidates) {
    const result = await tryFetchText(candidate);
    if (result !== null) {
      return result;
    }
  }
  return null;
}

function markdownToHtml(markdown: string): string {
  const parsed = matter(markdown);
  return marked.parse(parsed.content) as string;
}

function resolveActiveVersionId(
  versions: VersionEntry[],
  selectedVersionId: string | undefined,
  defaultVersionId: string | undefined,
): string | undefined {
  if (!versions.length) {
    return undefined;
  }

  if (selectedVersionId && versions.some((version) => version.id === selectedVersionId)) {
    return selectedVersionId;
  }

  if (defaultVersionId && versions.some((version) => version.id === defaultVersionId)) {
    return defaultVersionId;
  }

  return versions[0]?.id;
}

interface VersionRoutesConfig {
  routes?: RouteConfig[];
  "menus-header"?: GitPageDocsConfig["menus-header"];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "menus-header-md"?: GitPageDocsConfig["menus-header"];
  "menus-header-html"?: GitPageDocsConfig["menus-header"];
  "menus-header-video"?: GitPageDocsConfig["menus-header"];
  hierarchyPage?: HierarchyConfig;
  hierarchyMenu?: HierarchyConfig;
}

const DEFAULT_HIERARCHY: HierarchyConfig = { md: 0, html: 1, video: 2 };

function hasPath(route: ContentTypeRouteConfig | RouteConfig): route is ContentTypeRouteConfig & { path: Record<LanguageCode, string> } {
  return "path" in route && typeof (route as ContentTypeRouteConfig).path === "object";
}

function hasVideo(route: ContentTypeRouteConfig): route is ContentTypeRouteConfig & { video: NonNullable<ContentTypeRouteConfig["video"]> } {
  return Boolean(route.video?.pathVideo && route.video?.videoType);
}

async function loadVersionConfig(options: {
  versionEntry: VersionEntry;
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}): Promise<VersionRoutesConfig | undefined> {
  const versionPath = options.versionEntry.PathConfig || options.versionEntry.path;
  if (!versionPath) {
    return undefined;
  }

  let versionConfig: VersionRoutesConfig | null = null;
  const normalizedPathCandidates = Array.from(
    new Set([
      versionPath,
      versionPath.replace(/^gitpagedocs\//, ""),
      versionPath.startsWith("docs/") ? `gitpagedocs/${versionPath}` : versionPath,
    ]),
  );

  if (/^https?:\/\//i.test(versionPath)) {
    versionConfig = await readRemoteJson<VersionRoutesConfig>(versionPath);
  } else if (options.source === "remote" && options.owner && options.repo) {
    for (const candidate of normalizedPathCandidates) {
      versionConfig = await readRemoteJsonFromRepo<VersionRoutesConfig>(options.owner, options.repo, candidate);
      if (versionConfig) {
        break;
      }
    }
  } else {
    for (const candidate of normalizedPathCandidates) {
      versionConfig = await tryReadJsonFile<VersionRoutesConfig>(candidate);
      if (versionConfig) {
        break;
      }
    }
  }

  const hasAnyRoutes =
    (versionConfig?.routes?.length ?? 0) > 0 ||
    (versionConfig?.["routes-md"]?.length ?? 0) > 0 ||
    (versionConfig?.["routes-html"]?.length ?? 0) > 0 ||
    (versionConfig?.["routes-video"]?.length ?? 0) > 0;
  const hasAnyMenus =
    (versionConfig?.["menus-header"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-md"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-html"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-video"]?.length ?? 0) > 0;
  if ((hasAnyRoutes || hasAnyMenus) && versionConfig) {
    return versionConfig;
  }

  return undefined;
}

function getLanguagesFromPathRecord(pathRecord: Record<string, string> | undefined): LanguageCode[] {
  if (!pathRecord || typeof pathRecord !== "object") return [];
  return Object.keys(pathRecord);
}

function getLanguages(
  config: GitPageDocsConfig,
  routesMd: (ContentTypeRouteConfig | RouteConfig)[],
  routesHtml: ContentTypeRouteConfig[],
  routesVideo: ContentTypeRouteConfig[],
): LanguageCode[] {
  const firstMd = routesMd[0];
  const firstHtml = routesHtml[0];
  const firstVideo = routesVideo[0];
  if (firstMd && hasPath(firstMd)) return getLanguagesFromPathRecord(firstMd.path);
  if (firstHtml?.path) return getLanguagesFromPathRecord(firstHtml.path);
  if (firstVideo?.video?.pathVideo) return getLanguagesFromPathRecord(firstVideo.video.pathVideo);
  if (config.routes?.[0]?.path) return getLanguagesFromPathRecord(config.routes[0].path);
  return [config.site.defaultLanguage];
}

async function loadLayoutsAndThemes(options: {
  isLocal: boolean;
  owner?: string;
  repo?: string;
  useOfficialLayouts?: boolean;
  officialLayoutsConfigPath?: string;
  officialLayoutsTemplatesPath?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
}): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  let layoutsConfig: LayoutsConfig | null = null;
  let remoteTemplatesBaseUrl: string | undefined;
  const preferredRemoteLayoutsPath = options.useOfficialLayouts
    ? options.officialLayoutsConfigPath || options.layoutsConfigPath
    : options.layoutsConfigPath;
  const preferredRemoteTemplatesPath = options.useOfficialLayouts
    ? options.officialLayoutsTemplatesPath || options.layoutsConfigPathTemplates
    : options.layoutsConfigPathTemplates;

  if (options.useOfficialLayouts && preferredRemoteLayoutsPath) {
    const remoteConfig = await readRemoteJson<LayoutsConfig>(preferredRemoteLayoutsPath);
    if (remoteConfig?.layouts?.length) {
      layoutsConfig = remoteConfig;
      remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
        preferredRemoteLayoutsPath,
        preferredRemoteTemplatesPath,
        options.owner,
        options.repo,
      );
    }
  }

  if (!layoutsConfig && options.isLocal) {
    layoutsConfig = await tryReadJsonFile<LayoutsConfig>(DEFAULT_LAYOUTS_PATH);
  } else if (!layoutsConfig) {
    if (preferredRemoteLayoutsPath) {
      const remoteConfig = await readRemoteJson<LayoutsConfig>(preferredRemoteLayoutsPath);
      if (remoteConfig?.layouts?.length) {
        layoutsConfig = remoteConfig;
        remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
          preferredRemoteLayoutsPath,
          preferredRemoteTemplatesPath,
          options.owner,
          options.repo,
        );
      }
    }

    if (!layoutsConfig && options.owner && options.repo) {
      const repoLayouts = await readRemoteJsonFromRepo<LayoutsConfig>(options.owner, options.repo, DEFAULT_LAYOUTS_PATH);
      if (repoLayouts?.layouts?.length) {
        layoutsConfig = repoLayouts;
        remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
          undefined,
          preferredRemoteTemplatesPath,
          options.owner,
          options.repo,
        );
      }
    }

    if (!layoutsConfig?.layouts?.length) {
      layoutsConfig = await tryReadJsonFile<LayoutsConfig>(DEFAULT_LAYOUTS_PATH);
    }
  }

  if (!layoutsConfig?.layouts?.length) {
    return buildFallbackLayoutsAndThemes();
  }

  const themes: Record<string, ThemeTemplate> = {};

  await Promise.all(
    layoutsConfig.layouts.map(async (layoutItem: LayoutItem) => {
      try {
        let template: ThemeTemplate | null = null;

        if (remoteTemplatesBaseUrl && !options.isLocal) {
          const templateUrl = buildRemoteTemplateUrl(layoutItem.file, remoteTemplatesBaseUrl);
          template = await readRemoteJson<ThemeTemplate>(templateUrl);
        }

        if (!template) {
          const templatePath = path.join("gitpagedocs/layouts", layoutItem.file);
          template = await tryReadJsonFile<ThemeTemplate>(templatePath);
        }

        if (!template && remoteTemplatesBaseUrl && !options.isLocal) {
          const templateUrl = buildRemoteTemplateUrl(layoutItem.file, remoteTemplatesBaseUrl);
          template = await readRemoteJson<ThemeTemplate>(templateUrl);
        }

        if (!template) {
          return;
        }

        themes[layoutItem.id] = template;
      } catch {
        // Keep app resilient even if one template is missing.
      }
    }),
  );

  return { layoutsConfig, themes };
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
    // On project repositories published to GitHub Pages, root must render local docs directly.
    // Keep search home only for the official aggregator repository.
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

  // Keep local docs routes deterministic. Only use remote source when owner/repo are explicitly requested.

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

  const pathToPageMap: Record<string, PathToPageEntry> = {};
  const pages: LoadedPage[] = [];

  for (let pageIndex = 0; pageIndex < sortedIds.length; pageIndex++) {
    const id = sortedIds[pageIndex];
    const page: LoadedPage = { id };

    const mdRoute = routesMd.find((r) => r.id === id);
    if (mdRoute && hasPath(mdRoute)) {
      const markdownByLanguage: Record<LanguageCode, string> = {};
      await Promise.all(
        languages.map(async (language) => {
          const languagePath = mdRoute.path![language];
          if (!languagePath) {
            markdownByLanguage[language] = "<p>Missing language file path in config.</p>";
            return;
          }
          if (source === "remote" && owner && repo) {
            const remoteText = await readRemoteText(owner, repo, languagePath);
            markdownByLanguage[language] = remoteText ? markdownToHtml(remoteText) : "<p>Unable to load remote markdown file.</p>";
            return;
          }
          try {
            const localText = await readLocalText(languagePath);
            markdownByLanguage[language] = localText ? markdownToHtml(localText) : "<p>Unable to load local markdown file.</p>";
          } catch {
            markdownByLanguage[language] = "<p>Unable to load local markdown file.</p>";
          }
        }),
      );
      const fullscreenEnabled = "fullscreenEnabled" in mdRoute ? mdRoute.fullscreenEnabled : true;
      page.md = { routeId: id, config: mdRoute, markdownByLanguage, fullscreenEnabled };
      languages.forEach((lang) => {
        const pathVal = mdRoute.path![lang];
        if (pathVal) pathToPageMap[pathVal] = { pageIndex, contentType: "md" };
      });
    }

    const htmlRoute = routesHtml.find((r) => r.id === id && (r.path || r.url));
    if (htmlRoute) {
      const fullscreenEnabled = htmlRoute.fullscreenEnabled ?? true;
      const htmlByLanguage: Record<LanguageCode, string> = {};

      if (htmlRoute.path) {
        await Promise.all(
          languages.map(async (language) => {
            const languagePath = htmlRoute.path![language];
            if (!languagePath) {
              htmlByLanguage[language] = "<p>Missing HTML path.</p>";
              return;
            }
            if (source === "remote" && owner && repo) {
              const remoteText = await readRemoteText(owner, repo, languagePath);
              htmlByLanguage[language] = remoteText ?? "<p>Unable to load remote HTML.</p>";
              return;
            }
            try {
              const localText = await readLocalText(languagePath);
              htmlByLanguage[language] = localText ?? "<p>Unable to load local HTML file.</p>";
            } catch {
              htmlByLanguage[language] = "<p>Unable to load local HTML file.</p>";
            }
          }),
        );
        languages.forEach((lang) => {
          const pathVal = htmlRoute.path![lang];
          if (pathVal) pathToPageMap[pathVal] = { pageIndex, contentType: "html" };
        });
      } else if (htmlRoute.url) {
        languages.forEach((lang) => {
          htmlByLanguage[lang] = "";
        });
        const urlKey = htmlRoute.url.en ?? Object.values(htmlRoute.url)[0];
        if (urlKey) pathToPageMap[`url:${urlKey}`] = { pageIndex, contentType: "html" };
      }

      page.html = { routeId: id, config: htmlRoute, htmlByLanguage, fullscreenEnabled };
    }

    const videoRoute = routesVideo.find((r) => r.id === id && hasVideo(r));
    if (videoRoute && hasVideo(videoRoute)) {
      const videoTypeByLanguage: Record<LanguageCode, string> = {};
      const pathVideoByLanguage: Record<LanguageCode, string> = {};
      languages.forEach((lang) => {
        videoTypeByLanguage[lang] = videoRoute.video!.videoType[lang] ?? videoRoute.video!.videoType.en ?? "youtube";
        pathVideoByLanguage[lang] = videoRoute.video!.pathVideo[lang] ?? videoRoute.video!.pathVideo.en ?? "";
      });
      const fullscreenEnabled = videoRoute.fullscreenEnabled ?? true;
      page.video = { routeId: id, config: videoRoute, videoTypeByLanguage, pathVideoByLanguage, fullscreenEnabled };
      pathToPageMap[`page:${id}`] = { pageIndex, contentType: "video" };
      languages.forEach((lang) => {
        const url = pathVideoByLanguage[lang];
        if (url) pathToPageMap[url] = { pageIndex, contentType: "video" };
      });
    }

    pages.push(page);
  }

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
