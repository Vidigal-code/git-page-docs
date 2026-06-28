import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";
import { ensureTrailingSlash, toRawGithubUrl } from "@/shared/lib/remote/github-url";
import type {
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
  DEFAULT_LAYOUTS_PATH,
  DEFAULT_TEMPLATES_BASE_PATH,
  OFFICIAL_LAYOUTS_CONFIG_URL,
  OFFICIAL_LAYOUTS_TEMPLATES_URL,
} from "@/shared/config/remote-urls";
import { DEFAULT_HIERARCHY } from "@/shared/config/constants";
import {
  fetchRepoText,
  fetchRepoJson,
  fetchUrlJson,
} from "@/shared/api/fetch-client";
import { SITE_CONFIG_DEFAULTS, withConfigDefaults } from "../lib/with-config-defaults";
import { markdownToHtml } from "./utils/markdown";

type VersionConfig = {
  auth?: GitPageDocsConfig["auth"];
  routes?: RouteConfig[];
  "menus-header"?: HeaderMenuItem[];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "routes-audio"?: ContentTypeRouteConfig[];
  "menus-header-md"?: HeaderMenuItem[];
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

function getLanguagesFromRecord(record: Record<LanguageCode, string> | undefined): LanguageCode[] {
  if (!record || typeof record !== "object") return [];
  return Object.keys(record);
}

function getAvailableLanguagesFromContent(
  routesMd: Array<ContentTypeRouteConfig | RouteConfig>,
  routesHtml: ContentTypeRouteConfig[],
  routesVideo: ContentTypeRouteConfig[],
  routesAudio: ContentTypeRouteConfig[],
  fallbackLanguage: LanguageCode,
): LanguageCode[] {
  const mdPath = routesMd.find((route) => route.path && Object.keys(route.path).length > 0)?.path;
  if (mdPath) return getLanguagesFromRecord(mdPath);

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
  const rawConfig = await fetchRepoJson<GitPageDocsConfig>(owner, repo, "gitpagedocs/config.json");
  if (!rawConfig) {
    return null;
  }
  // Backfill the `site` section so OLD config.json files inherit the current
  // config.json defaults (header control icons, en/pt/es langmenu, language).
  const config = withConfigDefaults(rawConfig);

  const versions = dedupeVersionEntriesById(config.VersionControl?.versions ?? []);
  const activeVersion = resolveActiveVersion(versions, selectedVersionId, config.site.docsVersion);
  const activeVersionId = activeVersion?.id;

  const defaultHierarchy = DEFAULT_HIERARCHY as HierarchyConfig;
  let auth = config.auth;
  let routesMd = config["routes-md"] ?? config.routes ?? [];
  let routesHtml = config["routes-html"] ?? [];
  let routesVideo = config["routes-video"] ?? [];
  let routesAudio = config["routes-audio"] ?? [];
  let menusHeaderMd = config["menus-header-md"] ?? config["menus-header"] ?? [];
  let menusHeaderHtml = config["menus-header-html"] ?? [];
  let menusHeaderVideo = config["menus-header-video"] ?? [];
  let menusHeaderAudio = config["menus-header-audio"] ?? [];
  let hierarchyPage = config.hierarchyPage ?? defaultHierarchy;
  let hierarchyMenu = config.hierarchyMenu ?? defaultHierarchy;

  if (activeVersion) {
    const versionConfig = await loadVersionConfig(owner, repo, activeVersion);
    if (versionConfig?.auth) auth = versionConfig.auth;
    if (versionConfig?.["routes-md"]?.length) routesMd = versionConfig["routes-md"];
    else if (versionConfig?.routes?.length) routesMd = versionConfig.routes;
    if (versionConfig?.["routes-html"]?.length) routesHtml = versionConfig["routes-html"];
    if (versionConfig?.["routes-video"]?.length) routesVideo = versionConfig["routes-video"];
    if (versionConfig?.["routes-audio"]?.length) routesAudio = versionConfig["routes-audio"];
    if (versionConfig?.["menus-header-md"]?.length) menusHeaderMd = versionConfig["menus-header-md"];
    else if (versionConfig?.["menus-header"]?.length) menusHeaderMd = versionConfig["menus-header"];
    if (versionConfig?.["menus-header-html"]?.length) menusHeaderHtml = versionConfig["menus-header-html"];
    if (versionConfig?.["menus-header-video"]?.length) menusHeaderVideo = versionConfig["menus-header-video"];
    if (versionConfig?.["menus-header-audio"]?.length) menusHeaderAudio = versionConfig["menus-header-audio"];
    if (versionConfig?.hierarchyPage) hierarchyPage = versionConfig.hierarchyPage;
    if (versionConfig?.hierarchyMenu) hierarchyMenu = versionConfig.hierarchyMenu;
  }

  const routesWithPath = routesMd.filter(routeHasPath);
  const availableLanguages = getAvailableLanguagesFromContent(
    routesMd,
    routesHtml,
    routesVideo,
    routesAudio,
    config.site.defaultLanguage,
  );
  const preferredLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : availableLanguages.includes(config.site.defaultLanguage)
      ? config.site.defaultLanguage
      : availableLanguages[0] ?? "en";

  const routesForConfig: RouteConfig[] = routesWithPath.map((r) => ({ id: r.id, path: r.path }));
  const allIds = new Set<number>();
  routesMd.forEach((route) => allIds.add(route.id));
  routesHtml.forEach((route) => allIds.add(route.id));
  routesVideo.forEach((route) => allIds.add(route.id));
  routesAudio.forEach((route) => allIds.add(route.id));
  const sortedIds = Array.from(allIds).sort((a, b) => a - b);

  const effectiveConfig: GitPageDocsConfig = {
    ...config,
    auth,
    site: {
      ...config.site,
      defaultLanguage: preferredLanguage,
      ThemeDefault: SITE_CONFIG_DEFAULTS.ThemeDefault,
      ThemeModeDefault: SITE_CONFIG_DEFAULTS.ThemeModeDefault,
    },
    routes: routesForConfig,
    "menus-header": menusHeaderMd,
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

  const pathToPageMap: Record<string, PathToPageEntry> = {};
  const pages: LoadedPage[] = [];

  for (let pageIndex = 0; pageIndex < sortedIds.length; pageIndex++) {
    const id = sortedIds[pageIndex];
    const page: LoadedPage = { id };

    const mdRoute = routesMd.find((route) => route.id === id);
    if (mdRoute && routeHasPath(mdRoute)) {
      const markdownByLanguage: Record<LanguageCode, string> = {};
      await Promise.all(
        availableLanguages.map(async (langCode) => {
          const markdownPath = mdRoute.path[langCode];
          if (!markdownPath) {
            markdownByLanguage[langCode] = "<p>Missing language file path in config.</p>";
            return;
          }
          const markdown = await fetchRepoText(owner, repo, markdownPath);
          markdownByLanguage[langCode] = markdown
            ? markdownToHtml(markdown)
            : "<p>Unable to load remote markdown file.</p>";
        }),
      );
      const fullscreenEnabled = "fullscreenEnabled" in mdRoute ? mdRoute.fullscreenEnabled : true;
      page.md = { routeId: id, config: mdRoute, markdownByLanguage, fullscreenEnabled };
      availableLanguages.forEach((lang) => {
        const pathVal = mdRoute.path[lang];
        if (pathVal) pathToPageMap[pathVal] = { pageIndex, contentType: "md" };
      });
    }

    const htmlRoute = routesHtml.find((route) => route.id === id && (route.path || route.url));
    if (htmlRoute) {
      const htmlByLanguage: Record<LanguageCode, string> = {};
      if (htmlRoute.path) {
        await Promise.all(
          availableLanguages.map(async (langCode) => {
            const htmlPath = htmlRoute.path?.[langCode];
            if (!htmlPath) {
              htmlByLanguage[langCode] = "<p>Missing HTML path.</p>";
              return;
            }
            htmlByLanguage[langCode] = (await fetchRepoText(owner, repo, htmlPath)) ?? "<p>Unable to load remote HTML.</p>";
          }),
        );
        availableLanguages.forEach((lang) => {
          const pathVal = htmlRoute.path?.[lang];
          if (pathVal) pathToPageMap[pathVal] = { pageIndex, contentType: "html" };
        });
      } else if (htmlRoute.url) {
        availableLanguages.forEach((lang) => {
          htmlByLanguage[lang] = "";
          const urlVal = htmlRoute.url?.[lang];
          if (urlVal) pathToPageMap[`url:${urlVal}`] = { pageIndex, contentType: "html" };
        });
      }
      page.html = {
        routeId: id,
        config: htmlRoute,
        htmlByLanguage,
        fullscreenEnabled: htmlRoute.fullscreenEnabled ?? true,
      };
    }

    const videoRoute = routesVideo.find((route) => route.id === id && routeHasVideo(route));
    if (videoRoute && routeHasVideo(videoRoute)) {
      const videoTypeByLanguage: Record<LanguageCode, string> = {};
      const pathVideoByLanguage: Record<LanguageCode, string> = {};
      availableLanguages.forEach((lang) => {
        videoTypeByLanguage[lang] = videoRoute.video.videoType[lang] ?? videoRoute.video.videoType.en ?? "youtube";
        pathVideoByLanguage[lang] = videoRoute.video.pathVideo[lang] ?? videoRoute.video.pathVideo.en ?? "";
      });
      page.video = {
        routeId: id,
        config: videoRoute,
        videoTypeByLanguage,
        pathVideoByLanguage,
        fullscreenEnabled: videoRoute.fullscreenEnabled ?? true,
      };
      pathToPageMap[`page:${id}`] = { pageIndex, contentType: "video" };
      availableLanguages.forEach((lang) => {
        const videoPath = pathVideoByLanguage[lang];
        if (videoPath) pathToPageMap[videoPath] = { pageIndex, contentType: "video" };
      });
    }

    const audioRoute = routesAudio.find((route) => route.id === id && routeHasAudio(route));
    if (audioRoute && routeHasAudio(audioRoute)) {
      const audioTypeByLanguage: Record<LanguageCode, string> = {};
      const pathAudioByLanguage: Record<LanguageCode, string> = {};
      availableLanguages.forEach((lang) => {
        audioTypeByLanguage[lang] = audioRoute.audio.audioType[lang] ?? audioRoute.audio.audioType.en ?? "youtube";
        pathAudioByLanguage[lang] = audioRoute.audio.pathAudio[lang] ?? audioRoute.audio.pathAudio.en ?? "";
      });
      page.audio = {
        routeId: id,
        config: audioRoute,
        audioTypeByLanguage,
        pathAudioByLanguage,
        fullscreenEnabled: audioRoute.fullscreenEnabled ?? true,
      };
      pathToPageMap[`page:${id}`] = { pageIndex, contentType: "audio" };
      availableLanguages.forEach((lang) => {
        const audioPath = pathAudioByLanguage[lang];
        if (audioPath) pathToPageMap[audioPath] = { pageIndex, contentType: "audio" };
      });
    }

    pages.push(page);
  }

  const docs = pages
    .filter((page) => page.md)
    .map((page) => ({
      routeId: page.id,
      markdownByLanguage: page.md!.markdownByLanguage,
    }));

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
