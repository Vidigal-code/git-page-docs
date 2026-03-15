import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import {
  type GitPageDocsConfig,
  type LanguageCode,
  type LayoutItem,
  type LayoutsConfig,
  type LoadedDocsData,
  type ThemeTemplate,
  type RouteConfig,
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
      const pathPrefix = window.location.pathname.startsWith("/git-page-docs") ? "/git-page-docs" : "";
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

function toRawGithubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") {
      return url;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    const blobIndex = parts.indexOf("blob");
    if (parts.length >= 5 && blobIndex === 2) {
      const owner = parts[0];
      const repo = parts[1];
      const branch = parts[3];
      const filePath = parts.slice(4).join("/");
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    }
  } catch {
    return url;
  }
  return url;
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

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
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

function buildGithubRawCandidates(owner: string, repo: string, relativePath: string): string[] {
  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${relativePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${relativePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/${relativePath}`,
  ];
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

  if (versionConfig?.routes?.length || versionConfig?.["menus-header"]?.length) {
    return versionConfig;
  }

  return undefined;
}

function getLanguages(config: GitPageDocsConfig): LanguageCode[] {
  const firstRoute = config.routes[0];
  if (!firstRoute) {
    return [config.site.defaultLanguage];
  }
  return Object.keys(firstRoute.path);
}

async function loadLayoutsAndThemes(options: {
  isLocal: boolean;
  owner?: string;
  repo?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
}): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  let layoutsConfig: LayoutsConfig | null = null;
  let remoteTemplatesBaseUrl: string | undefined;

  if (options.isLocal) {
    layoutsConfig = await tryReadJsonFile<LayoutsConfig>(DEFAULT_LAYOUTS_PATH);
  } else {
    if (options.layoutsConfigPath) {
      const remoteConfig = await readRemoteJson<LayoutsConfig>(options.layoutsConfigPath);
      if (remoteConfig?.layouts?.length) {
        layoutsConfig = remoteConfig;
        remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
          options.layoutsConfigPath,
          options.layoutsConfigPathTemplates,
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
          options.layoutsConfigPathTemplates,
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
    throw new Error("No layouts configuration found in gitpagedocs/layouts/layoutsConfig.json or remote path.");
  }

  const themes: Record<string, ThemeTemplate> = {};

  await Promise.all(
    layoutsConfig.layouts.map(async (layoutItem: LayoutItem) => {
      try {
        let template: ThemeTemplate | null = null;

        if (remoteTemplatesBaseUrl && !options.isLocal) {
          const templateUrl = new URL(layoutItem.file, remoteTemplatesBaseUrl).toString();
          template = await readRemoteJson<ThemeTemplate>(templateUrl);
        }

        if (!template) {
          const templatePath = path.join("gitpagedocs/layouts", layoutItem.file);
          template = await tryReadJsonFile<ThemeTemplate>(templatePath);
        }

        if (!template && remoteTemplatesBaseUrl && !options.isLocal) {
          const templateUrl = new URL(layoutItem.file, remoteTemplatesBaseUrl).toString();
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

  const requestedOwner = slug?.[0];
  const requestedRepo = slug?.[1];
  const isRepositoryRouteRequest = Boolean(repositorySearchEnabled && requestedOwner && requestedRepo);
  const showRepositorySearchHome = Boolean(repositorySearchEnabled && !requestedOwner && !requestedRepo);
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

  if (
    !showRepositorySearchHome &&
    repositorySearchEnabled &&
    !owner &&
    !repo &&
    renderingFallback.owner &&
    renderingFallback.repo
  ) {
    source = "remote";
    owner = renderingFallback.owner;
    repo = renderingFallback.repo;
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

  let routes = showRepositorySearchHome || (isRepositoryRouteRequest && !hasGitPageDocs) ? [] : config.routes ?? [];
  let menusHeader = config["menus-header"] ?? [];
  if (activeVersionId) {
    const versionEntry = activeVersion;
    if (versionEntry) {
      const versionConfig = await loadVersionConfig({
        versionEntry,
        source,
        owner,
        repo,
      });
      if (versionConfig?.routes?.length) {
        routes = versionConfig.routes;
      }
      if (versionConfig?.["menus-header"]?.length) {
        menusHeader = versionConfig["menus-header"];
      }
    }
  }

  const effectiveConfig: GitPageDocsConfig = {
    ...config,
    routes,
    "menus-header": menusHeader,
  };

  const { layoutsConfig, themes } = await loadLayoutsAndThemes({
    isLocal: local,
    owner,
    repo,
    layoutsConfigPath: effectiveConfig.site.layoutsConfigPath,
    layoutsConfigPathTemplates: effectiveConfig.site.layoutsConfigPathTemplates,
  });

  const languages = getLanguages(effectiveConfig);

  const docs = await Promise.all(
    effectiveConfig.routes.map(async (route) => {
      const markdownByLanguage: Record<LanguageCode, string> = {};

      await Promise.all(
        languages.map(async (language) => {
          const languagePath = route.path[language];
          if (!languagePath) {
            markdownByLanguage[language] = "<p>Missing language file path in config.</p>";
            return;
          }

          if (source === "remote" && owner && repo) {
            const remoteText = await readRemoteText(owner, repo, languagePath);
            markdownByLanguage[language] = remoteText
              ? markdownToHtml(remoteText)
              : "<p>Unable to load remote markdown file.</p>";
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

      return {
        routeId: route.id,
        markdownByLanguage,
      };
    }),
  );

  return {
    config: effectiveConfig,
    docs,
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
