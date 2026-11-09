"use client";

import { memo, useEffect, useId, useMemo, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { markdownToHtml } from "@/entities/docs";
import { FiAlertCircle, FiArrowLeft, FiChevronDown, FiChevronRight, FiCode, FiExternalLink, FiFile, FiFolder, FiRefreshCw, FiX } from "@/shared/ui/fallback-icons";
import { trimSlashes } from "@/shared/lib/base-path";
import {
  buildGithubTreeUrl,
  DEFAULT_SOURCE_VIEWER_BRANCH,
  loadSourceFile,
  resolveSourceRepository,
  type SourceFileContent,
  type SourceTreeEntry,
  type SourceViewerRepository,
  type SourceViewerRoute,
} from "@/entities/source-viewer";
import { SourceViewerSearchForm } from "@/features/source-viewer-search";
import {
  HighlightedMarkdown,
  toTokenStyle,
  useHighlightedLines,
  type HighlightedCode,
  type HighlightThemeMode,
} from "@/features/source-code-highlight";
import type { SourceViewerLabels } from "../model/source-viewer-labels";
import styles from "./repository-source-browser.module.css";

type ViewMode = "code" | "preview";

type LineTokens = HighlightedCode["lines"][number];

interface SourceSelection {
  path: string;
  file: SourceTreeEntry | undefined;
}

interface TreeNode {
  entry: SourceTreeEntry;
  children: TreeNode[];
}

/** Tree fetched for a branch-corrected route, handed to the re-entry that follows the correction. */
interface CorrectionCache {
  key: string;
  repository: SourceViewerRepository;
}

interface ResolvedTree {
  repository: SourceViewerRepository;
  effectivePath: string;
  /** Set when a slashed branch name was folded out of the path: the route to re-enter with. */
  correctedRoute?: SourceViewerRoute;
}

interface RepositorySourceBrowserProps {
  initialRoute: SourceViewerRoute;
  labels: SourceViewerLabels;
  showSearchForm?: boolean;
  /** Active site layout id: picks the matching VS Code token palette. */
  themeId?: string;
  /** Active site theme's mode: fallback palette (Dark+/Light+) for unmapped layouts. */
  themeMode?: HighlightThemeMode;
  onRouteChange?: (route: SourceViewerRoute, options?: { replace?: boolean }) => void;
  /** Standalone page only: a link back to the site, rendered beside the GitHub link. */
  backLink?: { href: string; label: string };
}

/** Sidebar placeholder line widths while the tree loads (mimics a file tree). */
const SKELETON_ROW_WIDTHS = ["72%", "58%", "84%", "64%", "48%", "76%"];
const TREE_BASE_PADDING = 8;
const TREE_LEVEL_INDENT = 16;

function normalizeInput(value: string): string {
  return trimSlashes(value.trim());
}

function isMarkdownFile(path: string): boolean {
  return /\.mdx?$/i.test(path);
}

/** Markdown opens rendered; everything else opens as code. */
function defaultViewMode(path: string): ViewMode {
  return isMarkdownFile(path) ? "preview" : "code";
}

function routeKey(owner: string, repo: string, branch: string): string {
  return `${owner}/${repo}/${branch}`;
}

function getParentPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
}

function getEntryDepth(path: string): number {
  return path.split("/").filter(Boolean).length - 1;
}

function getDirectoryEntries(entries: SourceTreeEntry[], directoryPath: string): SourceTreeEntry[] {
  const prefix = directoryPath ? `${directoryPath}/` : "";
  return entries
    .filter((entry) => entry.path.startsWith(prefix) && entry.path !== directoryPath && !entry.path.slice(prefix.length).includes("/"))
    .sort(sortEntries);
}

function sortEntries(a: SourceTreeEntry, b: SourceTreeEntry): number {
  if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function filterEntries(entries: SourceTreeEntry[], query: string): SourceTreeEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) => entry.path.toLowerCase().includes(normalized)).sort(sortEntries);
}

function buildTree(entries: SourceTreeEntry[]): TreeNode[] {
  const directories = new Map<string, TreeNode>();
  const directoryEntriesByPath = new Map<string, SourceTreeEntry>(
    entries.filter((entry) => entry.type === "tree").map((entry) => [entry.path, entry]),
  );
  const roots: TreeNode[] = [];

  function ensureDirectory(entry: SourceTreeEntry): TreeNode {
    const existing = directories.get(entry.path);
    if (existing) return existing;
    const node: TreeNode = { entry, children: [] };
    directories.set(entry.path, node);
    const parentPath = getParentPath(entry.path);
    if (parentPath) {
      const parentEntry = directoryEntriesByPath.get(parentPath);
      if (parentEntry) ensureDirectory(parentEntry).children.push(node);
    } else {
      roots.push(node);
    }
    return node;
  }

  entries.filter((entry) => entry.type === "tree").sort(sortEntries).forEach(ensureDirectory);
  for (const file of entries.filter((entry) => entry.type === "blob").sort(sortEntries)) {
    const parentPath = getParentPath(file.path);
    const node = { entry: file, children: [] };
    if (parentPath) {
      const parent = directories.get(parentPath);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots.sort((a, b) => sortEntries(a.entry, b.entry));
}

function formatBytes(value: number | undefined): string {
  if (value === undefined) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function findInitialSelection(entries: SourceTreeEntry[], requestedPath: string): SourceSelection {
  const exact = entries.find((entry) => entry.path === requestedPath);
  if (exact?.type === "tree") return { path: exact.path, file: undefined };
  if (exact?.type === "blob") return { path: exact.path, file: exact };
  const readme = entries.find((entry) => entry.type === "blob" && entry.path.toLowerCase() === "readme.md");
  return { path: "", file: readme };
}

function buildCrumbs(path: string, repositoryName: string): Array<{ label: string; path: string }> {
  const parts = path.split("/").filter(Boolean);
  const crumbs = [{ label: repositoryName, path: "" }];
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    crumbs.push({ label: part, path: current });
  }
  return crumbs;
}

/**
 * Resolves the tree for `route` from the network. When the service folds a
 * slashed branch name out of the path, the corrected route is returned with
 * the tree so the caller can re-enter without fetching it again.
 */
async function resolveTreeForRoute(route: SourceViewerRoute): Promise<ResolvedTree> {
  const resolved = await resolveSourceRepository(route);
  if (resolved.route.branch !== route.branch) {
    return { repository: resolved.repository, effectivePath: resolved.route.path, correctedRoute: resolved.route };
  }
  return { repository: resolved.repository, effectivePath: resolved.route.path };
}

function normalizeLineEndings(content: string): string {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

interface CodeViewerProps {
  content: string;
  filePath: string;
  themeId: string | undefined;
  themeMode: HighlightThemeMode;
}

/**
 * Repaints the editor surface (background, gutter, rules) with the resolved
 * Shiki theme's own palette, so tokens sit on the background they were
 * designed for while the rest of the browser chrome keeps the site theme.
 */
function buildEditorSurfaceStyle(highlighted: ReturnType<typeof useHighlightedLines>): React.CSSProperties | undefined {
  if (!highlighted?.background) return undefined;
  const foreground = highlighted.foreground ?? "currentColor";
  return {
    "--source-browser-editor": highlighted.background,
    "--source-browser-editor-rail": highlighted.background,
    "--source-browser-line": `color-mix(in srgb, ${foreground} 16%, transparent)`,
    "--source-browser-muted": `color-mix(in srgb, ${foreground} 45%, transparent)`,
    color: foreground,
  } as React.CSSProperties;
}

/** Keys each token by its start column: stable within the line, unique for non-empty tokens. */
function renderLineTokens(tokens: LineTokens): React.ReactNode {
  let column = 0;
  return tokens.map((token) => {
    const start = column;
    column += token.content.length;
    return (
      <span key={start} style={toTokenStyle(token)}>
        {token.content}
      </span>
    );
  });
}

const CodeViewer = memo(function CodeViewer({ content, filePath, themeId, themeMode }: Readonly<CodeViewerProps>) {
  // Both the plain split and the tokenizer receive the same normalized text
  // so token rows stay aligned with line numbers on CRLF files.
  const normalizedContent = useMemo(() => normalizeLineEndings(content), [content]);
  // A file's lines are a fixed, ordered list: the line number is the row's identity.
  const rows = useMemo(
    () => normalizedContent.split("\n").map((text, index) => ({ number: index + 1, text })),
    [normalizedContent],
  );
  // VS Code-grade tokens (Shiki); null while loading or unsupported, in which
  // case each row falls back to the plain text it already renders today.
  const highlighted = useHighlightedLines(normalizedContent, filePath, { id: themeId, mode: themeMode });
  return (
    <div className={styles.codeScroll} style={buildEditorSurfaceStyle(highlighted)}>
      <table className={styles.codeTable}>
        <tbody>
          {rows.map((row) => {
            const tokens = highlighted?.lines[row.number - 1];
            return (
              <tr key={row.number}>
                <td className={styles.lineNumber}>{row.number}</td>
                <td className={styles.lineCode}>{tokens ? renderLineTokens(tokens) : row.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

const MarkdownPreview = memo(function MarkdownPreview({ content, themeId, themeMode }: Readonly<Omit<CodeViewerProps, "filePath">>) {
  const html = useMemo(() => markdownToHtml(content), [content]);
  return <HighlightedMarkdown className={styles.markdownPreview} html={html} theme={{ id: themeId, mode: themeMode }} />;
});

interface DirectoryListingProps {
  entries: SourceTreeEntry[];
  currentDirectory: string;
  labels: SourceViewerLabels;
  treeQuery: string;
  onClearQuery: () => void;
  onSelectDirectory: (path: string) => void;
  onSelectFile: (entry: SourceTreeEntry) => void;
}

/** Rows of the current directory, or the empty-state card (with a clear-filter action while a filter is on). */
function DirectoryListing({
  entries,
  currentDirectory,
  labels,
  treeQuery,
  onClearQuery,
  onSelectDirectory,
  onSelectFile,
}: Readonly<DirectoryListingProps>): ReactElement {
  if (entries.length === 0 && !currentDirectory) {
    return (
      <div className={`${styles.state} ${styles.stateCard}`}>
        <FiFolder aria-hidden className={styles.stateIcon} />
        <p className={styles.stateMessage}>{labels.empty}</p>
        {treeQuery ? (
          <button type="button" className={styles.treeButton} onClick={onClearQuery}>
            <FiX aria-hidden /> {labels.clear}
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <table className={styles.fileTable} aria-label={labels.files}>
      <thead><tr><th scope="col">{labels.name}</th><th scope="col">{labels.size}</th></tr></thead>
      <tbody>
        {currentDirectory ? (
          <tr><td colSpan={2}>
            <button type="button" className={styles.fileRow} aria-label={labels.parent} onClick={() => onSelectDirectory(getParentPath(currentDirectory))}>
              <FiArrowLeft aria-hidden /><span>..</span>
            </button>
          </td></tr>
        ) : null}
        {entries.map((entry) => (
          <tr key={entry.path}>
            <td>
              <button type="button" className={styles.fileRow} onClick={() => (entry.type === "tree" ? onSelectDirectory(entry.path) : onSelectFile(entry))}>
                {entry.type === "tree" ? <FiFolder className={styles.folderIcon} aria-hidden /> : <FiFile aria-hidden />}
                <span className={styles.fileName}>{entry.name}</span>
              </button>
            </td>
            <td className={styles.fileMeta}>{entry.type === "blob" ? formatBytes(entry.size) : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface SelectedFileViewerProps {
  selectedFile: SourceFileContent | null;
  selectedIsMarkdown: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  error: string;
  isLoadingFile: boolean;
  labels: SourceViewerLabels;
  onRetry: () => void;
  themeId: string | undefined;
  themeMode: HighlightThemeMode;
}

/** The viewer pane: mode switch for markdown, then error / loading / preview / code / empty states. */
function SelectedFileViewer({
  selectedFile,
  selectedIsMarkdown,
  viewMode,
  onViewModeChange,
  error,
  isLoadingFile,
  labels,
  onRetry,
  themeId,
  themeMode,
}: Readonly<SelectedFileViewerProps>) {
  const showPreview = !isLoadingFile && selectedFile && viewMode === "preview" && selectedIsMarkdown;
  const showCode = !isLoadingFile && selectedFile && (viewMode === "code" || !selectedIsMarkdown);
  const showEmpty = !isLoadingFile && !selectedFile && !error;
  return (
    <section className={styles.viewer}>
      <div className={styles.viewerHeader}>
        <div className={styles.viewerTitle}>{selectedFile?.path ?? labels.selectFile}</div>
        {selectedIsMarkdown ? (
          <div className={styles.modeGroup}>
            <button type="button" className={`${styles.modeButton} ${viewMode === "preview" ? styles.modeButtonActive : ""}`} onClick={() => onViewModeChange("preview")}>
              {labels.preview}
            </button>
            <button type="button" className={`${styles.modeButton} ${viewMode === "code" ? styles.modeButtonActive : ""}`} onClick={() => onViewModeChange("code")}>
              {labels.code}
            </button>
          </div>
        ) : null}
      </div>
      {error ? (
        <div className={`${styles.state} ${styles.stateCard}`} role="alert">
          <FiAlertCircle aria-hidden className={`${styles.stateIcon} ${styles.error}`} />
          <p className={`${styles.stateMessage} ${styles.error}`}>{error}</p>
          <button type="button" className={styles.button} onClick={onRetry}>
            <FiRefreshCw aria-hidden /> {labels.retry}
          </button>
        </div>
      ) : null}
      {isLoadingFile ? <div className={styles.state}>{labels.loadingFile}</div> : null}
      {showPreview ? <MarkdownPreview content={selectedFile.content} themeId={themeId} themeMode={themeMode} /> : null}
      {showCode ? (
        <CodeViewer content={selectedFile.content} filePath={selectedFile.path} themeId={themeId} themeMode={themeMode} />
      ) : null}
      {showEmpty ? <div className={styles.state}>{labels.selectFile}</div> : null}
    </section>
  );
}

export function RepositorySourceBrowser({
  initialRoute,
  labels,
  showSearchForm = true,
  themeId,
  themeMode = "dark",
  onRouteChange,
  backLink,
}: Readonly<RepositorySourceBrowserProps>): ReactElement {
  const [route, setRoute] = useState(initialRoute);
  const [ownerInput, setOwnerInput] = useState(initialRoute.owner);
  const [repoInput, setRepoInput] = useState(initialRoute.repo);
  const [branchInput, setBranchInput] = useState(initialRoute.branch);
  const [treeQuery, setTreeQuery] = useState("");
  const [repository, setRepository] = useState<SourceViewerRepository | null>(null);
  const [selectedFile, setSelectedFile] = useState<SourceFileContent | null>(null);
  const [activePath, setActivePath] = useState(initialRoute.path);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const treeId = useId();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState("");
  const onRouteChangeRef = useRef(onRouteChange);
  onRouteChangeRef.current = onRouteChange;
  // One-shot handoff of an already-fetched tree across the branch-correction
  // re-entry, so a slashed-branch URL does not fetch the same tree twice.
  const correctionCacheRef = useRef<CorrectionCache | null>(null);

  const filteredEntries = useMemo(() => filterEntries(repository?.entries ?? [], treeQuery), [repository?.entries, treeQuery]);
  const treeNodes = useMemo(() => buildTree(repository?.entries ?? []), [repository?.entries]);
  const activeEntry = useMemo(() => repository?.entries.find((entry) => entry.path === activePath), [repository?.entries, activePath]);
  const isFileView = activeEntry?.type === "blob";
  const currentDirectory = isFileView ? getParentPath(activePath) : activePath;
  const directoryEntries = useMemo(() => getDirectoryEntries(repository?.entries ?? [], currentDirectory), [repository?.entries, currentDirectory]);
  const selectedIsMarkdown = Boolean(selectedFile && isMarkdownFile(selectedFile.path));

  useEffect(() => {
    let cancelled = false;

    async function loadTree() {
      setIsLoadingTree(true);
      setError("");
      setSelectedFile(null);
      try {
        const cached = correctionCacheRef.current;
        correctionCacheRef.current = null;
        let resolved: ResolvedTree;
        if (cached?.key === routeKey(route.owner, route.repo, route.branch)) {
          resolved = { repository: cached.repository, effectivePath: route.path };
        } else {
          resolved = await resolveTreeForRoute(route);
          if (cancelled) return;
        }
        if (resolved.correctedRoute) {
          // Hand the tree to the corrected re-entry and replace (not push) the
          // URL so the Back button is not trapped on the mis-parsed address.
          correctionCacheRef.current = {
            key: routeKey(route.owner, route.repo, resolved.correctedRoute.branch),
            repository: resolved.repository,
          };
          setRoute(resolved.correctedRoute);
          onRouteChangeRef.current?.(resolved.correctedRoute, { replace: true });
          return;
        }
        setRepository(resolved.repository);
        const initialSelection = findInitialSelection(resolved.repository.entries, resolved.effectivePath);
        setActivePath(initialSelection.path);
        setExpanded({});
        if (initialSelection.file) {
          setIsLoadingFile(true);
          const file = await loadSourceFile(route.owner, route.repo, route.branch, initialSelection.file.path);
          if (!cancelled) {
            setSelectedFile(file);
            setViewMode(defaultViewMode(file.path));
          }
        }
      } catch {
        if (!cancelled) {
          setError(labels.notFound);
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
  }, [labels.notFound, route]);

  function updateRoute(nextRoute: SourceViewerRoute) {
    setRoute(nextRoute);
    onRouteChange?.(nextRoute);
  }

  async function selectFile(entry: SourceTreeEntry) {
    setIsLoadingFile(true);
    setError("");
    try {
      const file = await loadSourceFile(route.owner, route.repo, route.branch, entry.path);
      setSelectedFile(file);
      setActivePath(entry.path);
      setViewMode(defaultViewMode(entry.path));
      onRouteChange?.({ ...route, path: entry.path });
    } catch {
      setError(labels.fileError);
    } finally {
      setIsLoadingFile(false);
    }
  }

  function selectDirectory(path: string) {
    setActivePath(path);
    setSelectedFile(null);
    setExpanded((prev) => ({ ...prev, [path]: true }));
    onRouteChange?.({ ...route, path });
  }

  function retryLoad() {
    // A fresh route identity re-runs the tree effect for the same target.
    setRoute((previous) => ({ ...previous }));
  }

  function submitSearch() {
    const nextRoute = {
      owner: normalizeInput(ownerInput),
      repo: normalizeInput(repoInput),
      branch: normalizeInput(branchInput) || DEFAULT_SOURCE_VIEWER_BRANCH,
      path: "",
    };
    if (!nextRoute.owner || !nextRoute.repo || !nextRoute.branch) return;
    updateRoute(nextRoute);
  }

  function selectTreeDirectory(path: string) {
    const isOpen = expanded[path] ?? (activePath === path || activePath.startsWith(`${path}/`));
    setActivePath(path);
    setSelectedFile(null);
    setExpanded((prev) => ({ ...prev, [path]: !isOpen }));
    onRouteChange?.({ ...route, path });
  }

  function renderNode(node: TreeNode): React.ReactNode {
    const isDirectory = node.entry.type === "tree";
    const isOpen = expanded[node.entry.path] ?? (activePath === node.entry.path || activePath.startsWith(`${node.entry.path}/`));
    const directoryChevron = isOpen ? <FiChevronDown aria-hidden /> : <FiChevronRight aria-hidden />;
    return (
      <div key={node.entry.path}>
        <button
          type="button"
          className={`${styles.treeItem} ${selectedFile?.path === node.entry.path ? styles.treeItemActive : ""}`}
          aria-expanded={isDirectory ? isOpen : undefined}
          aria-current={activePath === node.entry.path ? "page" : undefined}
          style={{ paddingLeft: `${TREE_BASE_PADDING + Math.max(0, getEntryDepth(node.entry.path)) * TREE_LEVEL_INDENT}px` }}
          onClick={() => (isDirectory ? selectTreeDirectory(node.entry.path) : selectFile(node.entry))}
        >
          <span className={styles.treeChevron}>{isDirectory ? directoryChevron : null}</span>
          {isDirectory ? <FiFolder className={styles.folderIcon} aria-hidden /> : <FiFile aria-hidden />}
          <span className={styles.fileName}>{node.entry.name}</span>
        </button>
        {isDirectory && isOpen ? node.children.map(renderNode) : null}
      </div>
    );
  }

  /** Sidebar tree: loading skeleton, flat filter results, or the nested tree. */
  function renderTreeContent(): React.ReactNode {
    if (isLoadingTree) {
      return (
        <output className={styles.state} aria-label={labels.loadingTree}>
          <div className={styles.skeletonTree} aria-hidden>
            {SKELETON_ROW_WIDTHS.map((width) => (
              <span key={width} className={styles.skeletonRow} style={{ width }} />
            ))}
          </div>
        </output>
      );
    }
    if (treeQuery) {
      return filteredEntries.map((entry) => (
        <button
          key={entry.path}
          type="button"
          className={`${styles.treeItem} ${selectedFile?.path === entry.path ? styles.treeItemActive : ""}`}
          aria-current={activePath === entry.path ? "page" : undefined}
          onClick={() => (entry.type === "tree" ? selectTreeDirectory(entry.path) : selectFile(entry))}
        >
          <span className={styles.treeChevron} />
          {entry.type === "tree" ? <FiFolder className={styles.folderIcon} aria-hidden /> : <FiFile aria-hidden />}
          <span className={styles.fileName}>{entry.path}</span>
        </button>
      ));
    }
    return treeNodes.map(renderNode);
  }

  return (
    <div className={styles.browser}>
      <section className={styles.toolbar}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <FiCode aria-hidden /><span>{route.owner}<span className={styles.pathSeparator}> / </span><strong>{route.repo}</strong></span>
          </h2>
          <div className={styles.titleActions}>
            {backLink && (
              <Link className={styles.externalLink} href={backLink.href} title={backLink.label}>
                <FiArrowLeft aria-hidden /> {backLink.label}
              </Link>
            )}
            <a className={styles.externalLink} href={buildGithubTreeUrl({ ...route, path: activePath })} target="_blank" rel="noreferrer">
              <FiExternalLink aria-hidden /> GitHub
            </a>
          </div>
        </div>
        {showSearchForm ? (
          <SourceViewerSearchForm
            owner={ownerInput}
            repo={repoInput}
            branch={branchInput}
            ownerLabel={labels.owner}
            repoLabel={labels.repo}
            branchLabel={labels.branch}
            submitLabel={labels.submit}
            onOwnerChange={setOwnerInput}
            onRepoChange={setRepoInput}
            onBranchChange={setBranchInput}
            onSubmit={submitSearch}
            classNames={{ form: styles.form, input: styles.input, button: styles.button }}
          />
        ) : null}
      </section>

      <div className={styles.repositoryBar}>
        <button type="button" className={styles.filesToggle} aria-expanded={isTreeOpen} aria-controls={treeId} onClick={() => setIsTreeOpen((previous) => !previous)}>
          <FiFolder aria-hidden />{labels.files}<FiChevronDown aria-hidden />
        </button>
        <span className={styles.branchBadge}><FiCode aria-hidden /><span>{labels.branch}: <strong>{route.branch}</strong></span></span>
        <nav className={styles.breadcrumb} aria-label={labels.path}>
          {buildCrumbs(activePath, route.repo).map((crumb, index, crumbs) => (
            <span key={crumb.path || "root"}>
              {isFileView && index === crumbs.length - 1 ? <span aria-current="page">{crumb.label}</span> : (
                <button type="button" className={styles.breadcrumbButton} aria-current={crumb.path === activePath ? "page" : undefined} onClick={() => selectDirectory(crumb.path)}>{crumb.label}</button>
              )}
              {index < crumbs.length - 1 ? <span className={styles.pathSeparator}>/</span> : null}
            </span>
          ))}
        </nav>
      </div>
      <section className={styles.layout}>
        <aside id={treeId} className={`${styles.sidebar} ${isTreeOpen ? styles.sidebarOpen : ""}`} aria-label={labels.files}>
          <div className={styles.sidebarHeader}>
            <strong className={styles.sidebarTitle}>{labels.files}</strong>
            <div className={styles.filterRow}>
              <input className={styles.input} value={treeQuery} onChange={(event) => setTreeQuery(event.target.value)} placeholder={labels.filter} aria-label={labels.filter} />
              <button type="button" className={styles.treeButton} aria-label={labels.clear} title={labels.clear} onClick={() => setTreeQuery("")}><FiX aria-hidden /></button>
            </div>
          </div>
          <div className={styles.tree}>{renderTreeContent()}</div>
        </aside>
        <div className={styles.main}>
          {!isFileView && !isLoadingTree && repository ? (
            <section className={styles.panel}>
              <div className={styles.fileList}>
                <DirectoryListing entries={directoryEntries} currentDirectory={currentDirectory} labels={labels} treeQuery={treeQuery} onClearQuery={() => setTreeQuery("")} onSelectDirectory={selectDirectory} onSelectFile={selectFile} />
              </div>
            </section>
          ) : null}
          {selectedFile || isLoadingFile || isLoadingTree || error ? (
            <SelectedFileViewer selectedFile={selectedFile} selectedIsMarkdown={selectedIsMarkdown} viewMode={viewMode} onViewModeChange={setViewMode} error={error} isLoadingFile={isLoadingFile || isLoadingTree} labels={labels} onRetry={retryLoad} themeId={themeId} themeMode={themeMode} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
