import { marked } from "marked";
import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";
import { buildGithubRawCandidates, ensureTrailingSlash, toRawGithubUrl } from "@/entities/docs/lib/remote/github-url";
import type {
  GitPageDocsConfig,
  HeaderMenuItem,
  LanguageCode,
  LayoutItem,
  LayoutsConfig,
  LoadedDocsData,
  LoadedPage,
  PathToPageEntry,
  RouteConfig,
  ThemeTemplate,
  VersionEntry,
} from "@/entities/docs/model/types";
import { dedupeVersionEntriesById } from "../lib/dedupe-version-entries";
import {
  DEFAULT_LAYOUTS_PATH,
  DEFAULT_TEMPLATES_BASE_PATH,
  OFFICIAL_LAYOUTS_CONFIG_URL,
  OFFICIAL_LAYOUTS_TEMPLATES_URL,
} from "@/shared/config/remote-urls";
import {
  tryFetchText,
  fetchRepoText,
  fetchUrlText,
  fetchRepoJson,
  fetchUrlJson,
} from "@/shared/api/fetch-client";

type VersionConfig = {
  routes?: RouteConfig[];
  "menus-header"?: HeaderMenuItem[];
  "routes-md"?: RouteConfig[];
  "menus-header-md"?: HeaderMenuItem[];
};
export type SupportedLanguage = "en" | "pt" | "es";

export async function loadStandaloneLayoutsAndThemes(): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  try {
    const rawLayoutsUrl = toRawGithubUrl(OFFICIAL_LAYOUTS_CONFIG_URL);
    const layoutsConfig = await fetchUrlJson<LayoutsConfig>(rawLayoutsUrl);
    if (!layoutsConfig?.layouts?.length) {
      return buildFallbackLayoutsAndThemes();
    }
    const layoutsToLoad = layoutsConfig.layouts;
    const templatesBaseUrl = ensureTrailingSlash(
      rawLayoutsUrl.slice(0, rawLayoutsUrl.lastIndexOf("/") + 1) + "templates/",
    );
    const themes: Record<string, ThemeTemplate> = {};
    const results = await Promise.allSettled(
      layoutsToLoad.map(async (layout: LayoutItem) => {
        const templateUrl = buildRemoteTemplateUrl(layout.file, templatesBaseUrl);
        const template = await fetchUrlJson<ThemeTemplate>(templateUrl);
        return { layout, template };
      }),
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.template) {
        themes[result.value.layout.id] = result.value.template;
      }
    }
    if (Object.keys(themes).length === 0) {
      return buildFallbackLayoutsAndThemes();
    }
    return {
      layoutsConfig: { layouts: layoutsToLoad },
      themes,
    };
  } catch {
    return buildFallbackLayoutsAndThemes();
  }
}

export interface OfficialSiteConfig {
  SiteHeaderName?: string;
  SiteIconPath?: string;
  name?: string;
  IconImageMenuHeaderImgWidth?: string | number;
  IconImageMenuHeaderImgHeight?: string | number;
  IconImageMenuHeaderLightImg?: string;
  IconImageMenuHeaderDarkImg?: string;
  IconImageMenuHeaderLight?: string;
  IconImageMenuHeaderDark?: string;
  IconImageMenuHeader?: string;
  IconImageMenuHeaderReactIcones?: boolean;
  IconImageMenuHeaderReactIconesTag?: string;
  IconImageMenuHeaderReactIconesTagColorDark?: string;
  IconImageMenuHeaderReactIconesTagColorLight?: string;
  IconImageMenuHeaderReactIconesTagSize?: string;
  langmenu?: Record<string, Record<string, string>>;
}

export async function fetchOfficialSiteConfig(): Promise<OfficialSiteConfig | null> {
  const config = await fetchRepoJson<{ site?: OfficialSiteConfig }>(
    "Vidigal-code",
    "git-page-docs",
    "gitpagedocs/config.json",
  );
  return config?.site ?? null;
}

export function parseSupportedLanguage(input: string | null | undefined): SupportedLanguage {
  if (input === "pt" || input === "es" || input === "en") {
    return input;
  }
  return "en";
}

function stripFrontMatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function getAvailableLanguages(
  routes: Array<{ path?: Record<LanguageCode, string> }>,
  fallbackLanguage: LanguageCode,
): LanguageCode[] {
  const firstWithPath = routes.find((r) => r.path && Object.keys(r.path).length > 0);
  if (!firstWithPath?.path) {
    return [fallbackLanguage];
  }
  return Object.keys(firstWithPath.path);
}

function resolveActiveVersion(
  versions: VersionEntry[],
  selectedVersionId: string | undefined,
  defaultVersionId: string | undefined,
): VersionEntry | undefined {
  if (!versions.length) {
    return undefined;
  }
  if (selectedVersionId) {
    const selected = versions.find((version) => version.id === selectedVersionId);
    if (selected) {
      return selected;
    }
  }
  if (defaultVersionId) {
    const preferred = versions.find((version) => version.id === defaultVersionId);
    if (preferred) {
      return preferred;
    }
  }
  return versions[0];
}

async function loadVersionConfig(owner: string, repo: string, versionEntry: VersionEntry): Promise<VersionConfig | null> {
  const versionPath = versionEntry.PathConfig || versionEntry.path;
  if (!versionPath) {
    return null;
  }

  if (/^https?:\/\//i.test(versionPath)) {
    return await fetchUrlJson<VersionConfig>(versionPath);
  }

  const normalizedPathCandidates = Array.from(
    new Set([versionPath, versionPath.replace(/^gitpagedocs\//, ""), versionPath.startsWith("docs/") ? `gitpagedocs/${versionPath}` : versionPath]),
  );
  for (const pathCandidate of normalizedPathCandidates) {
    const candidateConfig = await fetchRepoJson<VersionConfig>(owner, repo, pathCandidate);
    if (candidateConfig) {
      return candidateConfig;
    }
  }

  return null;
}

function deriveRemoteTemplatesBaseUrl(
  layoutsConfigPath: string | undefined,
  templatesPathOverride: string | undefined,
  owner: string,
  repo: string,
): string {
  if (templatesPathOverride) {
    return ensureTrailingSlash(toRawGithubUrl(templatesPathOverride));
  }
  if (layoutsConfigPath) {
    const rawUrl = toRawGithubUrl(layoutsConfigPath);
    return ensureTrailingSlash(rawUrl.slice(0, rawUrl.lastIndexOf("/") + 1));
  }
  return ensureTrailingSlash(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${DEFAULT_TEMPLATES_BASE_PATH}`);
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

async function loadLayoutsAndThemes(config: GitPageDocsConfig, owner: string, repo: string): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  const useOfficialLayouts = config.site.layoutsConfigPathOficial === true;
  const preferredLayoutsConfigPath = useOfficialLayouts
    ? config.site.layoutsConfigPathOficialUrl || config.site.layoutsConfigPath || OFFICIAL_LAYOUTS_CONFIG_URL
    : config.site.layoutsConfigPath;
  const preferredTemplatesPath = useOfficialLayouts
    ? config.site.layoutsConfigPathTemplatesOficial || config.site.layoutsConfigPathTemplates || OFFICIAL_LAYOUTS_TEMPLATES_URL
    : config.site.layoutsConfigPathTemplates;

  let layoutsConfig: LayoutsConfig | null = null;
  if (useOfficialLayouts) {
    layoutsConfig = await fetchUrlJson<LayoutsConfig>(preferredLayoutsConfigPath ?? OFFICIAL_LAYOUTS_CONFIG_URL);
  }
  if (!layoutsConfig?.layouts?.length && !useOfficialLayouts && preferredLayoutsConfigPath) {
    layoutsConfig = await fetchUrlJson<LayoutsConfig>(preferredLayoutsConfigPath);
  }
  if (!layoutsConfig?.layouts?.length) {
    layoutsConfig = await fetchRepoJson<LayoutsConfig>(owner, repo, DEFAULT_LAYOUTS_PATH);
  }
  if (!layoutsConfig?.layouts?.length && useOfficialLayouts) {
    layoutsConfig = await fetchUrlJson<LayoutsConfig>(OFFICIAL_LAYOUTS_CONFIG_URL);
  }
  if (!layoutsConfig?.layouts?.length) {
    throw new Error("Could not load layouts configuration.");
  }

  const remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
    useOfficialLayouts ? preferredLayoutsConfigPath : undefined,
    preferredTemplatesPath,
    owner,
    repo,
  );

  const themes: Record<string, ThemeTemplate> = {};
  await Promise.all(
    layoutsConfig.layouts.map(async (layout: LayoutItem) => {
      const templateUrl = buildRemoteTemplateUrl(layout.file, remoteTemplatesBaseUrl);
      let template = await fetchUrlJson<ThemeTemplate>(templateUrl);
      if (!template) {
        template = await fetchRepoJson<ThemeTemplate>(owner, repo, `gitpagedocs/layouts/${layout.file}`);
      }
      if (template) {
        themes[layout.id] = template;
      }
    }),
  );

  return { layoutsConfig, themes };
}

export async function checkRepositoryHasGitPageDocs(owner: string, repo: string): Promise<boolean> {
  const candidates = [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/gitpagedocs/config.json`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/gitpagedocs/config.json`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/gitpagedocs/config.json`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }
      const body = await response.text();
      JSON.parse(body);
      return true;
    } catch {
      // Ignore candidate errors and try the next one.
    }
  }
  return false;
}

export async function loadRemoteDocsData(
  owner: string,
  repo: string,
  selectedVersionId?: string,
  selectedLanguage: SupportedLanguage = "en",
): Promise<LoadedDocsData | null> {
  const config = await fetchRepoJson<GitPageDocsConfig>(owner, repo, "gitpagedocs/config.json");
  if (!config) {
    return null;
  }

  const versions = dedupeVersionEntriesById(config.VersionControl?.versions ?? []);
  const activeVersion = resolveActiveVersion(versions, selectedVersionId, config.site.docsVersion);
  const activeVersionId = activeVersion?.id;

  let routes = config["routes-md"] ?? config.routes ?? [];
  let menusHeader = config["menus-header-md"] ?? config["menus-header"] ?? [];
  if (activeVersion) {
    const versionConfig = await loadVersionConfig(owner, repo, activeVersion);
    if (versionConfig?.["routes-md"]?.length) routes = versionConfig["routes-md"];
    else if (versionConfig?.routes?.length) routes = versionConfig.routes;
    if (versionConfig?.["menus-header-md"]?.length) menusHeader = versionConfig["menus-header-md"];
    else if (versionConfig?.["menus-header"]?.length) menusHeader = versionConfig["menus-header"];
  }

  const routesWithPath = routes.filter((r): r is RouteConfig => Boolean(r.path && Object.keys(r.path).length > 0));
  const availableLanguages = getAvailableLanguages(routes, config.site.defaultLanguage);
  const preferredLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : availableLanguages.includes(config.site.defaultLanguage)
      ? config.site.defaultLanguage
      : availableLanguages[0] ?? "en";

  const routesForConfig: RouteConfig[] = routesWithPath.map((r) => ({ id: r.id, path: r.path }));

  const effectiveConfig: GitPageDocsConfig = {
    ...config,
    site: {
      ...config.site,
      defaultLanguage: preferredLanguage,
    },
    routes: routesForConfig,
    "menus-header": menusHeader,
  };

  const docs = await Promise.all(
    routesWithPath.map(async (route) => {
      const markdownByLanguage: Record<LanguageCode, string> = {};
      await Promise.all(
        availableLanguages.map(async (langCode) => {
          const markdownPath = route.path![langCode];
          if (!markdownPath) {
            markdownByLanguage[langCode] = "<p>Missing language file path in config.</p>";
            return;
          }
          const markdown = await fetchRepoText(owner, repo, markdownPath);
          markdownByLanguage[langCode] = markdown
            ? (marked.parse(stripFrontMatter(markdown)) as string)
            : "<p>Unable to load remote markdown file.</p>";
        }),
      );
      return {
        routeId: route.id,
        markdownByLanguage,
      };
    }),
  );

  const pathToPageMap: Record<string, PathToPageEntry> = {};
  const pages: LoadedPage[] = docs.map((doc, idx) => {
    const route = routesWithPath[idx];
    availableLanguages.forEach((lang) => {
      const pathVal = route.path[lang];
      if (pathVal) pathToPageMap[pathVal] = { pageIndex: idx, contentType: "md" };
    });
    return {
      id: route.id,
      md: { routeId: route.id, config: route, markdownByLanguage: doc.markdownByLanguage, fullscreenEnabled: true },
    };
  });

  let layoutsConfig: LayoutsConfig;
  let themes: Record<string, ThemeTemplate>;
  try {
    const loadedLayouts = await loadLayoutsAndThemes(effectiveConfig, owner, repo);
    layoutsConfig = loadedLayouts.layoutsConfig;
    themes = loadedLayouts.themes;
  } catch {
    const fallback = buildFallbackLayoutsAndThemes();
    layoutsConfig = fallback.layoutsConfig;
    themes = fallback.themes;
  }

  return {
    config: effectiveConfig,
    docs,
    pages,
    pathToPageMap,
    showRepositorySearchHome: false,
    availableVersions: versions,
    activeVersionId,
    activeVersion,
    activeRepository: {
      owner,
      repo,
      requested: true,
      hasGitPageDocs: true,
      source: "remote",
    },
    availableLanguages,
    layoutsConfig,
    themes,
  };
}
