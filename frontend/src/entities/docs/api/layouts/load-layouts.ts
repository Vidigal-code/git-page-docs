import path from "node:path";
import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";
import { ensureTrailingSlash, toRawGithubUrl } from "@/shared/lib/remote/github-url";
import type { LayoutItem, LayoutsConfig, ThemeTemplate } from "@/entities/docs/model/types";
import {
  LAYOUTS_CONFIG_FILENAME,
  LAYOUTS_DIR_CANDIDATES,
  OFFICIAL_LAYOUTS_CONFIG_URLS,
} from "@/shared/config/remote-urls";
import { tryReadJsonFile } from "../io/file-reader";
import { readRemoteJson, readRemoteJsonFromRepo, buildRepoRawBase } from "../io/remote-fetcher";
import { buildRemoteTemplateUrl, templatesBaseFromConfigUrl } from "./remote-template-urls";

interface ResolvedLayoutsSource {
  layoutsConfig: LayoutsConfig;
  /** Base URL for fetching templates when the config came from a remote source. */
  remoteTemplatesBaseUrl?: string;
  /** Repo-relative folder that held the config when it was read locally. */
  localTemplatesBasePath?: string;
}

function resolveTemplatesOverride(templatesPathOverride: string | undefined): string | undefined {
  return templatesPathOverride ? ensureTrailingSlash(toRawGithubUrl(templatesPathOverride)) : undefined;
}

async function readLocalLayouts(): Promise<ResolvedLayoutsSource | null> {
  for (const dir of LAYOUTS_DIR_CANDIDATES) {
    const config = await tryReadJsonFile<LayoutsConfig>(`${dir}${LAYOUTS_CONFIG_FILENAME}`);
    if (config?.layouts?.length) {
      return { layoutsConfig: config, localTemplatesBasePath: dir };
    }
  }
  return null;
}

async function readRemoteLayoutsByUrl(
  layoutsConfigUrl: string,
  templatesPathOverride: string | undefined,
): Promise<ResolvedLayoutsSource | null> {
  const remoteConfig = await readRemoteJson<LayoutsConfig>(layoutsConfigUrl);
  if (!remoteConfig?.layouts?.length) return null;
  return {
    layoutsConfig: remoteConfig,
    remoteTemplatesBaseUrl:
      resolveTemplatesOverride(templatesPathOverride) ?? templatesBaseFromConfigUrl(layoutsConfigUrl),
  };
}

async function readRepoLayouts(
  owner: string,
  repo: string,
  templatesPathOverride: string | undefined,
): Promise<ResolvedLayoutsSource | null> {
  for (const dir of LAYOUTS_DIR_CANDIDATES) {
    const config = await readRemoteJsonFromRepo<LayoutsConfig>(owner, repo, `${dir}${LAYOUTS_CONFIG_FILENAME}`);
    if (config?.layouts?.length) {
      return {
        layoutsConfig: config,
        remoteTemplatesBaseUrl:
          resolveTemplatesOverride(templatesPathOverride) ?? buildRepoRawBase(owner, repo, dir),
      };
    }
  }
  return null;
}

async function readLocalTemplate(
  layoutFile: string,
  preferredBasePath: string | undefined,
): Promise<ThemeTemplate | null> {
  const bases = preferredBasePath
    ? [preferredBasePath, ...LAYOUTS_DIR_CANDIDATES.filter((dir) => dir !== preferredBasePath)]
    : [...LAYOUTS_DIR_CANDIDATES];
  for (const base of bases) {
    const template = await tryReadJsonFile<ThemeTemplate>(path.join(base, layoutFile));
    if (template) return template;
  }
  return null;
}

async function loadTemplate(
  layoutItem: LayoutItem,
  source: ResolvedLayoutsSource,
  isLocal: boolean,
): Promise<ThemeTemplate | null> {
  const { remoteTemplatesBaseUrl, localTemplatesBasePath } = source;
  if (remoteTemplatesBaseUrl && !isLocal) {
    const templateUrl = buildRemoteTemplateUrl(layoutItem.file, remoteTemplatesBaseUrl);
    const remote = await readRemoteJson<ThemeTemplate>(templateUrl);
    if (remote) return remote;
  }

  const local = await readLocalTemplate(layoutItem.file, localTemplatesBasePath);
  if (local) return local;

  if (remoteTemplatesBaseUrl && !isLocal) {
    const templateUrl = buildRemoteTemplateUrl(layoutItem.file, remoteTemplatesBaseUrl);
    return readRemoteJson<ThemeTemplate>(templateUrl);
  }
  return null;
}

export async function loadLayoutsAndThemes(options: {
  isLocal: boolean;
  owner?: string;
  repo?: string;
  useOfficialLayouts?: boolean;
  officialLayoutsConfigPath?: string;
  officialLayoutsTemplatesPath?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
}): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  const preferredRemoteLayoutsPath = options.useOfficialLayouts
    ? options.officialLayoutsConfigPath || options.layoutsConfigPath
    : options.layoutsConfigPath;
  const preferredRemoteTemplatesPath = options.useOfficialLayouts
    ? options.officialLayoutsTemplatesPath || options.layoutsConfigPathTemplates
    : options.layoutsConfigPathTemplates;

  let source: ResolvedLayoutsSource | null = null;

  if (options.useOfficialLayouts) {
    const officialCandidates = Array.from(
      new Set([preferredRemoteLayoutsPath, ...OFFICIAL_LAYOUTS_CONFIG_URLS]),
    ).filter((candidate): candidate is string => Boolean(candidate));
    for (const configUrl of officialCandidates) {
      // A stale configured templates override must not misdirect templates
      // when the config was served by a fallback candidate instead.
      const templatesOverride = configUrl === preferredRemoteLayoutsPath ? preferredRemoteTemplatesPath : undefined;
      source = await readRemoteLayoutsByUrl(configUrl, templatesOverride);
      if (source) break;
    }
  }

  if (!source && options.isLocal) {
    source = await readLocalLayouts();
  } else if (!source) {
    if (preferredRemoteLayoutsPath) {
      source = await readRemoteLayoutsByUrl(preferredRemoteLayoutsPath, preferredRemoteTemplatesPath);
    }
    if (!source && options.owner && options.repo) {
      source = await readRepoLayouts(
        options.owner,
        options.repo,
        options.useOfficialLayouts ? undefined : preferredRemoteTemplatesPath,
      );
    }
    if (!source) {
      source = await readLocalLayouts();
    }
  }

  if (!source) {
    return buildFallbackLayoutsAndThemes();
  }

  const resolvedSource = source;
  const themes: Record<string, ThemeTemplate> = {};

  await Promise.all(
    resolvedSource.layoutsConfig.layouts.map(async (layoutItem: LayoutItem) => {
      try {
        const template = await loadTemplate(layoutItem, resolvedSource, options.isLocal);
        if (template) {
          themes[layoutItem.id] = template;
        }
      } catch {
        // Keep app resilient even if one template is missing.
      }
    }),
  );

  return { layoutsConfig: resolvedSource.layoutsConfig, themes };
}
