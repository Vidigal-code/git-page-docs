import { marked } from "marked";
import { buildGithubRawCandidates, ensureTrailingSlash, toRawGithubUrl } from "@/entities/docs/lib/remote/github-url";
import type {
  GitPageDocsConfig,
  HeaderMenuItem,
  LanguageCode,
  LayoutItem,
  LayoutsConfig,
  LoadedDocsData,
  RouteConfig,
  ThemeTemplate,
  VersionEntry,
} from "@/entities/docs/model/types";

type VersionConfig = { routes?: RouteConfig[]; "menus-header"?: HeaderMenuItem[] };
export type SupportedLanguage = "en" | "pt" | "es";

const REQUEST_TIMEOUT_MS = 12000;
const DEFAULT_LAYOUTS_PATH = "gitpagedocs/layouts/layoutsConfig.json";
const DEFAULT_TEMPLATES_BASE_PATH = "gitpagedocs/layouts/";
const OFFICIAL_LAYOUTS_CONFIG_URL =
  "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagedocs/layouts/layoutsConfig.json";
const OFFICIAL_LAYOUTS_TEMPLATES_URL =
  "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagedocs/layouts/templates";
const FALLBACK_LAYOUT_ID = "gitpagedocs-fallback-dark";

function buildFallbackLayoutsAndThemes(): {
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
} {
  const fallbackLayout: LayoutItem = {
    id: FALLBACK_LAYOUT_ID,
    name: "Fallback Dark",
    author: "gitpagedocs",
    file: "templates/fallback-dark.json",
    preview: "",
    supportsLightAndDarkModes: false,
    mode: "dark",
  };

  const fallbackTheme: ThemeTemplate = {
    id: FALLBACK_LAYOUT_ID,
    name: "Fallback Dark",
    author: "gitpagedocs",
    version: "1.0.0",
    mode: "dark",
    supportsLightAndDarkModes: false,
    colors: {
      background: "#0b0f15",
      primary: "#7c3aed",
      secondary: "#22d3ee",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      cardBackground: "#0f172a",
      cardBorder: "#334155",
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: {
        base: "16px",
        heading: "28px",
        small: "14px",
      },
    },
    components: {
      header: {
        backgroundColor: "#0b1220",
        borderBottom: "1px solid #334155",
      },
      button: {
        borderRadius: "10px",
        border: "1px solid #334155",
      },
      select: {
        borderRadius: "10px",
        border: "1px solid #334155",
        backgroundColor: "#0f172a",
      },
      card: {
        borderRadius: "16px",
        boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)",
      },
      headerControls: {
        common: {
          borderRadius: "10px",
          border: "1px solid #334155",
          backgroundColor: "#0f172a",
        },
      },
    },
    animations: {},
  };

  return {
    layoutsConfig: { layouts: [fallbackLayout] },
    themes: { [FALLBACK_LAYOUT_ID]: fallbackTheme },
  };
}

const STANDALONE_LAYOUT_IDS = ["aurora-dark", "aurora-light", "default", "github-dark", "github-light"];

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
    const standaloneLayouts = layoutsConfig.layouts.filter((l) => STANDALONE_LAYOUT_IDS.includes(l.id));
    const layoutsToLoad = standaloneLayouts.length > 0 ? standaloneLayouts : layoutsConfig.layouts.slice(0, 6);
    const templatesBaseUrl = ensureTrailingSlash(
      rawLayoutsUrl.slice(0, rawLayoutsUrl.lastIndexOf("/") + 1) + "templates/",
    );
    const themes: Record<string, ThemeTemplate> = {};
    await Promise.all(
      layoutsToLoad.map(async (layout: LayoutItem) => {
        const templateUrl = buildRemoteTemplateUrl(layout.file, templatesBaseUrl);
        const template = await fetchUrlJson<ThemeTemplate>(templateUrl);
        if (template) {
          themes[layout.id] = template;
        }
      }),
    );
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

export async function fetchOfficialSiteConfig(): Promise<{
  SiteHeaderName?: string;
  SiteIconPath?: string;
  name?: string;
} | null> {
  const config = await fetchRepoJson<{ site?: { SiteHeaderName?: string; SiteIconPath?: string; name?: string } }>(
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

async function tryFetchText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRepoText(owner: string, repo: string, relativePath: string): Promise<string | null> {
  const candidates = buildGithubRawCandidates(owner, repo, relativePath);
  for (const candidate of candidates) {
    const content = await tryFetchText(candidate);
    if (content !== null) {
      return content;
    }
  }
  return null;
}

async function fetchUrlText(url: string): Promise<string | null> {
  return tryFetchText(toRawGithubUrl(url));
}

async function fetchRepoJson<T>(owner: string, repo: string, relativePath: string): Promise<T | null> {
  const text = await fetchRepoText(owner, repo, relativePath);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchUrlJson<T>(url: string): Promise<T | null> {
  const text = await fetchUrlText(url);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function getAvailableLanguages(routes: RouteConfig[], fallbackLanguage: LanguageCode): LanguageCode[] {
  const firstRoute = routes[0];
  if (!firstRoute) {
    return [fallbackLanguage];
  }
  return Object.keys(firstRoute.path);
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

  const versions = config.VersionControl?.versions ?? [];
  const activeVersion = resolveActiveVersion(versions, selectedVersionId, config.site.docsVersion);
  const activeVersionId = activeVersion?.id;

  let routes = config.routes ?? [];
  let menusHeader = config["menus-header"] ?? [];
  if (activeVersion) {
    const versionConfig = await loadVersionConfig(owner, repo, activeVersion);
    if (versionConfig?.routes?.length) {
      routes = versionConfig.routes;
    }
    if (versionConfig?.["menus-header"]?.length) {
      menusHeader = versionConfig["menus-header"];
    }
  }

  const availableLanguages = getAvailableLanguages(routes, config.site.defaultLanguage);
  const preferredLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : availableLanguages.includes(config.site.defaultLanguage)
      ? config.site.defaultLanguage
      : availableLanguages[0] ?? "en";

  const effectiveConfig: GitPageDocsConfig = {
    ...config,
    site: {
      ...config.site,
      defaultLanguage: preferredLanguage,
    },
    routes,
    "menus-header": menusHeader,
  };

  const docs = await Promise.all(
    routes.map(async (route) => {
      const markdownByLanguage: Record<LanguageCode, string> = {};
      await Promise.all(
        availableLanguages.map(async (langCode) => {
          const markdownPath = route.path[langCode];
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
