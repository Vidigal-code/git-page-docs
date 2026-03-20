import type { GitPageDocsConfig, LoadedDocsData } from "@/entities/docs/model/types";
import { loadRootConfig } from "./io/config-loader";
import { getLanguages } from "./utils/route-utils";
import { resolveActiveVersionId, loadVersionConfig } from "./version/resolve-version";
import { loadLayoutsAndThemes } from "./layouts/load-layouts";
import { loadPages } from "./content/load-pages";
import { resolveDocsSource } from "./resolve-docs-source";
import { isLocalRuntime } from "@/shared/lib/runtime";
import { mergeVersionConfig } from "./config/merge-version-config";
import { buildEffectiveConfig } from "./config/build-effective-config";
import { dedupeVersionEntriesById } from "../lib/dedupe-version-entries";

export async function loadDocsData(slug: string[] | undefined, selectedVersionId?: string): Promise<LoadedDocsData> {
  const localConfig = await loadRootConfig<GitPageDocsConfig>();
  const {
    source,
    owner,
    repo,
    config: baseConfig,
    hasGitPageDocs,
    showRepositorySearchHome,
    isRepositoryRouteRequest,
  } = await resolveDocsSource(slug, localConfig, selectedVersionId);

  const local = isLocalRuntime();

  const availableVersions = dedupeVersionEntriesById(baseConfig.VersionControl?.versions ?? []);
  const activeVersionId = resolveActiveVersionId(availableVersions, selectedVersionId, baseConfig.site.docsVersion);
  const activeVersion = activeVersionId
    ? availableVersions.find((version) => version.id === activeVersionId)
    : undefined;

  const baseConfigForMerge: GitPageDocsConfig = {
    ...baseConfig,
    "routes-md":
      showRepositorySearchHome || (isRepositoryRouteRequest && !hasGitPageDocs)
        ? []
        : (baseConfig["routes-md"] ?? baseConfig.routes ?? []),
  };

  let versionConfig;
  if (activeVersionId && activeVersion) {
    versionConfig = await loadVersionConfig({ versionEntry: activeVersion, source, owner, repo });
  }

  const merged = mergeVersionConfig(baseConfigForMerge, versionConfig);
  const { effectiveConfig, sortedIds } = buildEffectiveConfig(baseConfig, merged);

  const { layoutsConfig, themes } = await loadLayoutsAndThemes({
    isLocal: local,
    owner,
    repo,
    useOfficialLayouts: effectiveConfig.site.layoutsConfigPathOficial === true,
    officialLayoutsConfigPath: effectiveConfig.site.layoutsConfigPathOficialUrl,
    officialLayoutsTemplatesPath: effectiveConfig.site.layoutsConfigPathTemplatesOficial,
    layoutsConfigPath: effectiveConfig.site.layoutsConfigPath,
    layoutsConfigPathTemplates: effectiveConfig.site.layoutsConfigPathTemplates,
  });

  const languages = getLanguages(
    effectiveConfig,
    merged.routesMd,
    merged.routesHtml,
    merged.routesVideo,
    merged.routesAudio,
  );

  const { pages, pathToPageMap } = await loadPages({
    sortedIds,
    routesMd: merged.routesMd,
    routesHtml: merged.routesHtml,
    routesVideo: merged.routesVideo,
    routesAudio: merged.routesAudio,
    languages,
    source,
    owner,
    repo,
  });

  const docs = pages
    .filter((p) => p.md)
    .map((p) => ({
      routeId: p.id,
      markdownByLanguage: p.md!.markdownByLanguage,
    }));

  return {
    config: effectiveConfig,
    docs,
    pages,
    pathToPageMap,
    showRepositorySearchHome,
    availableVersions,
    activeVersionId,
    activeVersion,
    activeRepository: {
      owner,
      repo,
      requested: isRepositoryRouteRequest,
      hasGitPageDocs,
      source,
    },
    availableLanguages: languages,
    layoutsConfig,
    themes,
  };
}
