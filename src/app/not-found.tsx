"use client";

import { useEffect, useMemo, useState } from "react";
import { checkRepositoryHasGitPageDocs, loadRemoteDocsData, parseSupportedLanguage } from "@/entities/docs/api/load-remote-docs-data-client";
import type { LoadedDocsData } from "@/entities/docs/model/types";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import { toSearchShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderName, resolveIconPath } from "@/shared/lib/resolve-site-assets";
import { SearchShellHeader } from "@/widgets/search-shell-header/ui/search-shell-header";
import { SearchShellLayout } from "@/widgets/search-shell-layout/search-shell-layout";
import { useStandaloneShellConfig } from "@/widgets/search-shell-header/model/use-standalone-shell-config";
import notFoundStyles from "./not-found.module.css";
import { DocsShell } from "@/widgets/docs-shell/docs-shell";

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
type SupportedLanguage = "en" | "pt" | "es";
type ParsedPath = { owner: string; repo: string; version?: string; language: SupportedLanguage };

const MIN_LOADING_TRANSITION_MS = 700;
const SEARCH_LANGUAGES: SupportedLanguage[] = ["en", "pt", "es"];
const PROJECT_FOOTER_URL = "https://github.com/Vidigal-code/git-page-docs";

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

  const { config: standaloneConfig } = useStandaloneShellConfig();
  const layouts = useMemo(() => standaloneConfig?.layoutsConfig?.layouts ?? [], [standaloneConfig]);
  const themes = standaloneConfig?.themes ?? {};
  const [activeThemeId, setActiveThemeId] = useState("");

  useEffect(() => {
    if (layouts.length > 0 && !activeThemeId) {
      const preferred = layouts.find((l) => l.id === "aurora-dark") ?? layouts[0];
      setActiveThemeId(preferred.id);
    }
  }, [layouts, activeThemeId]);

  const activeLayout = layouts.find((l) => l.id === activeThemeId) ?? layouts[0];
  const activeTheme = themes[activeLayout?.id ?? ""];
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);
  const canToggleMode = Boolean(activeLayout?.supportsLightAndDarkModes);
  const nextModeIsDark = activeLayout?.mode === "dark";

  function onToggleMode() {
    if (!activeLayout?.supportsLightAndDarkModes) return;
    const nextMode = activeLayout.mode === "dark" ? "light" : "dark";
    const paired = resolveThemeByMode(layouts, activeLayout, nextMode);
    setActiveThemeId(paired.id);
  }

  function getLanguageLabel(langCode: string): string {
    return langCode === "pt" ? "Português" : langCode === "es" ? "Español" : "English";
  }

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

  const basePath = getBasePath();
  const siteConfig = standaloneConfig?.siteConfig;
  const headerName = resolveHeaderName(siteConfig?.SiteHeaderName, siteConfig?.name);

  const rawIconImage = siteConfig
    ? (nextModeIsDark
        ? siteConfig.IconImageMenuHeaderDarkImg?.trim() || siteConfig.IconImageMenuHeaderDark?.trim()
        : siteConfig.IconImageMenuHeaderLightImg?.trim() || siteConfig.IconImageMenuHeaderLight?.trim()) ||
      siteConfig.IconImageMenuHeader?.trim() ||
      siteConfig.SiteIconPath?.trim()
    : undefined;
  const iconImage = resolveIconPath(rawIconImage, basePath);
  const iconImgWidth = Number(siteConfig?.IconImageMenuHeaderImgWidth) || 20;
  const iconImgHeight = Number(siteConfig?.IconImageMenuHeaderImgHeight) || 20;
  const useReactHeaderIcon = Boolean(siteConfig?.IconImageMenuHeaderReactIcones);
  const reactHeaderIconTag = siteConfig?.IconImageMenuHeaderReactIconesTag;
  const headerReactIconStyle: React.CSSProperties = {
    color: (nextModeIsDark
      ? siteConfig?.IconImageMenuHeaderReactIconesTagColorDark
      : siteConfig?.IconImageMenuHeaderReactIconesTagColorLight
    )?.trim() || undefined,
    fontSize: siteConfig?.IconImageMenuHeaderReactIconesTagSize?.trim() || undefined,
  };

  const header = standaloneConfig ? (
    <SearchShellHeader
      siteName={headerName}
      basePath={basePath}
      language={lang}
      languages={SEARCH_LANGUAGES}
      onLanguageChange={(l) => setLang(l as SupportedLanguage)}
      activeThemeId={activeThemeId}
      layouts={layouts}
      onThemeChange={setActiveThemeId}
      nextModeIsDark={nextModeIsDark}
      canToggleMode={canToggleMode}
      onToggleMode={onToggleMode}
      iconImage={iconImage}
      iconImgWidth={iconImgWidth}
      iconImgHeight={iconImgHeight}
      useReactHeaderIcon={useReactHeaderIcon}
      reactHeaderIconTag={reactHeaderIconTag}
      headerReactIconStyle={headerReactIconStyle}
      getLanguageLabel={getLanguageLabel}
    />
  ) : (
    <SearchShellHeader
      siteName={headerName}
      basePath={basePath}
      language={lang}
      languages={SEARCH_LANGUAGES}
      onLanguageChange={(l) => setLang(l as SupportedLanguage)}
      activeThemeId=""
      layouts={[]}
      onThemeChange={() => {}}
      nextModeIsDark={true}
      canToggleMode={false}
      onToggleMode={() => {}}
      iconImage={iconImage}
      iconImgWidth={iconImgWidth}
      iconImgHeight={iconImgHeight}
      getLanguageLabel={getLanguageLabel}
    />
  );

  if (!mounted) {
    return (
      <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={lang} style={cssVars}>
        <section className={notFoundStyles.section}>
          <p style={styles.loading}>Loading...</p>
        </section>
      </SearchShellLayout>
    );
  }

  if (loadedData && loadingTransitionDone) {
    return <DocsShell data={loadedData} />;
  }

  if (isCheckingOrLoading) {
    const loadingTitleBase = lang === "pt" ? "Carregando documentação" : lang === "es" ? "Cargando documentación" : "Loading documentation";
    const loadingTitle = `${loadingTitleBase}${".".repeat(loaderDots)}`;
    const progressWidth = loaderDots === 1 ? "34%" : loaderDots === 2 ? "68%" : "100%";
    return (
      <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={lang} style={cssVars}>
        <section className={notFoundStyles.section}>
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
      </SearchShellLayout>
    );
  }

  if (Boolean(isRepoPath) && repoStatus === "installed" && appLoadFailed) {
    return (
      <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={lang} style={cssVars}>
        <section className={notFoundStyles.section}>
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
            className={notFoundStyles.buttonFull}
            onClick={() => {
              setRepoStatus("checking");
            }}
          >
            {lang === "pt" ? "Tentar novamente" : lang === "es" ? "Intentar de nuevo" : "Try again"}
          </button>
        </section>
      </SearchShellLayout>
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
    <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={lang} style={cssVars}>
      <section className={notFoundStyles.section}>
        {(repoStatus === "not_installed" || !isRepoPath) && <p style={styles.code}>404</p>}
        <h1 style={styles.title}>{message}</h1>
        <p style={styles.description}>{prompt}</p>

        {isRepoPath && (
          <form
            className={notFoundStyles.form}
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
                const nextPath = `${basePath ? basePath + "/" : "/"}${owner}/${repo}/`;
                window.history.replaceState({}, "", nextPath);
              }
            }}
          >
            <input
              name="owner"
              placeholder={lang === "pt" ? "Usuário (ex: Vidigal-code)" : lang === "es" ? "Usuario (ej: Vidigal-code)" : "Owner (ex: Vidigal-code)"}
              defaultValue={pathOwner ?? ""}
              className={notFoundStyles.input}
            />
            <input
              name="repo"
              placeholder={lang === "pt" ? "Repositório (ex: git-page-link-create)" : lang === "es" ? "Repositorio (ej: git-page-link-create)" : "Repository (ex: git-page-link-create)"}
              defaultValue={pathRepo ?? ""}
              className={notFoundStyles.input}
            />
            <button type="submit" className={notFoundStyles.button}>
              {lang === "pt" ? "Buscar" : lang === "es" ? "Buscar" : "Search"}
            </button>
          </form>
        )}

        <a href={basePath ? `${basePath}/` : "/"} className={notFoundStyles.link}>
          {returnLabel}
        </a>
      </section>
    </SearchShellLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    margin: 0,
    color: "var(--text-secondary)",
    textAlign: "center",
  },
  code: {
    margin: 0,
    color: "var(--text-secondary)",
    fontWeight: 600,
    textAlign: "center",
  },
  title: {
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
    color: "var(--text)",
  },
  description: {
    marginTop: 0,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    textAlign: "center",
  },
  loadingTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    border: "1px solid var(--card-border)",
    background: "color-mix(in srgb, var(--background) 90%, var(--primary) 10%)",
    overflow: "hidden",
    marginTop: 8,
  },
  loadingBar: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, var(--primary), var(--secondary))",
    transition: "width 220ms ease",
  },
};
