"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { FiAlertCircle, FiExternalLink, FiFile, FiFolder, FiRefreshCw, FiSearch, FiX } from "@/shared/ui/fallback-icons";
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
import type { SourceViewerLabels } from "../model/source-viewer-labels";
import styles from "./repository-source-browser.module.css";

type ViewMode = "code" | "preview";

interface SourceSelection {
  directoryPath: string;
  file: SourceTreeEntry | undefined;
}

interface TreeNode {
  entry: SourceTreeEntry;
  children: TreeNode[];
}

interface RepositorySourceBrowserProps {
  initialRoute: SourceViewerRoute;
  labels: SourceViewerLabels;
  showSearchForm?: boolean;
  onRouteChange?: (route: SourceViewerRoute, options?: { replace?: boolean }) => void;
}

/** Sidebar placeholder line widths while the tree loads (mimics a file tree). */
const SKELETON_ROW_WIDTHS = ["72%", "58%", "84%", "64%", "48%", "76%"];

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
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function findInitialSelection(entries: SourceTreeEntry[], requestedPath: string): SourceSelection {
  const exact = entries.find((entry) => entry.path === requestedPath);
  if (exact?.type === "tree") return { directoryPath: exact.path, file: undefined };
  if (exact?.type === "blob") return { directoryPath: getParentPath(exact.path), file: exact };
  const file = entries.find((entry) => entry.type === "blob" && entry.path.toLowerCase() === "readme.md") ?? entries.find((entry) => entry.type === "blob");
  return { directoryPath: file ? getParentPath(file.path) : requestedPath, file };
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

function splitCodeLines(content: string): string[] {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

const CodeViewer = memo(function CodeViewer({ content }: { content: string }) {
  const lines = useMemo(() => splitCodeLines(content), [content]);
  return (
    <div className={styles.codeScroll}>
      <table className={styles.codeTable}>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index}>
              <td className={styles.lineNumber}>{index + 1}</td>
              <td className={styles.lineCode}>{line}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const MarkdownPreview = memo(function MarkdownPreview({ content }: { content: string }) {
  const html = useMemo(() => marked.parse(content) as string, [content]);
  return <div className={styles.markdownPreview} dangerouslySetInnerHTML={{ __html: html }} />;
});

export function RepositorySourceBrowser({
  initialRoute,
  labels,
  showSearchForm = true,
  onRouteChange,
}: RepositorySourceBrowserProps) {
  const [route, setRoute] = useState(initialRoute);
  const [ownerInput, setOwnerInput] = useState(initialRoute.owner);
  const [repoInput, setRepoInput] = useState(initialRoute.repo);
  const [branchInput, setBranchInput] = useState(initialRoute.branch);
  const [treeQuery, setTreeQuery] = useState("");
  const [repository, setRepository] = useState<SourceViewerRepository | null>(null);
  const [selectedFile, setSelectedFile] = useState<SourceFileContent | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState(initialRoute.path);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState("");
  const onRouteChangeRef = useRef(onRouteChange);
  onRouteChangeRef.current = onRouteChange;
  // One-shot handoff of an already-fetched tree across the branch-correction
  // re-entry, so a slashed-branch URL does not fetch the same tree twice.
  const correctionCacheRef = useRef<{ key: string; repository: SourceViewerRepository } | null>(null);

  const filteredEntries = useMemo(() => filterEntries(repository?.entries ?? [], treeQuery), [repository?.entries, treeQuery]);
  const treeNodes = useMemo(() => buildTree(repository?.entries ?? []), [repository?.entries]);
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
        let repository: SourceViewerRepository;
        let effectivePath = route.path;
        if (cached && cached.key === `${route.owner}/${route.repo}/${route.branch}`) {
          repository = cached.repository;
        } else {
          const resolved = await resolveSourceRepository(route);
          if (cancelled) return;
          if (resolved.route.branch !== route.branch) {
            // A slashed branch name was folded out of the path: hand the tree
            // to the corrected re-entry and replace (not push) the URL so the
            // Back button is not trapped on the mis-parsed address.
            correctionCacheRef.current = {
              key: `${route.owner}/${route.repo}/${resolved.route.branch}`,
              repository: resolved.repository,
            };
            setRoute(resolved.route);
            onRouteChangeRef.current?.(resolved.route, { replace: true });
            return;
          }
          repository = resolved.repository;
          effectivePath = resolved.route.path;
        }
        setRepository(repository);
        const initialSelection = findInitialSelection(repository.entries, effectivePath);
        setCurrentDirectory(initialSelection.directoryPath);
        setExpanded({});
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
      setCurrentDirectory(getParentPath(entry.path));
      setViewMode(isMarkdownFile(entry.path) ? "preview" : "code");
      onRouteChange?.({ ...route, path: entry.path });
    } catch {
      setError(labels.fileError);
    } finally {
      setIsLoadingFile(false);
    }
  }

  function selectDirectory(path: string) {
    setCurrentDirectory(path);
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
    setCurrentDirectory(path);
    setSelectedFile(null);
    setExpanded((prev) => ({ ...prev, [path]: !(prev[path] ?? true) }));
    onRouteChange?.({ ...route, path });
  }

  function renderNode(node: TreeNode): React.ReactNode {
    const isDirectory = node.entry.type === "tree";
    const isOpen = expanded[node.entry.path] ?? true;
    return (
      <div key={node.entry.path}>
        <button
          type="button"
          className={`${styles.treeItem} ${selectedFile?.path === node.entry.path ? styles.treeItemActive : ""}`}
          style={{ paddingLeft: `${8 + Math.max(0, getEntryDepth(node.entry.path)) * 12}px` }}
          onClick={() => (isDirectory ? selectTreeDirectory(node.entry.path) : selectFile(node.entry))}
        >
          {isDirectory ? <FiFolder aria-hidden /> : <FiFile aria-hidden />}
          <span className={styles.fileName}>{node.entry.name}</span>
        </button>
        {isDirectory && isOpen ? node.children.map(renderNode) : null}
      </div>
    );
  }

  return (
    <div className={styles.browser}>
      <section className={styles.toolbar}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            {route.owner}/{route.repo}
          </h2>
          <a className={styles.externalLink} href={buildGithubTreeUrl(route)} target="_blank" rel="noreferrer">
            <FiExternalLink aria-hidden /> GitHub
          </a>
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

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <input
              className={styles.input}
              value={treeQuery}
              onChange={(event) => setTreeQuery(event.target.value)}
              placeholder={labels.filter}
              aria-label={labels.filter}
            />
            <button type="button" className={styles.treeButton} onClick={() => setTreeQuery("")}>
              <FiSearch aria-hidden /> {labels.clear}
            </button>
          </div>
          <div className={styles.tree}>
            {isLoadingTree ? (
              <div className={styles.state} role="status" aria-label={labels.loadingTree}>
                <div className={styles.skeletonTree} aria-hidden>
                  {SKELETON_ROW_WIDTHS.map((width, index) => (
                    <span key={index} className={styles.skeletonRow} style={{ width }} />
                  ))}
                </div>
              </div>
            ) : treeQuery ? (
              filteredEntries.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  className={`${styles.treeItem} ${selectedFile?.path === entry.path ? styles.treeItemActive : ""}`}
                  style={{ paddingLeft: `${8 + Math.max(0, getEntryDepth(entry.path)) * 12}px` }}
                  onClick={() => (entry.type === "tree" ? selectTreeDirectory(entry.path) : selectFile(entry))}
                >
                  {entry.type === "tree" ? <FiFolder aria-hidden /> : <FiFile aria-hidden />}
                  <span className={styles.fileName}>{entry.path}</span>
                </button>
              ))
            ) : (
              treeNodes.map(renderNode)
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
                <div className={`${styles.state} ${styles.stateCard}`}>
                  <FiFolder aria-hidden className={styles.stateIcon} />
                  <p className={styles.stateMessage}>{labels.empty}</p>
                  {treeQuery ? (
                    <button type="button" className={styles.treeButton} onClick={() => setTreeQuery("")}>
                      <FiX aria-hidden /> {labels.clear}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <section className={styles.viewer}>
            <div className={styles.viewerHeader}>
              <div className={styles.viewerTitle}>{selectedFile?.path ?? labels.selectFile}</div>
              {selectedIsMarkdown ? (
                <div className={styles.modeGroup}>
                  <button type="button" className={`${styles.modeButton} ${viewMode === "preview" ? styles.modeButtonActive : ""}`} onClick={() => setViewMode("preview")}>
                    {labels.preview}
                  </button>
                  <button type="button" className={`${styles.modeButton} ${viewMode === "code" ? styles.modeButtonActive : ""}`} onClick={() => setViewMode("code")}>
                    {labels.code}
                  </button>
                </div>
              ) : null}
            </div>
            {error ? (
              <div className={`${styles.state} ${styles.stateCard}`} role="alert">
                <FiAlertCircle aria-hidden className={`${styles.stateIcon} ${styles.error}`} />
                <p className={`${styles.stateMessage} ${styles.error}`}>{error}</p>
                <button type="button" className={styles.button} onClick={retryLoad}>
                  <FiRefreshCw aria-hidden /> {labels.retry}
                </button>
              </div>
            ) : null}
            {isLoadingFile ? <div className={styles.state}>{labels.loadingFile}</div> : null}
            {!isLoadingFile && selectedFile && viewMode === "preview" && selectedIsMarkdown ? <MarkdownPreview content={selectedFile.content} /> : null}
            {!isLoadingFile && selectedFile && (viewMode === "code" || !selectedIsMarkdown) ? <CodeViewer content={selectedFile.content} /> : null}
            {!isLoadingFile && !selectedFile && !error ? <div className={styles.state}>{labels.selectFile}</div> : null}
          </section>
        </div>
      </section>
    </div>
  );
}
