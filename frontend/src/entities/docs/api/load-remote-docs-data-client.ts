import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";
import { ensureTrailingSlash, toRawGithubUrl } from "@/shared/lib/remote/github-url";
import type {
  AuthConfig,
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  HeaderMenuItem,
  HierarchyConfig,
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
  LAYOUTS_CONFIG_FILENAME,
  LAYOUTS_DIR_CANDIDATES,
  OFFICIAL_LAYOUTS_CONFIG_URL,
  OFFICIAL_LAYOUTS_CONFIG_URLS,
  OFFICIAL_LAYOUTS_TEMPLATES_URL,
} from "@/shared/config/remote-urls";
import { buildRemoteTemplateUrl, templatesBaseFromConfigUrl } from "./layouts/remote-template-urls";
import { DEFAULT_CONFIG_PATH, DEFAULT_HIERARCHY } from "@/shared/config/constants";
import {
  fetchRepoText,
  fetchRepoJson,
  fetchUrlJson,
} from "@/shared/api/fetch-client";
import { withConfigDefaults } from "../lib/with-config-defaults";
import { expandVersionConfig } from "../lib/expand-version-config";
import { localizeConfig } from "./config/localize-config";
import { applyLanguageToggles } from "./utils/route-utils";
import { markdownToHtml } from "./utils/markdown";

type VersionConfig = {
  auth?: AuthConfig;
  routes?: RouteConfig[];
  "menus-header"?: HeaderMenuItem[];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-source-viewer"?: ContentTypeRouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "routes-audio"?: ContentTypeRouteConfig[];
  "menus-header-md"?: HeaderMenuItem[];
  "menus-header-source-viewer"?: HeaderMenuItem[];
  "menus-header-html"?: HeaderMenuItem[];
  "menus-header-video"?: HeaderMenuItem[];
  "menus-header-audio"?: HeaderMenuItem[];
  hierarchyPage?: HierarchyConfig;
  hierarchyMenu?: HierarchyConfig;
};
export type SupportedLanguage = "en" | "pt" | "es";

export async function loadStandaloneLayoutsAndThemes(): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  try {
    let layoutsConfig: LayoutsConfig | null = null;
    let templatesBaseUrl: string | undefined;
    for (const officialConfigUrl of OFFICIAL_LAYOUTS_CONFIG_URLS) {
      layoutsConfig = await fetchUrlJson<LayoutsConfig>(toRawGithubUrl(officialConfigUrl));
      if (layoutsConfig?.layouts?.length) {
        templatesBaseUrl = ensureTrailingSlash(`${templatesBaseFromConfigUrl(officialConfigUrl)}templates/`);
        break;
      }
      layoutsConfig = null;
    }
    if (!layoutsConfig || !templatesBaseUrl) {
      return buildFallbackLayoutsAndThemes();
    }
    const layoutsToLoad = layoutsConfig.layouts;
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

const OFFICIAL_REPO = { owner: "Vidigal-code", repo: "git-page-docs" } as const;

/** Reads a repo's config.json and folds its language bundles in (null when the repo has none). */
async function fetchLocalizedRepoConfig(owner: string, repo: string): Promise<GitPageDocsConfig | null> {
  const rawConfig = await fetchRepoJson<GitPageDocsConfig>(owner, repo, DEFAULT_CONFIG_PATH);
  if (!rawConfig) {
    return null;
  }
  return localizeConfig(rawConfig, (relativePath) => fetchRepoJson(owner, repo, relativePath));
}

export async function fetchOfficialSiteConfig(): Promise<OfficialSiteConfig | null> {
  const config = await fetchLocalizedRepoConfig(OFFICIAL_REPO.owner, OFFICIAL_REPO.repo);
  return (config?.site as OfficialSiteConfig | undefined) ?? null;
}

export function parseSupportedLanguage(input: string | null | undefined): SupportedLanguage {
  if (input === "pt" || input === "es" || input === "en") {
    return input;
  }
  return "en";
}

function getLanguagesFromRecord(record: Record<LanguageCode, string> | undefined): LanguageCode[] {
  if (!record || typeof record !== "object") return [];
  return Object.keys(record);
}

function getAvailableLanguagesFromContent(
  routesMd: Array<ContentTypeRouteConfig | RouteConfig>,
  routesSourceViewer: ContentTypeRouteConfig[],
  routesHtml: ContentTypeRouteConfig[],
  routesVideo: ContentTypeRouteConfig[],
  routesAudio: ContentTypeRouteConfig[],
  fallbackLanguage: LanguageCode,
): LanguageCode[] {
  const mdPath = routesMd.find((route) => route.path && Object.keys(route.path).length > 0)?.path;
  if (mdPath) return getLanguagesFromRecord(mdPath);

  const sourceViewerTitle = routesSourceViewer.find((route) => route.title && Object.keys(route.title).length > 0)?.title;
  if (sourceViewerTitle) return getLanguagesFromRecord(sourceViewerTitle);

  const htmlPath = routesHtml.find((route) => route.path && Object.keys(route.path).length > 0)?.path;
  if (htmlPath) return getLanguagesFromRecord(htmlPath);

  const htmlUrl = routesHtml.find((route) => route.url && Object.keys(route.url).length > 0)?.url;
  if (htmlUrl) return getLanguagesFromRecord(htmlUrl);

  const videoPath = routesVideo.find((route) => route.video?.pathVideo)?.video?.pathVideo;
  if (videoPath) return getLanguagesFromRecord(videoPath);

  const audioPath = routesAudio.find((route) => {
    const audio = route.audio;
    return audio && "pathAudio" in audio && audio.pathAudio;
  })?.audio;
  if (audioPath && "pathAudio" in audioPath) return getLanguagesFromRecord(audioPath.pathAudio);

  return [fallbackLanguage];
}

function routeHasPath(route: ContentTypeRouteConfig | RouteConfig): route is ContentTypeRouteConfig & { path: Record<LanguageCode, string> } {
  return Boolean(route.path && Object.keys(route.path).length > 0);
}

function routeHasVideo(route: ContentTypeRouteConfig): route is ContentTypeRouteConfig & { video: NonNullable<ContentTypeRouteConfig["video"]> } {
  return Boolean(route.video?.pathVideo && route.video?.videoType);
}

function routeHasAudio(route: ContentTypeRouteConfig): route is ContentTypeRouteConfig & { audio: { audioType: Record<LanguageCode, string>; pathAudio: Record<LanguageCode, string> } } {
  const audio = route.audio;
  return Boolean(audio && "pathAudio" in audio && "audioType" in audio && audio.pathAudio && audio.audioType);
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
    const fetched = await fetchUrlJson<VersionConfig>(versionPath);
    return fetched ? expandVersionConfig(fetched) : null;
  }

  const normalizedPathCandidates = Array.from(
    new Set([versionPath, versionPath.replace(/^gitpagedocs\//, ""), versionPath.startsWith("docs/") ? `gitpagedocs/${versionPath}` : versionPath]),
  );
  for (const pathCandidate of normalizedPathCandidates) {
    const candidateConfig = await fetchRepoJson<VersionConfig>(owner, repo, pathCandidate);
    if (candidateConfig) {
      return expandVersionConfig(candidateConfig);
    }
  }

  return null;
}

function deriveRemoteTemplatesBaseUrl(
  layoutsConfigPath: string | undefined,
  templatesPathOverride: string | undefined,
  owner: string,
  repo: string,
  repoLayoutsDir: string,
): string {
  if (templatesPathOverride) {
    return ensureTrailingSlash(toRawGithubUrl(templatesPathOverride));
  }
  if (layoutsConfigPath) {
    return templatesBaseFromConfigUrl(layoutsConfigPath);
  }
  return ensureTrailingSlash(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${repoLayoutsDir}`);
}

async function fetchRepoLayoutsConfig(
  owner: string,
  repo: string,
): Promise<{ config: LayoutsConfig; dir: string } | null> {
  for (const dir of LAYOUTS_DIR_CANDIDATES) {
    const config = await fetchRepoJson<LayoutsConfig>(owner, repo, `${dir}${LAYOUTS_CONFIG_FILENAME}`);
    if (config?.layouts?.length) {
      return { config, dir };
    }
  }
  return null;
}

type LayoutsAndThemes = {
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
};

type LayoutsSourcePreferences = {
  useOfficialLayouts: boolean;
  preferredLayoutsConfigPath: string | undefined;
  preferredTemplatesPath: string | undefined;
};

type ResolvedLayoutsConfig = {
  layoutsConfig: LayoutsConfig;
  /** The URL that delivered the index, when it did not come from a repository folder. */
  resolvedConfigUrl: string | undefined;
  /** True only when the configured index URL itself delivered the index. */
  configuredUrlDelivered: boolean;
  /** The repository folder that delivered the index, when it came from the repository. */
  repoLayoutsDir: string | undefined;
};

/** Official mode prefers the official index/templates (plain paths as fallbacks); otherwise only the plain paths apply. */
function resolveLayoutsSourcePreferences(config: GitPageDocsConfig): LayoutsSourcePreferences {
  const { site } = config;
  if (site.layoutsConfigPathOficial === true) {
    return {
      useOfficialLayouts: true,
      preferredLayoutsConfigPath: site.layoutsConfigPathOficialUrl || site.layoutsConfigPath || OFFICIAL_LAYOUTS_CONFIG_URL,
      preferredTemplatesPath: site.layoutsConfigPathTemplatesOficial || site.layoutsConfigPathTemplates || OFFICIAL_LAYOUTS_TEMPLATES_URL,
    };
  }
  return {
    useOfficialLayouts: false,
    preferredLayoutsConfigPath: site.layoutsConfigPath,
    preferredTemplatesPath: site.layoutsConfigPathTemplates,
  };
}

async function fetchConfiguredLayoutsConfig(configUrl: string | undefined): Promise<LayoutsConfig | null> {
  if (!configUrl) {
    return null;
  }
  const layoutsConfig = await fetchUrlJson<LayoutsConfig>(configUrl);
  return layoutsConfig?.layouts?.length ? layoutsConfig : null;
}

async function fetchOfficialLayoutsConfig(): Promise<{ config: LayoutsConfig; url: string } | null> {
  for (const url of OFFICIAL_LAYOUTS_CONFIG_URLS) {
    const config = await fetchUrlJson<LayoutsConfig>(url);
    if (config?.layouts?.length) {
      return { config, url };
    }
  }
  return null;
}

/** Configured index URL first, then the repository's own layouts folders, then (official mode only) the official candidates. */
async function resolveLayoutsConfig(preferences: LayoutsSourcePreferences, owner: string, repo: string): Promise<ResolvedLayoutsConfig> {
  const configured = await fetchConfiguredLayoutsConfig(preferences.preferredLayoutsConfigPath);
  if (configured) {
    return {
      layoutsConfig: configured,
      resolvedConfigUrl: preferences.preferredLayoutsConfigPath,
      configuredUrlDelivered: true,
      repoLayoutsDir: undefined,
    };
  }
  const repoLayouts = await fetchRepoLayoutsConfig(owner, repo);
  if (repoLayouts) {
    return { layoutsConfig: repoLayouts.config, resolvedConfigUrl: undefined, configuredUrlDelivered: false, repoLayoutsDir: repoLayouts.dir };
  }
  const official = preferences.useOfficialLayouts ? await fetchOfficialLayoutsConfig() : null;
  if (official) {
    return { layoutsConfig: official.config, resolvedConfigUrl: official.url, configuredUrlDelivered: false, repoLayoutsDir: undefined };
  }
  throw new Error("Could not load layouts configuration.");
}

/** A layout's template from next to the index first, then from each repository layouts folder in turn. */
async function fetchLayoutTemplate(
  layout: LayoutItem,
  remoteTemplatesBaseUrl: string,
  owner: string,
  repo: string,
  repoTemplateDirs: string[],
): Promise<ThemeTemplate | null> {
  const template = await fetchUrlJson<ThemeTemplate>(buildRemoteTemplateUrl(layout.file, remoteTemplatesBaseUrl));
  if (template) {
    return template;
  }
  for (const dir of repoTemplateDirs) {
    const repoTemplate = await fetchRepoJson<ThemeTemplate>(owner, repo, `${dir}${layout.file}`);
    if (repoTemplate) {
      return repoTemplate;
    }
  }
  return null;
}

async function loadThemes(
  layouts: LayoutItem[],
  remoteTemplatesBaseUrl: string,
  owner: string,
  repo: string,
  repoTemplateDirs: string[],
): Promise<Record<string, ThemeTemplate>> {
  const themes: Record<string, ThemeTemplate> = {};
  await Promise.all(
    layouts.map(async (layout) => {
      const template = await fetchLayoutTemplate(layout, remoteTemplatesBaseUrl, owner, repo, repoTemplateDirs);
      if (template) {
        themes[layout.id] = template;
      }
    }),
  );
  return themes;
}

export async function loadLayoutsAndThemes(config: GitPageDocsConfig, owner: string, repo: string): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  const preferences = resolveLayoutsSourcePreferences(config);
  const { layoutsConfig, resolvedConfigUrl, configuredUrlDelivered, repoLayoutsDir } = await resolveLayoutsConfig(preferences, owner, repo);

  // The configured templates override is only trustworthy when the configured
  // index URL itself delivered the config: stale configs (pointing at the
  // retired official location) must not misdirect templates away from the
  // source that actually worked.
  const remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
    resolvedConfigUrl,
    configuredUrlDelivered ? preferences.preferredTemplatesPath : undefined,
    owner,
    repo,
    repoLayoutsDir ?? LAYOUTS_DIR_CANDIDATES[0],
  );
  const repoTemplateDirs = repoLayoutsDir
    ? [repoLayoutsDir, ...LAYOUTS_DIR_CANDIDATES.filter((dir) => dir !== repoLayoutsDir)]
    : [...LAYOUTS_DIR_CANDIDATES];
  const themes = await loadThemes(layoutsConfig.layouts, remoteTemplatesBaseUrl, owner, repo, repoTemplateDirs);

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

type ContentSections = {
  auth: AuthConfig | undefined;
  routesMd: Array<ContentTypeRouteConfig | RouteConfig>;
  routesSourceViewer: ContentTypeRouteConfig[];
  routesHtml: ContentTypeRouteConfig[];
  routesVideo: ContentTypeRouteConfig[];
  routesAudio: ContentTypeRouteConfig[];
  menusHeaderMd: HeaderMenuItem[];
  menusHeaderSourceViewer: HeaderMenuItem[];
  menusHeaderHtml: HeaderMenuItem[];
  menusHeaderVideo: HeaderMenuItem[];
  menusHeaderAudio: HeaderMenuItem[];
  hierarchyPage: HierarchyConfig;
  hierarchyMenu: HierarchyConfig;
};

type PageBuildContext = {
  owner: string;
  repo: string;
  availableLanguages: LanguageCode[];
  preferredLanguage: LanguageCode;
  pathToPageMap: Record<string, PathToPageEntry>;
};

/** The first version-level list with entries, else the first root-level list that is set, else none. */
function pickSection<T>(versionCandidates: Array<T[] | undefined>, rootCandidates: Array<T[] | undefined>): T[] {
  const versionList = versionCandidates.find((candidate) => candidate?.length);
  if (versionList) {
    return versionList;
  }
  return rootCandidates.find((candidate) => candidate !== undefined && candidate !== null) ?? [];
}

/** The version-level value when it is set, else the root-level one. */
function overrideWhenSet<T>(versionValue: T | undefined, rootValue: T): T {
  if (versionValue) {
    return versionValue;
  }
  return rootValue;
}

/** Root config sections, each replaced by the active version's own when that version provides it. */
function resolveContentSections(config: GitPageDocsConfig, versionConfig: VersionConfig | null): ContentSections {
  const defaultHierarchy = DEFAULT_HIERARCHY as HierarchyConfig;
  const version: VersionConfig = versionConfig ?? {};
  return {
    auth: overrideWhenSet(version.auth, config.auth),
    routesMd: pickSection<ContentTypeRouteConfig | RouteConfig>([version["routes-md"], version.routes], [config["routes-md"], config.routes]),
    routesSourceViewer: pickSection([version["routes-source-viewer"]], [config["routes-source-viewer"]]),
    routesHtml: pickSection([version["routes-html"]], [config["routes-html"]]),
    routesVideo: pickSection([version["routes-video"]], [config["routes-video"]]),
    routesAudio: pickSection([version["routes-audio"]], [config["routes-audio"]]),
    menusHeaderMd: pickSection([version["menus-header-md"], version["menus-header"]], [config["menus-header-md"], config["menus-header"]]),
    menusHeaderSourceViewer: pickSection([version["menus-header-source-viewer"]], [config["menus-header-source-viewer"]]),
    menusHeaderHtml: pickSection([version["menus-header-html"]], [config["menus-header-html"]]),
    menusHeaderVideo: pickSection([version["menus-header-video"]], [config["menus-header-video"]]),
    menusHeaderAudio: pickSection([version["menus-header-audio"]], [config["menus-header-audio"]]),
    hierarchyPage: overrideWhenSet(version.hierarchyPage, config.hierarchyPage ?? defaultHierarchy),
    hierarchyMenu: overrideWhenSet(version.hierarchyMenu, config.hierarchyMenu ?? defaultHierarchy),
  };
}

/** The selected language when the content offers it, else the site default when offered, else the first available. */
function resolvePreferredLanguage(availableLanguages: LanguageCode[], selectedLanguage: LanguageCode, defaultLanguage: LanguageCode): LanguageCode {
  if (availableLanguages.includes(selectedLanguage)) {
    return selectedLanguage;
  }
  if (availableLanguages.includes(defaultLanguage)) {
    return defaultLanguage;
  }
  return availableLanguages[0] ?? "en";
}

function buildEffectiveConfig(config: GitPageDocsConfig, sections: ContentSections, preferredLanguage: LanguageCode): GitPageDocsConfig {
  const routesForConfig: RouteConfig[] = sections.routesMd.filter(routeHasPath).map((r) => ({ id: r.id, path: r.path }));
  return {
    ...config,
    auth: sections.auth,
    // ThemeDefault/ThemeModeDefault stay as loaded: the repository's own values
    // win, and withConfigDefaults already backfilled them when absent. Forcing
    // the runtime site's defaults here would ignore a repository's fixed theme.
    site: {
      ...config.site,
      defaultLanguage: preferredLanguage,
    },
    routes: routesForConfig,
    "menus-header": sections.menusHeaderMd,
    "routes-md": sections.routesMd,
    "routes-source-viewer": sections.routesSourceViewer,
    "routes-html": sections.routesHtml,
    "routes-video": sections.routesVideo,
    "routes-audio": sections.routesAudio,
    "menus-header-md": sections.menusHeaderMd,
    "menus-header-source-viewer": sections.menusHeaderSourceViewer,
    "menus-header-html": sections.menusHeaderHtml,
    "menus-header-video": sections.menusHeaderVideo,
    "menus-header-audio": sections.menusHeaderAudio,
    hierarchyPage: sections.hierarchyPage,
    hierarchyMenu: sections.hierarchyMenu,
  };
}

function collectSortedRouteIds(sections: ContentSections): number[] {
  const routeLists: Array<Array<{ id: number }>> = [
    sections.routesMd,
    sections.routesSourceViewer,
    sections.routesHtml,
    sections.routesVideo,
    sections.routesAudio,
  ];
  const allIds = new Set<number>();
  routeLists.forEach((routes) => routes.forEach((route) => allIds.add(route.id)));
  return Array.from(allIds).sort((a, b) => a - b);
}

/** Maps every available language's value (when set), under an optional key prefix, to the page. */
function registerLanguagePaths(
  ctx: PageBuildContext,
  valuesByLanguage: Record<LanguageCode, string>,
  pageIndex: number,
  contentType: PathToPageEntry["contentType"],
  keyPrefix = "",
): void {
  ctx.availableLanguages.forEach((lang) => {
    const value = valuesByLanguage[lang];
    if (value) ctx.pathToPageMap[`${keyPrefix}${value}`] = { pageIndex, contentType };
  });
}

/** Fetches one repository text file per available language; `render` maps the fetched body (null on failure) to page content. */
async function fetchTextByLanguage(
  ctx: PageBuildContext,
  pathsByLanguage: Record<LanguageCode, string>,
  missingPathContent: string,
  render: (text: string | null) => string,
): Promise<Record<LanguageCode, string>> {
  const contentByLanguage: Record<LanguageCode, string> = {};
  await Promise.all(
    ctx.availableLanguages.map(async (langCode) => {
      const relativePath = pathsByLanguage[langCode];
      if (!relativePath) {
        contentByLanguage[langCode] = missingPathContent;
        return;
      }
      contentByLanguage[langCode] = render(await fetchRepoText(ctx.owner, ctx.repo, relativePath));
    }),
  );
  return contentByLanguage;
}

/** Every available language's value, falling back to `en`, then to `fallback`. */
function localizeByLanguage(valuesByLanguage: Record<LanguageCode, string>, languages: LanguageCode[], fallback: string): Record<LanguageCode, string> {
  const localized: Record<LanguageCode, string> = {};
  languages.forEach((lang) => {
    localized[lang] = valuesByLanguage[lang] ?? valuesByLanguage.en ?? fallback;
  });
  return localized;
}

async function loadMarkdownSection(
  ctx: PageBuildContext,
  routesMd: ContentSections["routesMd"],
  id: number,
  pageIndex: number,
): Promise<LoadedPage["md"]> {
  const mdRoute = routesMd.find((route) => route.id === id);
  if (!mdRoute || !routeHasPath(mdRoute)) {
    return undefined;
  }
  const markdownByLanguage = await fetchTextByLanguage(ctx, mdRoute.path, "<p>Missing language file path in config.</p>", (markdown) =>
    markdown ? markdownToHtml(markdown) : "<p>Unable to load remote markdown file.</p>",
  );
  const fullscreenEnabled = "fullscreenEnabled" in mdRoute ? mdRoute.fullscreenEnabled : true;
  registerLanguagePaths(ctx, mdRoute.path, pageIndex, "md");
  return { routeId: id, config: mdRoute, markdownByLanguage, fullscreenEnabled };
}

function resolveSourceViewerPath(rawPath: ContentTypeRouteConfig["source-viewer-path"], preferredLanguage: LanguageCode): string {
  if (typeof rawPath === "string") {
    return rawPath;
  }
  return rawPath?.[preferredLanguage] ?? rawPath?.en ?? Object.values(rawPath ?? {})[0] ?? "";
}

function resolveSourceViewerSection(
  ctx: PageBuildContext,
  routesSourceViewer: ContentTypeRouteConfig[],
  id: number,
  pageIndex: number,
): LoadedPage["sourceViewer"] {
  const sourceViewerRoute = routesSourceViewer.find((route) => route.id === id && route["source-viewer"] === true);
  if (!sourceViewerRoute) {
    return undefined;
  }
  const sourceViewerPath = resolveSourceViewerPath(sourceViewerRoute["source-viewer-path"], ctx.preferredLanguage);
  ctx.pathToPageMap[`page:${id}`] = { pageIndex, contentType: "source-viewer" };
  if (sourceViewerPath) ctx.pathToPageMap[`source-viewer:${sourceViewerPath}`] = { pageIndex, contentType: "source-viewer" };
  return {
    routeId: id,
    config: sourceViewerRoute,
    sourceViewerPath,
    fullscreenEnabled: sourceViewerRoute.fullscreenEnabled ?? false,
  };
}

async function loadHtmlSection(
  ctx: PageBuildContext,
  routesHtml: ContentTypeRouteConfig[],
  id: number,
  pageIndex: number,
): Promise<LoadedPage["html"]> {
  const htmlRoute = routesHtml.find((route) => route.id === id && (route.path || route.url));
  if (!htmlRoute) {
    return undefined;
  }
  let htmlByLanguage: Record<LanguageCode, string> = {};
  if (htmlRoute.path) {
    htmlByLanguage = await fetchTextByLanguage(ctx, htmlRoute.path, "<p>Missing HTML path.</p>", (html) => html ?? "<p>Unable to load remote HTML.</p>");
    registerLanguagePaths(ctx, htmlRoute.path, pageIndex, "html");
  } else if (htmlRoute.url) {
    ctx.availableLanguages.forEach((lang) => {
      htmlByLanguage[lang] = "";
    });
    registerLanguagePaths(ctx, htmlRoute.url, pageIndex, "html", "url:");
  }
  return {
    routeId: id,
    config: htmlRoute,
    htmlByLanguage,
    fullscreenEnabled: htmlRoute.fullscreenEnabled ?? true,
  };
}

function resolveVideoSection(
  ctx: PageBuildContext,
  routesVideo: ContentTypeRouteConfig[],
  id: number,
  pageIndex: number,
): LoadedPage["video"] {
  const videoRoute = routesVideo.find((route) => route.id === id && routeHasVideo(route));
  if (!videoRoute || !routeHasVideo(videoRoute)) {
    return undefined;
  }
  const videoTypeByLanguage = localizeByLanguage(videoRoute.video.videoType, ctx.availableLanguages, "youtube");
  const pathVideoByLanguage = localizeByLanguage(videoRoute.video.pathVideo, ctx.availableLanguages, "");
  ctx.pathToPageMap[`page:${id}`] = { pageIndex, contentType: "video" };
  registerLanguagePaths(ctx, pathVideoByLanguage, pageIndex, "video");
  return {
    routeId: id,
    config: videoRoute,
    videoTypeByLanguage,
    pathVideoByLanguage,
    fullscreenEnabled: videoRoute.fullscreenEnabled ?? true,
  };
}

function resolveAudioSection(
  ctx: PageBuildContext,
  routesAudio: ContentTypeRouteConfig[],
  id: number,
  pageIndex: number,
): LoadedPage["audio"] {
  const audioRoute = routesAudio.find((route) => route.id === id && routeHasAudio(route));
  if (!audioRoute || !routeHasAudio(audioRoute)) {
    return undefined;
  }
  const audioTypeByLanguage = localizeByLanguage(audioRoute.audio.audioType, ctx.availableLanguages, "youtube");
  const pathAudioByLanguage = localizeByLanguage(audioRoute.audio.pathAudio, ctx.availableLanguages, "");
  ctx.pathToPageMap[`page:${id}`] = { pageIndex, contentType: "audio" };
  registerLanguagePaths(ctx, pathAudioByLanguage, pageIndex, "audio");
  return {
    routeId: id,
    config: audioRoute,
    audioTypeByLanguage,
    pathAudioByLanguage,
    fullscreenEnabled: audioRoute.fullscreenEnabled ?? true,
  };
}

/** One page per route id: each content type contributes its section and registers its paths, in md, source-viewer, html, video, audio order. */
async function buildPage(ctx: PageBuildContext, sections: ContentSections, id: number, pageIndex: number): Promise<LoadedPage> {
  const page: LoadedPage = { id };
  const md = await loadMarkdownSection(ctx, sections.routesMd, id, pageIndex);
  if (md) page.md = md;
  const sourceViewer = resolveSourceViewerSection(ctx, sections.routesSourceViewer, id, pageIndex);
  if (sourceViewer) page.sourceViewer = sourceViewer;
  const html = await loadHtmlSection(ctx, sections.routesHtml, id, pageIndex);
  if (html) page.html = html;
  const video = resolveVideoSection(ctx, sections.routesVideo, id, pageIndex);
  if (video) page.video = video;
  const audio = resolveAudioSection(ctx, sections.routesAudio, id, pageIndex);
  if (audio) page.audio = audio;
  return page;
}

/** Pages are built one after another so their remote reads keep the route-id order. */
async function buildPages(ctx: PageBuildContext, sections: ContentSections): Promise<LoadedPage[]> {
  const sortedIds = collectSortedRouteIds(sections);
  const pages: LoadedPage[] = [];
  for (let pageIndex = 0; pageIndex < sortedIds.length; pageIndex++) {
    pages.push(await buildPage(ctx, sections, sortedIds[pageIndex], pageIndex));
  }
  return pages;
}

/** The repository's layouts, degrading to the built-in fallback when none can be loaded. */
async function loadLayoutsOrFallback(config: GitPageDocsConfig, owner: string, repo: string): Promise<LayoutsAndThemes> {
  try {
    return await loadLayoutsAndThemes(config, owner, repo);
  } catch {
    return buildFallbackLayoutsAndThemes();
  }
}

export async function loadRemoteDocsData(
  owner: string,
  repo: string,
  selectedVersionId?: string,
  selectedLanguage: SupportedLanguage = "en",
): Promise<LoadedDocsData | null> {
  const localizedConfig = await fetchLocalizedRepoConfig(owner, repo);
  if (!localizedConfig) {
    return null;
  }
  // Backfill the `site` section so OLD config.json files inherit the current
  // config.json defaults (header control icons, en/pt/es langmenu, language).
  const config = withConfigDefaults(localizedConfig);

  const versions = dedupeVersionEntriesById(config.VersionControl?.versions ?? []);
  const activeVersion = resolveActiveVersion(versions, selectedVersionId, config.site.docsVersion);
  const activeVersionId = activeVersion?.id;
  const versionConfig = activeVersion ? await loadVersionConfig(owner, repo, activeVersion) : null;
  const sections = resolveContentSections(config, versionConfig);

  const availableLanguages = applyLanguageToggles(
    config,
    getAvailableLanguagesFromContent(
      sections.routesMd,
      sections.routesSourceViewer,
      sections.routesHtml,
      sections.routesVideo,
      sections.routesAudio,
      config.site.defaultLanguage,
    ),
  );
  const preferredLanguage = resolvePreferredLanguage(availableLanguages, selectedLanguage, config.site.defaultLanguage);
  const effectiveConfig = buildEffectiveConfig(config, sections, preferredLanguage);

  const pathToPageMap: Record<string, PathToPageEntry> = {};
  const pages = await buildPages({ owner, repo, availableLanguages, preferredLanguage, pathToPageMap }, sections);
  const docs = pages
    .filter((page) => page.md)
    .map((page) => ({
      routeId: page.id,
      markdownByLanguage: page.md!.markdownByLanguage,
    }));
  const { layoutsConfig, themes } = await loadLayoutsOrFallback(effectiveConfig, owner, repo);

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
