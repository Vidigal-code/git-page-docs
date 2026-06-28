"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { FiExternalLink, FiFile, FiFolder, FiSearch } from "react-icons/fi";
import {
  buildGithubTreeUrl,
  buildSourceViewerPath,
  DEFAULT_SOURCE_VIEWER_BRANCH,
  loadSourceFile,
  loadSourceRepository,
  type SourceFileContent,
  type SourceTreeEntry,
  type SourceViewerRepository,
  type SourceViewerRoute,
} from "@/entities/source-viewer";
import {
  buildFooterConfigFromData,
  getLanguageLabelFromMenu,
  getLangMenuLabelFromMenu,
  toSearchShellCssVars,
  type LanguageCode,
  type LoadedDocsData,
} from "@/entities/docs";
import { SourceViewerSearchForm } from "@/features/source-viewer-search";
import { SearchShellHeader, useStandaloneShellPreferences } from "@/widgets/search-shell-header";
import { SearchShellLayout } from "@/widgets/search-shell-layout";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import styles from "./source-viewer-page.module.css";

type ViewMode = "code" | "preview";

interface SourceViewerPageProps {
  data: LoadedDocsData;
  initialRoute: SourceViewerRoute;
}

interface InitialSourceSelection {
  directoryPath: string;
  file: SourceTreeEntry | undefined;
}

function normalizeInput(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function isMarkdownFile(path: string): boolean {
  return /\.mdx?$/i.test(path);
}

function getParentPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
}

function getDirectoryEntries(entries: SourceTreeEntry[], directoryPath: string): SourceTreeEntry[] {
  const prefix = directoryPath ? `${directoryPath}/` : "";

  return entries
    .filter((entry) => {
      if (!entry.path.startsWith(prefix) || entry.path === directoryPath) {
        return false;
      }
      return !entry.path.slice(prefix.length).includes("/");
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function filterTreeEntries(entries: SourceTreeEntry[], query: string): SourceTreeEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) => entry.path.toLowerCase().includes(normalized));
}

function formatBytes(value: number | undefined): string {
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function findInitialSelection(entries: SourceTreeEntry[], requestedPath: string): InitialSourceSelection {
  const exact = entries.find((entry) => entry.path === requestedPath);
  if (exact?.type === "tree") return { directoryPath: exact.path, file: undefined };
  if (exact?.type === "blob") return { directoryPath: getParentPath(exact.path), file: exact };
  const readme = entries.find((entry) => entry.type === "blob" && entry.path.toLowerCase() === "readme.md");
  const file = readme ?? entries.find((entry) => entry.type === "blob");
  return { directoryPath: file ? getParentPath(file.path) : requestedPath, file };
}

function updateBrowserPath(route: SourceViewerRoute): void {
  window.history.pushState(null, "", buildSourceViewerPath(route));
}

function buildCrumbs(path: string): Array<{ label: string; path: string }> {
  const parts = path.split("/").filter(Boolean);
  const crumbs = [{ label: "root", path: "" }];
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    crumbs.push({ label: part, path: current });
  }
  return crumbs;
}

function CodeViewer({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className={styles.codeScroll}>
      <table className={styles.codeTable}>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${index}-${line}`}>
              <td className={styles.lineNumber}>{index + 1}</td>
              <td className={styles.lineCode}>{line || " "}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  const html = useMemo(() => marked.parse(content) as string, [content]);
  return <div className={styles.markdownPreview} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SourceViewerPage({ data, initialRoute }: SourceViewerPageProps) {
  const defaultLanguage = data.config.site.defaultLanguage;
  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;
  const siteName = data.config.site.name ?? "GitPageDocs";

  const {
    language,
    onLanguageChange,
    activeThemeId,
    onThemeChange,
    onToggleMode,
    activeLayout,
    nextModeIsDark,
    canToggleMode,
  } = useStandaloneShellPreferences({
    siteName,
    defaultLanguage,
    availableLanguages: data.availableLanguages,
    layouts: data.layoutsConfig.layouts,
    configuredDefaultMode,
    initialThemeBaseId,
  });

  const [route, setRoute] = useState(initialRoute);
  const [ownerInput, setOwnerInput] = useState(initialRoute.owner);
  const [repoInput, setRepoInput] = useState(initialRoute.repo);
  const [branchInput, setBranchInput] = useState(initialRoute.branch);
  const [treeQuery, setTreeQuery] = useState("");
  const [repository, setRepository] = useState<SourceViewerRepository | null>(null);
  const [selectedFile, setSelectedFile] = useState<SourceFileContent | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState(initialRoute.path);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState("");

  const activeTheme = data.themes[activeLayout?.id ?? ""];
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);
  const basePath = getBasePath();
  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, activeLayout?.mode ?? "dark", basePath),
    [data.config.site, activeLayout?.mode, basePath],
  );

  const filteredTreeEntries = useMemo(
    () => filterTreeEntries(repository?.entries ?? [], treeQuery),
    [repository?.entries, treeQuery],
  );
  const directoryEntries = useMemo(
    () => getDirectoryEntries(repository?.entries ?? [], currentDirectory),
    [repository?.entries, currentDirectory],
  );
  const selectedIsMarkdown = Boolean(selectedFile && isMarkdownFile(selectedFile.path));

  useEffect(() => {
    let cancelled = false;

    async function loadTree() {
      setIsLoadingTree(true);
      setError("");
      setSelectedFile(null);
      try {
        const nextRepository = await loadSourceRepository(route.owner, route.repo, route.branch);
        if (cancelled) return;
        setRepository(nextRepository);
        const initialSelection = findInitialSelection(nextRepository.entries, route.path);
        setCurrentDirectory(initialSelection.directoryPath);
        if (initialSelection.file) {
          setIsLoadingFile(true);
          const file = await loadSourceFile(route.owner, route.repo, route.branch, initialSelection.file.path);
          if (!cancelled) {
            setSelectedFile(file);
            setViewMode(isMarkdownFile(file.path) ? "preview" : "code");
          }
        }
      } catch {
        if (!cancelled) {
          setError("Repository, branch, or source tree was not found.");
          setRepository(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTree(false);
          setIsLoadingFile(false);
        }
      }
    }

    loadTree();
    return () => {
      cancelled = true;
    };
  }, [route]);

  async function selectFile(entry: SourceTreeEntry) {
    setIsLoadingFile(true);
    setError("");
    try {
      const file = await loadSourceFile(route.owner, route.repo, route.branch, entry.path);
      setSelectedFile(file);
      setCurrentDirectory(getParentPath(entry.path));
      setViewMode(isMarkdownFile(entry.path) ? "preview" : "code");
      updateBrowserPath({ ...route, path: entry.path });
    } catch {
      setError("File could not be loaded.");
    } finally {
      setIsLoadingFile(false);
    }
  }

  function selectDirectory(path: string) {
    setCurrentDirectory(path);
    setSelectedFile(null);
    updateBrowserPath({ ...route, path });
  }

  function submitSearch() {
    const nextRoute = {
      owner: normalizeInput(ownerInput),
      repo: normalizeInput(repoInput),
      branch: normalizeInput(branchInput) || DEFAULT_SOURCE_VIEWER_BRANCH,
      path: "",
    };
    if (!nextRoute.owner || !nextRoute.repo || !nextRoute.branch) return;
    setRoute(nextRoute);
    updateBrowserPath(nextRoute);
  }

  const ownerLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "searchOwnerLabel", "Owner");
  const repoLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "searchRepoLabel", "Repository");
  const searchLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "searchButtonLabel", "Search");

  const header = (
    <SearchShellHeader
      siteName={headerIconConfig.headerName}
      basePath={basePath}
      language={language}
      languages={data.availableLanguages}
      onLanguageChange={onLanguageChange}
      activeThemeId={activeThemeId}
      layouts={data.layoutsConfig.layouts}
      onThemeChange={onThemeChange}
      nextModeIsDark={nextModeIsDark}
      canToggleMode={canToggleMode}
      onToggleMode={onToggleMode}
      iconImage={headerIconConfig.iconImage}
      iconImgWidth={headerIconConfig.iconImgWidth}
      iconImgHeight={headerIconConfig.iconImgHeight}
      useReactHeaderIcon={headerIconConfig.useReactIcon}
      reactHeaderIconTag={headerIconConfig.reactIconTag}
      headerReactIconStyle={headerIconConfig.reactIconStyle}
      getLanguageLabel={(lang) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang)}
    />
  );

  return (
    <SearchShellLayout
      header={header}
      footerEnabled={data.config.site.FooterEnabled !== false}
      projectFooterUrl={PROJECT_FOOTER_URL}
      language={language}
      style={cssVars}
      footerConfig={buildFooterConfigFromData(data, language)}
    >
      <main className={styles.shell}>
        <div className={styles.workspace}>
          <section className={styles.toolbar}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>
                {route.owner}/{route.repo}
              </h1>
              <a className={styles.externalLink} href={buildGithubTreeUrl(route)} target="_blank" rel="noreferrer">
                <FiExternalLink aria-hidden /> GitHub
              </a>
            </div>
            <SourceViewerSearchForm
              owner={ownerInput}
              repo={repoInput}
              branch={branchInput}
              ownerLabel={ownerLabel}
              repoLabel={repoLabel}
              branchLabel="Branch"
              submitLabel={searchLabel}
              onOwnerChange={setOwnerInput}
              onRepoChange={setRepoInput}
              onBranchChange={setBranchInput}
              onSubmit={submitSearch}
              classNames={{ form: styles.form, input: styles.input, button: styles.button }}
            />
          </section>

          <section className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <input
                  className={styles.input}
                  value={treeQuery}
                  onChange={(event) => setTreeQuery(event.target.value)}
                  placeholder="Filter files"
                  aria-label="Filter files"
                />
                <div className={styles.treeActions}>
                  <button type="button" className={styles.treeButton} onClick={() => setTreeQuery("")}>
                    <FiSearch aria-hidden /> Clear
                  </button>
                </div>
              </div>
              <div className={styles.tree}>
                {isLoadingTree ? (
                  <div className={styles.state}>Loading source tree...</div>
                ) : (
                  filteredTreeEntries.map((entry) => (
                    <button
                      key={entry.path}
                      type="button"
                      className={`${styles.treeItem} ${selectedFile?.path === entry.path ? styles.treeItemActive : ""}`}
                      style={{ paddingLeft: `${8 + Math.max(0, entry.path.split("/").length - 1) * 10}px` }}
                      onClick={() => (entry.type === "tree" ? selectDirectory(entry.path) : selectFile(entry))}
                    >
                      {entry.type === "tree" ? <FiFolder aria-hidden /> : <FiFile aria-hidden />}
                      <span className={styles.fileName}>{entry.path}</span>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className={styles.main}>
              <section className={styles.panel}>
                <nav className={styles.breadcrumb} aria-label="Source path">
                  {buildCrumbs(currentDirectory).map((crumb, index, crumbs) => (
                    <span key={crumb.path || "root"}>
                      <button type="button" className={styles.breadcrumbButton} onClick={() => selectDirectory(crumb.path)}>
                        {crumb.label}
                      </button>
                      {index < crumbs.length - 1 ? <span>/</span> : null}
                    </span>
                  ))}
                </nav>

                <div className={styles.fileList}>
                  {directoryEntries.length ? (
                    directoryEntries.map((entry) => (
                      <button
                        key={entry.path}
                        type="button"
                        className={styles.fileRow}
                        onClick={() => (entry.type === "tree" ? selectDirectory(entry.path) : selectFile(entry))}
                      >
                        {entry.type === "tree" ? <FiFolder aria-hidden /> : <FiFile aria-hidden />}
                        <span className={styles.fileName}>{entry.name}</span>
                        <span className={styles.fileMeta}>{entry.type === "blob" ? formatBytes(entry.size) : ""}</span>
                      </button>
                    ))
                  ) : (
                    <div className={styles.state}>No entries found.</div>
                  )}
                </div>
              </section>

              <section className={styles.viewer}>
                <div className={styles.viewerHeader}>
                  <div className={styles.viewerTitle}>{selectedFile?.path ?? "Select a file"}</div>
                  {selectedIsMarkdown ? (
                    <div className={styles.modeGroup}>
                      <button
                        type="button"
                        className={`${styles.modeButton} ${viewMode === "preview" ? styles.modeButtonActive : ""}`}
                        onClick={() => setViewMode("preview")}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeButton} ${viewMode === "code" ? styles.modeButtonActive : ""}`}
                        onClick={() => setViewMode("code")}
                      >
                        Code
                      </button>
                    </div>
                  ) : null}
                </div>
                {error ? <div className={`${styles.state} ${styles.error}`}>{error}</div> : null}
                {isLoadingFile ? <div className={styles.state}>Loading file...</div> : null}
                {!isLoadingFile && selectedFile && viewMode === "preview" && selectedIsMarkdown ? (
                  <MarkdownPreview content={selectedFile.content} />
                ) : null}
                {!isLoadingFile && selectedFile && (viewMode === "code" || !selectedIsMarkdown) ? (
                  <CodeViewer content={selectedFile.content} />
                ) : null}
                {!isLoadingFile && !selectedFile && !error ? (
                  <div className={styles.state}>Open a file or folder from the repository tree.</div>
                ) : null}
              </section>
            </div>
          </section>
        </div>
      </main>
    </SearchShellLayout>
  );
}
