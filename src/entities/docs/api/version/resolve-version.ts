import type { ContentTypeRouteConfig, GitPageDocsConfig, HierarchyConfig, RouteConfig, VersionEntry } from "@/entities/docs/model/types";
import { readRemoteJson, readRemoteJsonFromRepo } from "../io/remote-fetcher";
import { tryReadJsonFile } from "../io/file-reader";

export interface VersionRoutesConfig {
  routes?: RouteConfig[];
  "menus-header"?: GitPageDocsConfig["menus-header"];
  "routes-md"?: ContentTypeRouteConfig[] | RouteConfig[];
  "routes-html"?: ContentTypeRouteConfig[];
  "routes-video"?: ContentTypeRouteConfig[];
  "routes-audio"?: ContentTypeRouteConfig[];
  "menus-header-md"?: GitPageDocsConfig["menus-header"];
  "menus-header-html"?: GitPageDocsConfig["menus-header"];
  "menus-header-video"?: GitPageDocsConfig["menus-header"];
  "menus-header-audio"?: GitPageDocsConfig["menus-header"];
  hierarchyPage?: HierarchyConfig;
  hierarchyMenu?: HierarchyConfig;
}

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

export async function loadVersionConfig(options: {
  versionEntry: VersionEntry;
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}): Promise<VersionRoutesConfig | undefined> {
  const versionPath = options.versionEntry.PathConfig || options.versionEntry.path;
  if (!versionPath) {
    return undefined;
  }

  let versionConfig: VersionRoutesConfig | null = null;
  const normalizedPathCandidates = Array.from(
    new Set([
      versionPath,
      versionPath.replace(/^gitpagedocs\//, ""),
      versionPath.startsWith("docs/") ? `gitpagedocs/${versionPath}` : versionPath,
    ]),
  );

  if (/^https?:\/\//i.test(versionPath)) {
    versionConfig = await readRemoteJson<VersionRoutesConfig>(versionPath);
  } else if (options.source === "remote" && options.owner && options.repo) {
    for (const candidate of normalizedPathCandidates) {
      versionConfig = await readRemoteJsonFromRepo<VersionRoutesConfig>(options.owner, options.repo, candidate);
      if (versionConfig) {
        break;
      }
    }
  } else {
    for (const candidate of normalizedPathCandidates) {
      versionConfig = await tryReadJsonFile<VersionRoutesConfig>(candidate);
      if (versionConfig) {
        break;
      }
    }
  }

  const hasAnyRoutes =
    (versionConfig?.routes?.length ?? 0) > 0 ||
    (versionConfig?.["routes-md"]?.length ?? 0) > 0 ||
    (versionConfig?.["routes-html"]?.length ?? 0) > 0 ||
    (versionConfig?.["routes-video"]?.length ?? 0) > 0 ||
    (versionConfig?.["routes-audio"]?.length ?? 0) > 0;
  const hasAnyMenus =
    (versionConfig?.["menus-header"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-md"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-html"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-video"]?.length ?? 0) > 0 ||
    (versionConfig?.["menus-header-audio"]?.length ?? 0) > 0;
  if ((hasAnyRoutes || hasAnyMenus) && versionConfig) {
    return versionConfig;
  }

  return undefined;
}
