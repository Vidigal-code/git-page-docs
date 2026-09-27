"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode, SubmitEvent } from "react";
import {
  checkRepositoryHasGitPageDocs,
  getLanguageLabelFromMenu,
  loadRemoteDocsData,
  parseSupportedLanguage,
  toSearchShellCssVars,
} from "@/widgets/not-found-shell";
import { parseRepoPathFromLocation } from "@/shared/lib/parse-repo-path";
import { redirectSourceViewerDeepLink } from "@/shared/lib/source-viewer-fallback";
import type { LoadedDocsData } from "@/widgets/not-found-shell";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import {
  SearchShellHeader,
  useStandaloneShellConfig,
  useStandaloneShellPreferences,
} from "@/widgets/search-shell-header";
import { SearchShellLayout } from "@/widgets/search-shell-layout";
import notFoundStyles from "./not-found.module.css";
import { DocsShell } from "@/widgets/docs-shell";
import {
  RETURN_HOME,
  LOADING_DOCUMENTATION,
  REPOSITORY_DETECTED,
  COULD_NOT_LOAD,
  NETWORK_FAILURE_RETRY,
  TRY_AGAIN,
  SEARCH_OWNER_PLACEHOLDER,
  SEARCH_REPO_PLACEHOLDER,
  SEARCH_BUTTON,
  LOADING_FALLBACK,
} from "@/shared/config/i18n/not-found-dict";
import {
  buildRepositoryPath,
  isRepositoryResolving,
  pickNotFoundText,
  resolveLoadingProgressWidth,
  resolveNotFoundCopy,
  type RepoStatus,
  type SupportedLanguage,
} from "./not-found-state";

const MIN_LOADING_TRANSITION_MS = 700;
const SEARCH_LANGUAGES: SupportedLanguage[] = ["en", "pt", "es"];
const FALLBACK_LANGMENU = {
  en: { en: "English", pt: "Português", es: "Español" },
  pt: { en: "English", pt: "Português", es: "Español" },
  es: { en: "English", pt: "Português", es: "Español" },
} as const;

function NotFoundFallback() {
  return (
    <SearchShellLayout header={null} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language="en" style={{}}>
      <section className={notFoundStyles.section}>
        <p style={{ margin: 0, color: "var(--text-secondary)", textAlign: "center" }}>{LOADING_FALLBACK.en}</p>
      </section>
    </SearchShellLayout>
  );
}

interface RepoPath {
  owner: string | null;
  repo: string | null;
  version: string | undefined;
}

const EMPTY_REPO_PATH: RepoPath = { owner: null, repo: null, version: undefined };

/**
 * Owner/repo/version read from the URL and re-synced on history navigation.
 * `mounted` flips once the client took over (never for source-viewer deep
 * links, which are redirected away before anything renders).
 */
function useRepoPathFromLocation() {
  const [mounted, setMounted] = useState(false);
  const [path, setPath] = useState<RepoPath>(EMPTY_REPO_PATH);

  useEffect(() => {
    // Deep source-viewer URLs are not prerendered; hand them to the exported
    // /source-viewer/ page instead of treating them as an owner/repo path.
    if (redirectSourceViewerDeepLink()) {
      return;
    }
    setMounted(true);
    function syncFromCurrentLocation() {
      const parsed = parseRepoPathFromLocation(parseSupportedLanguage);
      if (!parsed) {
        return;
      }
      setPath({ owner: parsed.owner, repo: parsed.repo, version: parsed.version });
    }
    syncFromCurrentLocation();
    window.addEventListener("popstate", syncFromCurrentLocation);
    window.addEventListener("hashchange", syncFromCurrentLocation);
    return () => {
      window.removeEventListener("popstate", syncFromCurrentLocation);
      window.removeEventListener("hashchange", syncFromCurrentLocation);
    };
  }, []);

  return { mounted, path, setPath };
}

/** Probes whether the repository ships gitpagedocs whenever owner/repo change. */
function useRepositoryStatus(owner: string | null, repo: string | null) {
  const [repoStatus, setRepoStatus] = useState<RepoStatus>("unknown");

  useEffect(() => {
    if (!owner || !repo) {
      return;
    }
    let cancelled = false;
    setRepoStatus("checking");
    checkRepositoryHasGitPageDocs(owner, repo).then((hasGitPageDocs) => {
      if (cancelled) {
        return;
      }
      setRepoStatus(hasGitPageDocs ? "installed" : "not_installed");
    });
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return { repoStatus, setRepoStatus };
}

/** Fetches the remote docs once the repository is known to have gitpagedocs. */
function useRemoteDocs(path: RepoPath, repoStatus: RepoStatus, language: SupportedLanguage) {
  const { owner, repo, version } = path;
  const [loadedData, setLoadedData] = useState<LoadedDocsData | null>(null);
  const [appLoading, setAppLoading] = useState(false);
  const [appLoadFailed, setAppLoadFailed] = useState(false);

  useEffect(() => {
    if (!owner || !repo || repoStatus !== "installed") {
      setLoadedData(null);
      setAppLoading(false);
      setAppLoadFailed(false);
      return;
    }
    let cancelled = false;
    setLoadedData(null);
    setAppLoading(true);
    setAppLoadFailed(false);
    loadRemoteDocsData(owner, repo, version, language)
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
  }, [owner, repo, version, repoStatus, language]);

  return { loadedData, setLoadedData, appLoading, appLoadFailed };
}

/** Keeps the loading view up for a minimum time so the hand-off never flickers. */
function useLoadingTransitionDone(isResolving: boolean, path: RepoPath, language: string): boolean {
  const { owner, repo, version } = path;
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isResolving) {
      setDone(true);
      return;
    }
    setDone(false);
    const timer = window.setTimeout(() => {
      setDone(true);
    }, MIN_LOADING_TRANSITION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isResolving, owner, repo, version, language]);

  return done;
}

/** Animates the "Loading documentation..." dots while resolving. */
function useLoaderDots(isResolving: boolean): number {
  const [loaderDots, setLoaderDots] = useState(1);

  useEffect(() => {
    if (!isResolving) {
      setLoaderDots(1);
      return;
    }
    const timer = window.setInterval(() => {
      setLoaderDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 280);
    return () => {
      window.clearInterval(timer);
    };
  }, [isResolving]);

  return loaderDots;
}

/** Standalone shell chrome (theme, language, header) shared by every 404 view. */
function useNotFoundShell() {
  const { config: standaloneConfig } = useStandaloneShellConfig();
  const layouts = useMemo(() => standaloneConfig?.layoutsConfig?.layouts ?? [], [standaloneConfig]);
  const themes = standaloneConfig?.themes ?? {};
  const siteConfig = standaloneConfig?.siteConfig;
  const siteName = siteConfig?.name ?? "GitPageDocs";
  const initialThemeBaseId = layouts.find((l) => l.id === "aurora-dark")?.id ?? layouts[0]?.id;

  const {
    language: lang,
    onLanguageChange,
    activeThemeId,
    onThemeChange,
    onToggleMode,
    activeLayout,
    nextModeIsDark,
    canToggleMode,
  } = useStandaloneShellPreferences({
    siteName,
    defaultLanguage: "en",
    availableLanguages: SEARCH_LANGUAGES,
    layouts,
    configuredDefaultMode: "dark",
    initialThemeBaseId,
  });

  const activeTheme = themes[activeLayout?.id ?? ""];
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);

  const getLanguageLabel = (targetLang: string) =>
    getLanguageLabelFromMenu(siteConfig?.langmenu ?? FALLBACK_LANGMENU, lang, targetLang);

  const basePath = getBasePath();
  const mode: "dark" | "light" = nextModeIsDark ? "dark" : "light";
  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(siteConfig ?? undefined, mode, basePath),
    [siteConfig, mode, basePath],
  );
  const { iconImage, headerName, useReactIcon, reactIconTag, reactIconStyle, iconImgWidth, iconImgHeight } =
    headerIconConfig;

  // The React header icon is only wired once the standalone config resolved.
  const reactIconProps = standaloneConfig
    ? { useReactHeaderIcon: useReactIcon, reactHeaderIconTag: reactIconTag, headerReactIconStyle: reactIconStyle }
    : {};

  const header = (
    <SearchShellHeader
      themeVarsStyle={cssVars}
      siteName={headerName}
      basePath={basePath}
      language={lang}
      languages={SEARCH_LANGUAGES}
      onLanguageChange={(l) => onLanguageChange(l as SupportedLanguage)}
      activeThemeId={activeThemeId}
      layouts={layouts}
      onThemeChange={onThemeChange}
      nextModeIsDark={nextModeIsDark}
      canToggleMode={canToggleMode}
      onToggleMode={onToggleMode}
      iconImage={iconImage}
      iconImgWidth={iconImgWidth}
      iconImgHeight={iconImgHeight}
      getLanguageLabel={getLanguageLabel}
      {...reactIconProps}
    />
  );

  return { lang, header, cssVars, basePath };
}

interface NotFoundFrameProps {
  header: ReactNode;
  language: string;
  cssVars: CSSProperties;
  children: ReactNode;
}

function NotFoundFrame({ header, language, cssVars, children }: Readonly<NotFoundFrameProps>) {
  return (
    <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={language} style={cssVars}>
      <section className={notFoundStyles.section}>{children}</section>
    </SearchShellLayout>
  );
}

function LoadingBody({ language, loaderDots }: Readonly<{ language: SupportedLanguage; loaderDots: number }>) {
  const loadingTitle = `${pickNotFoundText(LOADING_DOCUMENTATION, language)}${".".repeat(loaderDots)}`;
  return (
    <>
      <h1 style={styles.title}>{loadingTitle}</h1>
      <p style={styles.description}>{pickNotFoundText(REPOSITORY_DETECTED, language)}</p>
      <div style={styles.loadingTrack}>
        <div style={{ ...styles.loadingBar, width: resolveLoadingProgressWidth(loaderDots) }} />
      </div>
    </>
  );
}

function LoadFailedBody({ language, onRetry }: Readonly<{ language: SupportedLanguage; onRetry: () => void }>) {
  return (
    <>
      <h1 style={styles.title}>{pickNotFoundText(COULD_NOT_LOAD, language)}</h1>
      <p style={styles.description}>{pickNotFoundText(NETWORK_FAILURE_RETRY, language)}</p>
      <button type="button" className={notFoundStyles.buttonFull} onClick={onRetry}>
        {pickNotFoundText(TRY_AGAIN, language)}
      </button>
    </>
  );
}

interface RepositorySearchBodyProps {
  language: SupportedLanguage;
  basePath: string;
  isRepoPath: boolean;
  repoStatus: RepoStatus;
  path: RepoPath;
  onSearch: (owner: string, repo: string) => void;
}

function RepositorySearchBody({ language, basePath, isRepoPath, repoStatus, path, onSearch }: Readonly<RepositorySearchBodyProps>) {
  const copy = resolveNotFoundCopy(isRepoPath, repoStatus, language);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const owner = (form.querySelector('[name="owner"]') as HTMLInputElement)?.value?.trim();
    const repo = (form.querySelector('[name="repo"]') as HTMLInputElement)?.value?.trim();
    if (owner && repo) {
      onSearch(owner, repo);
    }
  };

  return (
    <>
      {copy.showCode && <p style={styles.code}>404</p>}
      <h1 style={styles.title}>{copy.message}</h1>
      <p style={styles.description}>{copy.prompt}</p>

      {isRepoPath && (
        <form className={notFoundStyles.form} onSubmit={handleSubmit}>
          <input
            name="owner"
            placeholder={pickNotFoundText(SEARCH_OWNER_PLACEHOLDER, language)}
            defaultValue={path.owner ?? ""}
            className={notFoundStyles.input}
          />
          <input
            name="repo"
            placeholder={pickNotFoundText(SEARCH_REPO_PLACEHOLDER, language)}
            defaultValue={path.repo ?? ""}
            className={notFoundStyles.input}
          />
          <button type="submit" className={notFoundStyles.button}>
            {pickNotFoundText(SEARCH_BUTTON, language)}
          </button>
        </form>
      )}

      <a href={basePath ? `${basePath}/` : "/"} className={notFoundStyles.link}>
        {pickNotFoundText(RETURN_HOME, language)}
      </a>
    </>
  );
}

function NotFoundContent() {
  const { lang, header, cssVars, basePath } = useNotFoundShell();
  const safeLang = lang as SupportedLanguage;

  const { mounted, path, setPath } = useRepoPathFromLocation();
  const { repoStatus, setRepoStatus } = useRepositoryStatus(path.owner, path.repo);
  const { loadedData, setLoadedData, appLoading, appLoadFailed } = useRemoteDocs(path, repoStatus, safeLang);

  const isRepoPath = Boolean(path.owner && path.repo);
  const isResolving = isRepositoryResolving(isRepoPath, repoStatus, appLoading);
  const loadingTransitionDone = useLoadingTransitionDone(isResolving, path, lang);
  const loaderDots = useLoaderDots(isResolving);

  const handleSearch = (owner: string, repo: string) => {
    setPath({ owner, repo, version: undefined });
    setRepoStatus("unknown");
    setLoadedData(null);
    window.history.replaceState({}, "", buildRepositoryPath(basePath, owner, repo));
  };

  let body: ReactNode;
  if (!mounted) {
    body = <p style={styles.loading}>{pickNotFoundText(LOADING_FALLBACK, safeLang)}</p>;
  } else if (loadedData && loadingTransitionDone) {
    return <DocsShell data={loadedData} />;
  } else if (isResolving) {
    body = <LoadingBody language={safeLang} loaderDots={loaderDots} />;
  } else if (isRepoPath && repoStatus === "installed" && appLoadFailed) {
    body = <LoadFailedBody language={safeLang} onRetry={() => setRepoStatus("checking")} />;
  } else {
    body = (
      <RepositorySearchBody
        language={safeLang}
        basePath={basePath}
        isRepoPath={isRepoPath}
        repoStatus={repoStatus}
        path={path}
        onSearch={handleSearch}
      />
    );
  }

  return (
    <NotFoundFrame header={header} language={lang} cssVars={cssVars}>
      {body}
    </NotFoundFrame>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}

const styles: Record<string, CSSProperties> = {
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
