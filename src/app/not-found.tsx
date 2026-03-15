"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
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
import { DocsShell } from "@/widgets/docs-shell/docs-shell";

function getBasePath(): string {
  if (typeof window === "undefined") return "/git-page-docs";
  const p = window.location.pathname;
  return p.startsWith("/git-page-docs") ? "/git-page-docs" : "";
}

const NOT_INSTALLED = {
  en: "GitPageDocs is not installed.",
  pt: "GitPageDocs Não instalado.",
  es: "GitPageDocs no está instalado.",
};

const INSTALLED_NOT_PRERENDERED = {
  en: "GitPageDocs is installed in this repository.",
  pt: "GitPageDocs esta instalado neste repositorio.",
  es: "GitPageDocs esta instalado en este repositorio.",
};

const SEARCH_PROMPT = {
  en: "Enter owner and repository to open remote documentation.",
  pt: "Informe usuário e repositório para abrir a documentação remota.",
  es: "Ingresa usuario y repositorio para abrir la documentación remota.",
};

const INSTALLED_PROMPT = {
  en: "This direct URL was not pre-rendered on GitHub Pages. Use the search form below with the same owner and repository.",
  pt: "Esta URL direta nao foi pre-renderizada no GitHub Pages. Use o formulario de busca abaixo com o mesmo usuario e repositorio.",
  es: "Esta URL directa no fue pre-renderizada en GitHub Pages. Usa el formulario de busqueda abajo con el mismo usuario y repositorio.",
};

const RETURN_HOME = {
  en: "Return Home",
  pt: "Voltar ao início",
  es: "Volver al inicio",
};

type RepoStatus = "unknown" | "checking" | "installed" | "not_installed";
type ParsedPath = { owner: string; repo: string; version?: string; language: SupportedLanguage };
type VersionConfig = { routes?: RouteConfig[]; "menus-header"?: HeaderMenuItem[] };
type ThemeMode = "light" | "dark";
type SupportedLanguage = "en" | "pt" | "es";
type NotFoundTemplate = "default" | "aurora" | "minimal";
const REQUEST_TIMEOUT_MS = 12000;
const MIN_LOADING_TRANSITION_MS = 700;

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

function normalizeRelativePath(input: string): string {
  return input.replace(/^\/+/, "");
}

function parseSupportedLanguage(input: string | null | undefined): SupportedLanguage {
  if (input === "pt" || input === "es" || input === "en") {
    return input;
  }
  return "en";
}

function toRawGithubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") {
      return url;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    const blobOrTreeIndex = parts.findIndex((part) => part === "blob" || part === "tree");
    if (parts.length >= 5 && blobOrTreeIndex === 2) {
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

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function stripFrontMatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function buildGithubRawCandidates(owner: string, repo: string, relativePath: string): string[] {
  const safePath = normalizeRelativePath(relativePath);
  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${safePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${safePath}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/${safePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@HEAD/${safePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${safePath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repo}@master/${safePath}`,
  ];
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

function parsePathFromLocation(): ParsedPath | null {
  if (typeof window === "undefined") {
    return null;
  }
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const base = getBasePath();
  const withoutBase = base ? path.slice(base.length) : path;
  const parts = withoutBase.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }
  const owner = parts[0];
  const repo = parts[1];
  const versionFromPath = parts.length >= 4 && parts[2] === "v" ? parts[3] : undefined;
  const versionFromQuery = searchParams.get("version") ?? undefined;
  const language = parseSupportedLanguage(searchParams.get("lang"));
  const version = versionFromPath || versionFromQuery;
  return { owner, repo, version, language };
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
  const preferredLayoutsConfigPath = config.site.layoutsConfigPathOficialUrl || config.site.layoutsConfigPath || OFFICIAL_LAYOUTS_CONFIG_URL;
  const preferredTemplatesPath =
    config.site.layoutsConfigPathTemplatesOficial || config.site.layoutsConfigPathTemplates || OFFICIAL_LAYOUTS_TEMPLATES_URL;

  let layoutsConfig: LayoutsConfig | null = null;
  if (useOfficialLayouts) {
    layoutsConfig = await fetchUrlJson<LayoutsConfig>(preferredLayoutsConfigPath);
  }
  if (!layoutsConfig?.layouts?.length) {
    layoutsConfig = await fetchRepoJson<LayoutsConfig>(owner, repo, DEFAULT_LAYOUTS_PATH);
  }
  if (!layoutsConfig?.layouts?.length) {
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

function pickRoutePathForLanguage(
  route: RouteConfig,
  language: LanguageCode,
  defaultLanguage: LanguageCode,
): string | undefined {
  return route.path[language] ?? route.path[defaultLanguage] ?? route.path.en ?? route.path.pt ?? route.path.es ?? Object.values(route.path)[0];
}

async function loadRemoteDocsData(
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

async function checkRepositoryHasGitPageDocs(owner: string, repo: string): Promise<boolean> {
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

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [pathOwner, setPathOwner] = useState<string | null>(null);
  const [pathRepo, setPathRepo] = useState<string | null>(null);
  const [pathVersion, setPathVersion] = useState<string | undefined>(undefined);
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [repoStatus, setRepoStatus] = useState<RepoStatus>("unknown");
  const [loadedData, setLoadedData] = useState<LoadedDocsData | null>(null);
  const [appLoading, setAppLoading] = useState(false);
  const [appLoadFailed, setAppLoadFailed] = useState(false);
  const [loaderDots, setLoaderDots] = useState(1);
  const [loadingTransitionDone, setLoadingTransitionDone] = useState(false);
  const [notFoundTemplate, setNotFoundTemplate] = useState<NotFoundTemplate>("default");

  useEffect(() => {
    setMounted(true);
    function syncFromCurrentLocation() {
      const parsed = parsePathFromLocation();
      if (!parsed) {
        return;
      }
      setPathOwner(parsed.owner);
      setPathRepo(parsed.repo);
      setPathVersion(parsed.version);
      setLang(parsed.language);
    }
    syncFromCurrentLocation();
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", syncFromCurrentLocation);
      window.addEventListener("hashchange", syncFromCurrentLocation);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", syncFromCurrentLocation);
        window.removeEventListener("hashchange", syncFromCurrentLocation);
      }
    };
  }, []);

  useEffect(() => {
    if (!pathOwner || !pathRepo) {
      return;
    }

    let cancelled = false;
    setRepoStatus("checking");
    checkRepositoryHasGitPageDocs(pathOwner, pathRepo).then((hasGitPageDocs) => {
      if (cancelled) {
        return;
      }
      setRepoStatus(hasGitPageDocs ? "installed" : "not_installed");
    });

    return () => {
      cancelled = true;
    };
  }, [pathOwner, pathRepo]);

  useEffect(() => {
    if (!pathOwner || !pathRepo || repoStatus !== "installed") {
      setLoadedData(null);
      setAppLoading(false);
      setAppLoadFailed(false);
      return;
    }

    let cancelled = false;
    setLoadedData(null);
    setAppLoading(true);
    setAppLoadFailed(false);
    loadRemoteDocsData(pathOwner, pathRepo, pathVersion, lang)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setLoadedData(data);
          return;
        }
        setAppLoadFailed(true);
      })
      .finally(() => {
        if (cancelled) return;
        setAppLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathOwner, pathRepo, pathVersion, repoStatus, lang]);

  const isRepoPath = pathOwner && pathRepo;
  const isCheckingOrLoading =
    Boolean(isRepoPath) && (repoStatus === "unknown" || repoStatus === "checking" || (repoStatus === "installed" && appLoading));

  useEffect(() => {
    if (!isCheckingOrLoading) {
      setLoadingTransitionDone(true);
      return;
    }

    setLoadingTransitionDone(false);
    const timer = window.setTimeout(() => {
      setLoadingTransitionDone(true);
    }, MIN_LOADING_TRANSITION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isCheckingOrLoading, pathOwner, pathRepo, pathVersion, lang]);

  useEffect(() => {
    if (!isCheckingOrLoading) {
      setLoaderDots(1);
      return;
    }

    const timer = window.setInterval(() => {
      setLoaderDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 280);

    return () => {
      window.clearInterval(timer);
    };
  }, [isCheckingOrLoading]);

  if (!mounted) {
    return (
      <main style={styles.main}>
        <section style={styles.section}>
          <p style={styles.loading}>Loading...</p>
        </section>
      </main>
    );
  }

  if (loadedData && loadingTransitionDone) {
    return <DocsShell data={loadedData} />;
  }

  const templateStyles =
    notFoundTemplate === "aurora"
      ? {
          mainBackground:
            "radial-gradient(circle at 8% -12%, rgba(124,58,237,0.28), transparent 42%), radial-gradient(circle at 92% -18%, rgba(34,211,238,0.22), transparent 40%), radial-gradient(circle at top, #131b2a, #070b12 55%)",
          sectionBackground: "linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(11, 19, 34, 0.95))",
          sectionBorder: "1px solid #334155",
        }
      : notFoundTemplate === "minimal"
        ? {
            mainBackground: "radial-gradient(circle at top, #0d1320, #050811 62%)",
            sectionBackground: "#0f172a",
            sectionBorder: "1px solid #263549",
          }
        : {
            mainBackground: "radial-gradient(circle at top, #131b2a, #070b12 55%)",
            sectionBackground: "#0f172a",
            sectionBorder: "1px solid #334155",
          };

  if (isCheckingOrLoading) {
    const loadingTitleBase = lang === "pt" ? "Carregando documentação" : lang === "es" ? "Cargando documentación" : "Loading documentation";
    const loadingTitle = `${loadingTitleBase}${".".repeat(loaderDots)}`;
    const progressWidth = loaderDots === 1 ? "34%" : loaderDots === 2 ? "68%" : "100%";
    return (
      <main style={{ ...styles.main, background: templateStyles.mainBackground }}>
        <section style={{ ...styles.section, background: templateStyles.sectionBackground, border: templateStyles.sectionBorder }}>
          <h1 style={styles.title}>{loadingTitle}</h1>
          <p style={styles.description}>
            {lang === "pt"
              ? "Repositório detectado. Abrindo o app..."
              : lang === "es"
                ? "Repositorio detectado. Abriendo la app..."
                : "Repository detected. Opening the app..."}
          </p>
          <div style={styles.loadingTrack}>
            <div style={{ ...styles.loadingBar, width: progressWidth }} />
          </div>
        </section>
      </main>
    );
  }

  if (Boolean(isRepoPath) && repoStatus === "installed" && appLoadFailed) {
    return (
      <main style={{ ...styles.main, background: templateStyles.mainBackground }}>
        <section style={{ ...styles.section, background: templateStyles.sectionBackground, border: templateStyles.sectionBorder }}>
          <h1 style={styles.title}>{lang === "pt" ? "Não foi possível carregar agora" : lang === "es" ? "No se pudo cargar ahora" : "Could not load right now"}</h1>
          <p style={styles.description}>
            {lang === "pt"
              ? "O repositório possui gitpagedocs, mas houve falha temporária de rede. Tente novamente."
              : lang === "es"
                ? "El repositorio tiene gitpagedocs, pero hubo un fallo temporal de red. Intenta de nuevo."
                : "This repository has gitpagedocs, but there was a temporary network failure. Try again."}
          </p>
          <button
            type="button"
            style={styles.button}
            onClick={() => {
              setRepoStatus("checking");
            }}
          >
            {lang === "pt" ? "Tentar novamente" : lang === "es" ? "Intentar de nuevo" : "Try again"}
          </button>
        </section>
      </main>
    );
  }

  const message = isRepoPath
    ? repoStatus === "installed"
      ? INSTALLED_NOT_PRERENDERED[lang]
      : NOT_INSTALLED[lang]
    : "Page not found";
  const prompt = isRepoPath
    ? repoStatus === "installed"
      ? INSTALLED_PROMPT[lang]
      : SEARCH_PROMPT[lang]
    : "The requested page does not exist.";
  const returnLabel = RETURN_HOME[lang];

  return (
    <main style={{ ...styles.main, background: templateStyles.mainBackground }}>
      <section style={{ ...styles.section, background: templateStyles.sectionBackground, border: templateStyles.sectionBorder }}>
        {(repoStatus === "not_installed" || !isRepoPath) && <p style={styles.code}>404</p>}
        <h1 style={styles.title}>{message}</h1>
        <p style={styles.description}>{prompt}</p>

        {isRepoPath && (
          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const owner = (form.querySelector('[name="owner"]') as HTMLInputElement)?.value?.trim();
              const repo = (form.querySelector('[name="repo"]') as HTMLInputElement)?.value?.trim();
              if (owner && repo) {
                setPathOwner(owner);
                setPathRepo(repo);
                setPathVersion(undefined);
                setRepoStatus("unknown");
                setLoadedData(null);
                const basePath = getBasePath();
                const nextPath = `${basePath}/${owner}/${repo}/`;
                window.history.replaceState({}, "", nextPath);
              }
            }}
          >
            <div style={styles.controlsRow}>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "en" | "pt" | "es")}
                style={{ ...styles.select, ...styles.controlFull }}
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="es">Español</option>
              </select>
              <select
                value={notFoundTemplate}
                onChange={(e) => setNotFoundTemplate(e.target.value as NotFoundTemplate)}
                style={{ ...styles.select, ...styles.controlFull }}
              >
                <option value="default">Default</option>
                <option value="aurora">Aurora</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <input
              name="owner"
              placeholder={lang === "pt" ? "Usuário (ex: Vidigal-code)" : lang === "es" ? "Usuario (ej: Vidigal-code)" : "Owner (ex: Vidigal-code)"}
              defaultValue={pathOwner}
              style={styles.input}
            />
            <input
              name="repo"
              placeholder={lang === "pt" ? "Repositório (ex: git-page-link-create)" : lang === "es" ? "Repositorio (ej: git-page-link-create)" : "Repository (ex: git-page-link-create)"}
              defaultValue={pathRepo}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              {lang === "pt" ? "Buscar" : lang === "es" ? "Buscar" : "Search"}
            </button>
          </form>
        )}

        <a href={(getBasePath() ? getBasePath() + "/" : "/")} style={styles.link}>
          {returnLabel}
        </a>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, #131b2a, #070b12 55%)",
    padding: "24px",
  },
  section: {
    width: "min(760px, 100%)",
    borderRadius: "16px",
    padding: "clamp(18px, 3vw, 32px)",
    boxShadow: "0 18px 60px rgba(0, 0, 0, 0.4)",
  },
  loading: {
    margin: 0,
    color: "#94a3b8",
  },
  code: {
    margin: 0,
    color: "#94a3b8",
    fontWeight: 600,
  },
  title: {
    marginTop: 8,
    marginBottom: 12,
  },
  description: {
    marginTop: 0,
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  loadingTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    border: "1px solid #334155",
    background: "#0b1322",
    overflow: "hidden",
    marginTop: 8,
  },
  loadingBar: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #7c3aed, #22d3ee)",
    transition: "width 220ms ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: 20,
    marginBottom: 16,
  },
  controlsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  controlFull: {
    maxWidth: "100%",
    width: "100%",
  },
  select: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
    maxWidth: 200,
  },
  input: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
  },
  button: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#7c3aed",
    color: "#f1f5f9",
    fontWeight: 600,
    cursor: "pointer",
  },
  link: {
    display: "inline-block",
    marginTop: 8,
    padding: "10px 16px",
    border: "1px solid #334155",
    borderRadius: 10,
    background: "#1e293b",
    color: "#f1f5f9",
    fontWeight: 600,
    textDecoration: "none",
  },
};
