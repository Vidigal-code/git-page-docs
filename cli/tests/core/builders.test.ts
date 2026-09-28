import { describe, it, expect } from "vitest";
import { buildRootConfig } from "../../builders/root-config-builder.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as orchestrator from "../../builders/config-orchestrator.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as versionConfigBuilder from "../../builders/version-config-builder.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as routeBuilders from "../../builders/route-builders.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as themeTemplate from "../../builders/theme-template.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as projectLinks from "../../builders/project-links.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as languageBundlesBuilder from "../../builders/language-bundles-builder.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as layoutsData from "../../data/layouts.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as themeColorsData from "../../data/theme-colors.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as docVersions from "../../contracts/doc-versions.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as languages from "../../contracts/languages.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as docsContent from "../../content/docs.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as urls from "../../data/urls.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as pathMappings from "../../data/path-mappings.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as routeMetas from "../../data/route-metas.mjs";

type Lang = "pt" | "en" | "es";
type LangMap = Record<Lang, string>;
const LANGS: Lang[] = ["pt", "en", "es"];

interface Route {
  id: number;
  title: LangMap;
  description: LangMap;
  path?: LangMap;
  audio?: unknown;
  authorization?: Record<string, unknown>;
  video?: { videoType: LangMap; pathVideo: LangMap };
  [key: string]: unknown;
}

interface AudioRoute extends Route {
  audio: { audioType: LangMap; pathAudio: LangMap };
}

interface MenuLang {
  title: string;
  "path-click": string;
}

interface MenuEntry {
  id: number;
  pt: MenuLang;
  en: MenuLang;
  es: MenuLang;
}

interface VersionConfig {
  auth: { accessKeys: Record<string, string>; providers: Array<{ type: string }> };
  "routes-md": Route[];
  "routes-source-viewer": Route[];
  "routes-html": Route[];
  "routes-video": Route[];
  "routes-audio": AudioRoute[];
  "menus-header-md": MenuEntry[];
  "menus-header-source-viewer": MenuEntry[];
  "menus-header-html": MenuEntry[];
  "menus-header-video": MenuEntry[];
  "menus-header-audio": MenuEntry[];
  hierarchyPage: Record<string, number>;
  hierarchyMenu: Record<string, number>;
}

interface Layout {
  id: string;
  name: string;
  author: string;
  file: string;
  preview: string;
  supportsLightAndDarkModes: boolean;
  mode: "dark" | "light";
}

type ThemeColors = Record<string, string>;

interface ThemeTemplate {
  id: string;
  name: string;
  author: string;
  version: string;
  mode: string;
  supportsLightAndDarkModes: boolean;
  colors: ThemeColors;
  components: {
    header: { backgroundColor: string };
    footer: { backgroundColor: string };
    select: { iconColor: string; backgroundColor: string; border: string };
    button: { border: string };
    checkbox: { accentColor: string; checkMarkColor: string };
  };
  animations: { enableGlow: boolean };
}

interface LanguageBundle {
  langmenu: Record<string, string>;
  translations: Record<string, Record<string, string>>;
}

interface Artifacts {
  rootConfig: { site: Record<string, unknown>; VersionControl: { versions: Array<Record<string, unknown>> } };
  languageBundles: Record<string, LanguageBundle>;
  layoutsConfig: { layouts: Layout[] };
  fallbackLayoutsConfig: { layouts: Layout[] };
  docs: Record<string, Record<string, string>>;
  docsHtml: Record<string, unknown>;
  versionConfigs: Record<string, VersionConfig>;
}

type RouteOptions = Record<string, unknown>;

const { buildConfigArtifacts } = orchestrator as {
  buildConfigArtifacts(options?: Record<string, unknown>): Artifacts;
};
const { buildVersionConfig } = versionConfigBuilder as {
  buildVersionConfig(versionId: string, options?: { githubOwner?: string; githubRepo?: string }): VersionConfig;
};
const { buildMdRoute, buildHtmlRoute, buildVideoRoute, buildAudioRoute, buildSourceViewerRoute } = routeBuilders as {
  buildMdRoute(versionId: string, routeId: number, pathByLang: Partial<LangMap>, titles?: LangMap, descriptions?: LangMap, options?: RouteOptions): Route;
  buildHtmlRoute(versionId: string, routeId: number, pathByLang: Partial<LangMap>, titles?: LangMap, descriptions?: LangMap, options?: RouteOptions): Route;
  buildVideoRoute(versionId: string, routeId: number, videoType: string | LangMap, pathVideo: string | LangMap, titles?: LangMap, descriptions?: LangMap, options?: RouteOptions): Route;
  buildAudioRoute(versionId: string, routeId: number, audioType: string | LangMap, pathAudio: string | LangMap, titles?: LangMap, descriptions?: LangMap, options?: RouteOptions): AudioRoute;
  buildSourceViewerRoute(routeId: number, sourceViewerPath: string, titles?: LangMap, descriptions?: LangMap, options?: RouteOptions): Route;
};
const { createThemeTemplate } = themeTemplate as {
  createThemeTemplate(layout: Layout, themeColors?: Record<string, ThemeColors>): ThemeTemplate;
};
const { resolveProjectLink, resolveRenderingUrl, resolveLayoutsLinks, resolveSourceViewerPath, DEFAULT_PROJECT_LINK, DEFAULT_RENDERING_URL } =
  projectLinks as {
    resolveProjectLink(owner?: string, repo?: string): string;
    resolveRenderingUrl(owner?: string, repo?: string): string;
    resolveLayoutsLinks(owner: string | undefined, repo: string | undefined, layoutsDir?: string): { config: string; templates: string };
    resolveSourceViewerPath(owner?: string, repo?: string): string;
    DEFAULT_PROJECT_LINK: string;
    DEFAULT_RENDERING_URL: string;
  };
const { buildLanguageArtifacts } = languageBundlesBuilder as {
  buildLanguageArtifacts(): { languageToggles: Record<string, boolean>; languageBundles: Record<string, LanguageBundle> };
};
const { LAYOUTS, FALLBACK_LAYOUTS, MODERN_LAYOUTS } = layoutsData as {
  LAYOUTS: Layout[];
  FALLBACK_LAYOUTS: Layout[];
  MODERN_LAYOUTS: Layout[];
};
const { THEME_COLORS } = themeColorsData as { THEME_COLORS: Record<string, ThemeColors> };
const { DOC_VERSIONS, PACKAGE_VERSION } = docVersions as { DOC_VERSIONS: string[]; PACKAGE_VERSION: string };
const { SUPPORTED_LANGUAGES } = languages as { SUPPORTED_LANGUAGES: readonly string[] };
const { DOCS } = docsContent as { DOCS: Record<string, Record<string, string>> };
const { OFFICIAL_LAYOUTS_CONFIG_URL, OFFICIAL_LAYOUTS_TEMPLATES_URL } = urls as {
  OFFICIAL_LAYOUTS_CONFIG_URL: string;
  OFFICIAL_LAYOUTS_TEMPLATES_URL: string;
};
const { ROUTE_PATHS, PAGE2_AUDIO, VIDEO_IDS, AUDIO_IDS } = pathMappings as {
  ROUTE_PATHS: Record<number, LangMap>;
  PAGE2_AUDIO: Record<string, unknown>;
  VIDEO_IDS: string[];
  AUDIO_IDS: string[];
};
const { SOURCE_VIEWER_META, AUDIO_META_ID12, DEFAULT_HIERARCHY } = routeMetas as {
  SOURCE_VIEWER_META: { id: number; titles: LangMap; descriptions: LangMap };
  AUDIO_META_ID12: { id: number; title: LangMap; description: LangMap };
  DEFAULT_HIERARCHY: Record<string, number>;
};

const EXTERNAL_PROVIDERS = ["authjs", "clerk", "firebase", "jwt"];

describe("buildConfigArtifacts", () => {
  it("assembles root config, language bundles, layouts, docs and one config per doc version", () => {
    const artifacts = buildConfigArtifacts();

    expect(artifacts.rootConfig.site.layoutsConfigPathOficial).toBe(true);
    expect(artifacts.rootConfig.site.layoutsConfigPathOficialUrl).toBe(OFFICIAL_LAYOUTS_CONFIG_URL);
    expect(artifacts.rootConfig.site.layoutsConfigPathTemplatesOficial).toBe(OFFICIAL_LAYOUTS_TEMPLATES_URL);
    expect(artifacts.rootConfig.site.layoutsConfigPath).toBe("");
    expect(artifacts.rootConfig.site.layoutsConfigPathTemplates).toBe("");
    expect(Object.keys(artifacts.languageBundles)).toEqual([...SUPPORTED_LANGUAGES]);
    expect(artifacts.layoutsConfig).toEqual({ layouts: LAYOUTS });
    expect(artifacts.fallbackLayoutsConfig).toEqual({ layouts: FALLBACK_LAYOUTS });
    expect(artifacts.docs).toBe(DOCS);
    expect(artifacts.docsHtml).toEqual({});
    expect(Object.keys(artifacts.versionConfigs)).toEqual([...DOC_VERSIONS]);
  });

  it("forwards owner, repo and the local layouts home to every builder", () => {
    const artifacts = buildConfigArtifacts({
      useLocalLayoutConfig: true,
      layoutsDir: "meus-temas",
      githubOwner: "acme",
      githubRepo: "docs",
    });

    expect(artifacts.rootConfig.site.layoutsConfigPathOficial).toBe(false);
    expect(artifacts.rootConfig.site.layoutsConfigPathOficialUrl).toBe("");
    expect(artifacts.rootConfig.site.layoutsConfigPath).toBe(
      "https://github.com/acme/docs/blob/HEAD/meus-temas/layoutsConfig.json",
    );
    expect(artifacts.rootConfig.site.layoutsConfigPathTemplates).toBe(
      "https://github.com/acme/docs/blob/HEAD/meus-temas/templates",
    );
    expect(artifacts.rootConfig.site.rendering).toBe("https://acme.github.io/docs/");
    for (const versionConfig of Object.values(artifacts.versionConfigs)) {
      expect(versionConfig["routes-source-viewer"][0]["source-viewer-path"]).toBe("https://github.com/acme/docs/tree/HEAD");
    }
  });
});

describe("buildRootConfig", () => {
  it("lists one version entry per doc version pointing at the official repository", () => {
    const config = buildRootConfig();
    const entries = config.VersionControl.versions;

    expect(entries.map((entry) => entry.id)).toEqual([...DOC_VERSIONS]);
    const [entry] = entries;
    expect(entry.path).toBe(`gitpagedocs/docs/versions/${String(entry.id)}/config.json`);
    expect(entry.PathConfig).toBe(entry.path);
    expect(entry.ProjectLink).toBe(DEFAULT_PROJECT_LINK);
    expect(entry["source-viewer"]).toBe(true);
    expect(entry["source-viewer-path"]).toBe(`${DEFAULT_PROJECT_LINK}/tree/main`);

    expect(config.site.ProjectLink).toBe(DEFAULT_PROJECT_LINK);
    expect(config.site.FooterLinkUrl).toBe(DEFAULT_PROJECT_LINK);
    expect(config.site.rendering).toBe(DEFAULT_RENDERING_URL);
    expect(config.site.repositorySearchHome).toBe(true);
    expect(config.site.AiChatEnabled).toBe(true);
    expect(config.site.docsAccess).toEqual({ enabled: false, publicKey: "" });
    expect(config.site.languages).toEqual({ en: true, pt: true, es: true });
    expect(config.site.defaultLanguage).toBe("en");
  });

  it("derives project, rendering and source-viewer links from owner and repo", () => {
    const config = buildRootConfig({ githubOwner: "acme", githubRepo: "docs" });

    expect(config.site.ProjectLink).toBe("https://github.com/acme/docs");
    expect(config.site.FooterLinkUrl).toBe("https://github.com/acme/docs");
    expect(config.site.rendering).toBe("https://acme.github.io/docs/");
    expect(config.VersionControl.versions[0]["source-viewer-path"]).toBe("https://github.com/acme/docs/tree/HEAD");
  });

  it("uses the supplied language toggles verbatim", () => {
    const options = { languageToggles: { en: true, pt: false, es: true } } as unknown as Parameters<typeof buildRootConfig>[0];
    expect(buildRootConfig(options).site.languages).toEqual({ en: true, pt: false, es: true });
  });
});

describe("buildVersionConfig", () => {
  const versionId = "1.2.3";
  const base = `gitpagedocs/docs/versions/${versionId}`;

  it("builds a markdown route per language with the demo protections on the official scaffold", () => {
    const config = buildVersionConfig(versionId);
    const md = config["routes-md"];

    expect(md.map((route) => route.id)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const route of md) {
      for (const lang of LANGS) {
        expect(route.path?.[lang]).toBe(`${base}/${lang}/${ROUTE_PATHS[route.id][lang]}`);
      }
    }
    expect(md[1].audio).toEqual(PAGE2_AUDIO);
    expect(md[0].audio).toBeUndefined();
    expect(md[2].authorization).toEqual({ requiredRoles: ["maintainer"] });
    expect(md[5].authorization).toEqual({
      accessKeyId: "docs-key",
      requiredRoles: ["maintainer"],
      requireExternalAuth: true,
      allowedProviders: EXTERNAL_PROVIDERS,
    });
    expect(md[0].authorization).toBeUndefined();
    expect(config.auth.accessKeys["docs-key"]).toBe("open-gitpagedocs-docs");
    expect(config.auth.providers.map((provider) => provider.type)).toEqual(EXTERNAL_PROVIDERS);
  });

  it("builds video, audio and source-viewer routes plus the matching header menus", () => {
    const config = buildVersionConfig(versionId);

    const video = config["routes-video"];
    expect(video.map((route) => route.id)).toEqual([8, 9, 10, 11]);
    expect(video[0].video).toEqual({
      videoType: { pt: "youtube", en: "youtube", es: "youtube" },
      pathVideo: { pt: VIDEO_IDS[0], en: VIDEO_IDS[0], es: VIDEO_IDS[0] },
    });
    expect(video[0].authorization).toEqual({ requireExternalAuth: true, allowedProviders: EXTERNAL_PROVIDERS });
    expect(video.filter((route) => route.authorization).map((route) => route.id)).toEqual([8, 9, 10]);
    expect(video[3].authorization).toBeUndefined();

    const [audio] = config["routes-audio"];
    expect(audio.id).toBe(AUDIO_META_ID12.id);
    expect(audio.title).toEqual(AUDIO_META_ID12.title);
    expect(audio.audio.pathAudio.en).toBe(AUDIO_IDS[0]);
    expect(audio.video).toBeUndefined();

    const [viewer] = config["routes-source-viewer"];
    expect(viewer.id).toBe(SOURCE_VIEWER_META.id);
    expect(viewer["source-viewer"]).toBe(true);
    expect(viewer["source-viewer-path"]).toBe(`${DEFAULT_PROJECT_LINK}/tree/main`);
    expect(viewer.path).toBeUndefined();
    expect(config["routes-html"]).toEqual([]);

    expect(config["menus-header-html"]).toEqual([]);
    expect(config["menus-header-md"].map((entry) => entry.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(config["menus-header-md"][0].en["path-click"]).toBe(`${base}/en/${ROUTE_PATHS[1].en}`);
    expect(config["menus-header-video"].map((entry) => entry.id)).toEqual([8, 9, 10, 11]);
    expect(config["menus-header-video"][0].en["path-click"]).toBe("page:8");
    expect(config["menus-header-video"][0].pt.title.endsWith("...")).toBe(true);
    expect(config["menus-header-audio"][0]).toMatchObject({ id: AUDIO_META_ID12.id, en: { "path-click": `page:${AUDIO_META_ID12.id}` } });
    expect(config["menus-header-source-viewer"][0]).toMatchObject({
      id: SOURCE_VIEWER_META.id,
      es: { title: SOURCE_VIEWER_META.titles.es, "path-click": `page:${SOURCE_VIEWER_META.id}` },
    });
    expect(config.hierarchyPage).toEqual(DEFAULT_HIERARCHY);
    expect(config.hierarchyMenu).toEqual(DEFAULT_HIERARCHY);
  });

  it("keeps user sites public and points their source viewer at the HEAD ref", () => {
    const config = buildVersionConfig(versionId, { githubOwner: "acme", githubRepo: "docs" });

    for (const route of [...config["routes-md"], ...config["routes-video"]]) {
      expect(route.authorization).toBeUndefined();
    }
    expect(config["routes-md"][1].audio).toEqual(PAGE2_AUDIO);
    expect(config["routes-source-viewer"][0]["source-viewer-path"]).toBe("https://github.com/acme/docs/tree/HEAD");
  });
});

describe("route builders", () => {
  const paths: LangMap = { pt: "pt/a.md", en: "en/a.md", es: "es/a.md" };
  const titles: LangMap = { pt: "T-pt", en: "T-en", es: "T-es" };
  const descriptions: LangMap = { pt: "D-pt", en: "D-en", es: "D-es" };

  it("buildMdRoute applies defaults and only adds optional blocks when provided", () => {
    const route = buildMdRoute("1.0.0", 3, paths);

    expect(route.id).toBe(3);
    expect(route.path).toEqual(paths);
    expect(route.title).toEqual({ pt: "Documentação", en: "Documentation", es: "Documentación" });
    expect(route.description).toEqual({ pt: "Descrição da página", en: "Page description", es: "Descripción da página".replace("da", "de la") });
    expect(route.fullscreenEnabled).toBe(true);
    expect(route.titlePosition).toBe("center");
    expect(route.RouteguideBrand).toBe(true);
    expect(route.RouteGuideSpeciFicbrand).toEqual([]);
    expect(route).not.toHaveProperty("audio");
    expect(route).not.toHaveProperty("authorization");
    expect(route.container).toBeUndefined();

    const custom = buildMdRoute("1.0.0", 4, paths, titles, descriptions, {
      titlePosition: "left",
      container: "wide",
      audio: { enabled: true },
      authorization: { requiredRoles: ["dev"] },
      RouteguideBrand: false,
    });
    expect(custom.title).toEqual(titles);
    expect(custom.description).toEqual(descriptions);
    expect(custom.titlePosition).toBe("left");
    expect(custom.container).toBe("wide");
    expect(custom.audio).toEqual({ enabled: true });
    expect(custom.authorization).toEqual({ requiredRoles: ["dev"] });
    expect(custom.RouteguideBrand).toBe(false);
  });

  it("buildHtmlRoute is a markdown route copy", () => {
    const md = buildMdRoute("1.0.0", 5, paths, titles, descriptions);
    const html = buildHtmlRoute("1.0.0", 5, paths, titles, descriptions);
    expect(html).toEqual(md);
    expect(html).not.toBe(md);
  });

  it("buildVideoRoute replicates scalar media values per language and keeps per-language maps", () => {
    const scalar = buildVideoRoute("1.0.0", 8, "youtube", "abc123");
    expect(scalar.video).toEqual({
      videoType: { pt: "youtube", en: "youtube", es: "youtube" },
      pathVideo: { pt: "abc123", en: "abc123", es: "abc123" },
    });
    expect(scalar.title).toEqual({ pt: "Vídeo", en: "Video", es: "Vídeo" });
    expect(scalar).not.toHaveProperty("container");
    expect(scalar).not.toHaveProperty("authorization");
    expect(scalar).not.toHaveProperty("path");

    const perLang = buildVideoRoute(
      "1.0.0",
      9,
      { pt: "vimeo", en: "youtube", es: "vimeo" },
      { pt: "p", en: "e", es: "s" },
      titles,
      descriptions,
      { container: "narrow", authorization: { requireExternalAuth: true }, browseAll: true },
    );
    expect(perLang.video).toEqual({ videoType: { pt: "vimeo", en: "youtube", es: "vimeo" }, pathVideo: { pt: "p", en: "e", es: "s" } });
    expect(perLang.container).toBe("narrow");
    expect(perLang.authorization).toEqual({ requireExternalAuth: true });
    expect(perLang.browseAll).toBe(true);
  });

  it("buildAudioRoute swaps the video block for an audio block", () => {
    const route = buildAudioRoute("1.0.0", 12, "youtube", "track", titles, descriptions);
    expect(route).not.toHaveProperty("video");
    expect(route.audio).toEqual({
      audioType: { pt: "youtube", en: "youtube", es: "youtube" },
      pathAudio: { pt: "track", en: "track", es: "track" },
    });
    expect(route.title).toEqual(titles);

    const perLang = buildAudioRoute("1.0.0", 13, { pt: "a", en: "b", es: "c" }, { pt: "1", en: "2", es: "3" });
    expect(perLang.audio).toEqual({ audioType: { pt: "a", en: "b", es: "c" }, pathAudio: { pt: "1", en: "2", es: "3" } });
  });

  it("buildSourceViewerRoute has no path, disables fullscreen and the brand guide, and carries the viewer link", () => {
    const route = buildSourceViewerRoute(7, "https://github.com/acme/docs/tree/HEAD", titles, descriptions, {
      fullscreenEnabled: true,
      RouteguideBrand: true,
      titlePosition: "right",
    });
    expect(route).not.toHaveProperty("path");
    expect(route["source-viewer"]).toBe(true);
    expect(route["source-viewer-path"]).toBe("https://github.com/acme/docs/tree/HEAD");
    expect(route.fullscreenEnabled).toBe(false);
    expect(route.RouteguideBrand).toBe(false);
    expect(route.titlePosition).toBe("right");
    expect(route.title).toEqual(titles);
  });
});

describe("createThemeTemplate", () => {
  it("renders every shipped layout with its palette (or the default one) and the package version", () => {
    expect(LAYOUTS.length).toBeGreaterThan(0);
    for (const layout of LAYOUTS) {
      const template = createThemeTemplate(layout);
      const expectedColors = THEME_COLORS[layout.id] ?? THEME_COLORS.default;
      const dark = layout.mode === "dark";

      expect(template.id).toBe(layout.id);
      expect(template.name).toBe(layout.name);
      expect(template.author).toBe(layout.author);
      expect(template.version).toBe(PACKAGE_VERSION);
      expect(template.mode).toBe(layout.mode);
      expect(template.supportsLightAndDarkModes).toBe(layout.supportsLightAndDarkModes);
      expect(template.colors).toBe(expectedColors);
      expect(template.components.header.backgroundColor).toBe(dark ? "#0B1220" : "#FFFFFF");
      expect(template.components.select.backgroundColor).toBe(expectedColors.cardBackground);
      expect(template.components.select.border).toBe(`1px solid ${expectedColors.cardBorder}`);
      expect(template.components.button.border).toBe(`1px solid ${expectedColors.cardBorder}`);
      expect(template.components.select.iconColor).toBe(expectedColors.secondary);
      expect(template.components.checkbox.accentColor).toBe(expectedColors.primary);
      expect(template.components.checkbox.checkMarkColor).toBe(expectedColors.background);
      expect(template.animations.enableGlow).toBe(dark);
    }
  });

  it("falls back to the default palette of a custom color map", () => {
    const palette: Record<string, ThemeColors> = {
      default: { background: "#000", primary: "#111", secondary: "#222", text: "#333" },
    };
    const layout: Layout = {
      id: "custom",
      name: "Custom",
      author: "tests",
      file: "templates/custom.json",
      preview: "",
      supportsLightAndDarkModes: false,
      mode: "light",
    };
    const template = createThemeTemplate(layout, palette);
    expect(template.colors).toBe(palette.default);
    expect(template.components.footer.backgroundColor).toBe("#FFFFFF");
    expect(template.animations.enableGlow).toBe(false);
  });
});

describe("layout data", () => {
  it("ships 25 modern layouts, each with a template file named after its id", () => {
    expect(MODERN_LAYOUTS).toHaveLength(25);
    for (const layout of MODERN_LAYOUTS) {
      expect(layout.file).toBe(`templates/${layout.id}.json`);
      expect(["dark", "light"]).toContain(layout.mode);
      expect(layout.supportsLightAndDarkModes).toBe(false);
    }
  });

  it("uses unique ids and falls back to the aurora pair", () => {
    const ids = LAYOUTS.map((layout) => layout.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FALLBACK_LAYOUTS.map((layout) => layout.id)).toEqual(["aurora-dark", "aurora-light"]);
  });
});

describe("project links", () => {
  it("falls back to the official repository without an owner/repo pair", () => {
    expect(resolveProjectLink()).toBe(DEFAULT_PROJECT_LINK);
    expect(resolveProjectLink("acme")).toBe(DEFAULT_PROJECT_LINK);
    expect(resolveProjectLink(undefined, "docs")).toBe(DEFAULT_PROJECT_LINK);
    expect(resolveRenderingUrl()).toBe(DEFAULT_RENDERING_URL);
    expect(resolveSourceViewerPath("", "")).toBe(`${DEFAULT_PROJECT_LINK}/tree/main`);
    expect(resolveLayoutsLinks("", "", "gitpagelayouts")).toEqual({
      config: "gitpagelayouts/layoutsConfig.json",
      templates: "gitpagelayouts/templates",
    });
  });

  it("derives every link from the owner/repo pair", () => {
    expect(resolveProjectLink("acme", "docs")).toBe("https://github.com/acme/docs");
    expect(resolveRenderingUrl("acme", "docs")).toBe("https://acme.github.io/docs/");
    expect(resolveSourceViewerPath("acme", "docs")).toBe("https://github.com/acme/docs/tree/HEAD");
    expect(resolveLayoutsLinks("acme", "docs", "/themes/")).toEqual({
      config: "https://github.com/acme/docs/blob/HEAD/themes/layoutsConfig.json",
      templates: "https://github.com/acme/docs/blob/HEAD/themes/templates",
    });
  });
});

describe("buildLanguageArtifacts", () => {
  it("enables every supported language and splits one UI bundle per language", () => {
    const { languageToggles, languageBundles } = buildLanguageArtifacts();

    expect(languageToggles).toEqual({ en: true, pt: true, es: true });
    expect(Object.keys(languageBundles)).toEqual([...SUPPORTED_LANGUAGES]);
    for (const language of SUPPORTED_LANGUAGES) {
      const bundle = languageBundles[language];
      expect(typeof bundle.langmenu.footerLabel).toBe("string");
      expect(typeof bundle.translations.notFound.title).toBe("string");
      expect(typeof bundle.translations.navigation.next).toBe("string");
    }
    expect(languageBundles.en.langmenu.en).toBe("English");
    expect(languageBundles.pt.translations.footer.footerLabel).toBe("Projeto");
  });
});

describe("docs content", () => {
  it("provides an index and every routed page for each supported language", () => {
    const routedKeys = ["index", "gettingStarted", "projectOverview", "functionalities", "githubIssuesProjects", "gitIntroduction", "authorizedRoutes"];
    for (const language of SUPPORTED_LANGUAGES) {
      for (const key of routedKeys) {
        expect(typeof DOCS[language][key], `${language}.${key}`).toBe("string");
        expect(DOCS[language][key].trim().length).toBeGreaterThan(0);
      }
    }
  });
});
