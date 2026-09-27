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

interface LoadLayoutsOptions {
  isLocal: boolean;
  owner?: string;
  repo?: string;
  useOfficialLayouts?: boolean;
  officialLayoutsConfigPath?: string;
  officialLayoutsTemplatesPath?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
}

interface PreferredRemotePaths {
  layoutsPath: string | undefined;
  templatesPath: string | undefined;
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

/** With official layouts on, the official urls take precedence over the repository's own. */
function resolvePreferredRemotePaths(options: LoadLayoutsOptions): PreferredRemotePaths {
  if (options.useOfficialLayouts) {
    return {
      layoutsPath: options.officialLayoutsConfigPath || options.layoutsConfigPath,
      templatesPath: options.officialLayoutsTemplatesPath || options.layoutsConfigPathTemplates,
    };
  }
  return { layoutsPath: options.layoutsConfigPath, templatesPath: options.layoutsConfigPathTemplates };
}

/** Configured official url first, then every known official location. */
async function readOfficialLayouts(preferred: PreferredRemotePaths): Promise<ResolvedLayoutsSource | null> {
  const officialCandidates = Array.from(
    new Set([preferred.layoutsPath, ...OFFICIAL_LAYOUTS_CONFIG_URLS]),
  ).filter((candidate): candidate is string => Boolean(candidate));
  for (const configUrl of officialCandidates) {
    // A stale configured templates override must not misdirect templates
    // when the config was served by a fallback candidate instead.
    const templatesOverride = configUrl === preferred.layoutsPath ? preferred.templatesPath : undefined;
    const source = await readRemoteLayoutsByUrl(configUrl, templatesOverride);
    if (source) return source;
  }
  return null;
}

/** Remote runtime: configured url, then the repository's layouts folder, then the local workspace. */
async function readRemoteRuntimeLayouts(
  options: LoadLayoutsOptions,
  preferred: PreferredRemotePaths,
): Promise<ResolvedLayoutsSource | null> {
  if (preferred.layoutsPath) {
    const configured = await readRemoteLayoutsByUrl(preferred.layoutsPath, preferred.templatesPath);
    if (configured) return configured;
  }
  if (options.owner && options.repo) {
    const repoTemplatesOverride = options.useOfficialLayouts ? undefined : preferred.templatesPath;
    const fromRepo = await readRepoLayouts(options.owner, options.repo, repoTemplatesOverride);
    if (fromRepo) return fromRepo;
  }
  return readLocalLayouts();
}

async function resolveLayoutsSource(options: LoadLayoutsOptions): Promise<ResolvedLayoutsSource | null> {
  const preferred = resolvePreferredRemotePaths(options);
  if (options.useOfficialLayouts) {
    const official = await readOfficialLayouts(preferred);
    if (official) return official;
  }
  return options.isLocal ? readLocalLayouts() : readRemoteRuntimeLayouts(options, preferred);
}

async function loadThemes(source: ResolvedLayoutsSource, isLocal: boolean): Promise<Record<string, ThemeTemplate>> {
  const themes: Record<string, ThemeTemplate> = {};
  await Promise.all(
    source.layoutsConfig.layouts.map(async (layoutItem: LayoutItem) => {
      try {
        const template = await loadTemplate(layoutItem, source, isLocal);
        if (template) {
          themes[layoutItem.id] = template;
        }
      } catch {
        // Keep app resilient even if one template is missing.
      }
    }),
  );
  return themes;
}

export async function loadLayoutsAndThemes(options: LoadLayoutsOptions): Promise<{
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}> {
  const source = await resolveLayoutsSource(options);
  if (!source) {
    return buildFallbackLayoutsAndThemes();
  }
  return { layoutsConfig: source.layoutsConfig, themes: await loadThemes(source, options.isLocal) };
}
