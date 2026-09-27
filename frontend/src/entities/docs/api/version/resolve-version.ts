import type {
  AuthConfig,
  ContentTypeRouteConfig,
  GitPageDocsConfig,
  HierarchyConfig,
  RouteConfig,
  VersionEntry,
} from "@/entities/docs/model/types";
import { readRemoteJson, readRemoteJsonFromRepo } from "../io/remote-fetcher";
import { tryReadJsonFile } from "../io/file-reader";

export interface VersionRoutesConfig {
  auth?: AuthConfig;
  routes?: RouteConfig[];
  "menus-header"?: GitPageDocsConfig["menus-header"];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-source-viewer"?: ContentTypeRouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "routes-audio"?: ContentTypeRouteConfig[];
  "menus-header-md"?: GitPageDocsConfig["menus-header"];
  "menus-header-source-viewer"?: GitPageDocsConfig["menus-header"];
  "menus-header-html"?: GitPageDocsConfig["menus-header"];
  "menus-header-video"?: GitPageDocsConfig["menus-header"];
  "menus-header-audio"?: GitPageDocsConfig["menus-header"];
  hierarchyPage?: HierarchyConfig;
  hierarchyMenu?: HierarchyConfig;
}

type VersionListKey = Exclude<keyof VersionRoutesConfig, "auth" | "hierarchyPage" | "hierarchyMenu">;

const ROUTE_LIST_KEYS: readonly VersionListKey[] = [
  "routes",
  "routes-md",
  "routes-source-viewer",
  "routes-html",
  "routes-video",
  "routes-audio",
];

const MENU_LIST_KEYS: readonly VersionListKey[] = [
  "menus-header",
  "menus-header-md",
  "menus-header-source-viewer",
  "menus-header-html",
  "menus-header-video",
  "menus-header-audio",
];

export function resolveActiveVersionId(
  versions: VersionEntry[],
  selectedVersionId: string | undefined,
  defaultVersionId: string | undefined,
): string | undefined {
  if (!versions.length) {
    return undefined;
  }

  if (selectedVersionId && versions.some((version) => version.id === selectedVersionId)) {
    return selectedVersionId;
  }

  if (defaultVersionId && versions.some((version) => version.id === defaultVersionId)) {
    return defaultVersionId;
  }

  return versions[0]?.id;
}

interface LoadVersionConfigOptions {
  versionEntry: VersionEntry;
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}

/**
 * Repo-relative locations a version config may live at: as written, without a
 * `gitpagedocs/` prefix, and (for `docs/...` paths) under `gitpagedocs/`.
 */
function buildVersionPathCandidates(versionPath: string): string[] {
  return Array.from(
    new Set([
      versionPath,
      versionPath.replace(/^gitpagedocs\//, ""),
      versionPath.startsWith("docs/") ? `gitpagedocs/${versionPath}` : versionPath,
    ]),
  );
}

async function readFirstAvailable(
  candidates: string[],
  read: (candidate: string) => Promise<VersionRoutesConfig | null>,
): Promise<VersionRoutesConfig | null> {
  for (const candidate of candidates) {
    const versionConfig = await read(candidate);
    if (versionConfig) {
      return versionConfig;
    }
  }
  return null;
}

/** Absolute URLs are fetched directly; anything else is resolved against the remote repo or the local workspace. */
async function readVersionConfig(versionPath: string, options: LoadVersionConfigOptions): Promise<VersionRoutesConfig | null> {
  if (/^https?:\/\//i.test(versionPath)) {
    return readRemoteJson<VersionRoutesConfig>(versionPath);
  }
  const candidates = buildVersionPathCandidates(versionPath);
  const { source, owner, repo } = options;
  if (source === "remote" && owner && repo) {
    return readFirstAvailable(candidates, (candidate) => readRemoteJsonFromRepo<VersionRoutesConfig>(owner, repo, candidate));
  }
  return readFirstAvailable(candidates, (candidate) => tryReadJsonFile<VersionRoutesConfig>(candidate));
}

function hasAnyEntries(versionConfig: VersionRoutesConfig, keys: readonly VersionListKey[]): boolean {
  return keys.some((key) => (versionConfig[key]?.length ?? 0) > 0);
}

/** A version config is only worth applying when it carries routes, menus or auth. */
function hasVersionContent(versionConfig: VersionRoutesConfig): boolean {
  return (
    hasAnyEntries(versionConfig, ROUTE_LIST_KEYS) ||
    hasAnyEntries(versionConfig, MENU_LIST_KEYS) ||
    typeof versionConfig.auth === "object"
  );
}

export async function loadVersionConfig(options: LoadVersionConfigOptions): Promise<VersionRoutesConfig | undefined> {
  const versionPath = options.versionEntry.PathConfig || options.versionEntry.path;
  if (!versionPath) {
    return undefined;
  }

  const versionConfig = await readVersionConfig(versionPath, options);
  return versionConfig && hasVersionContent(versionConfig) ? versionConfig : undefined;
}
