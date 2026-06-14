import path from "node:path";
import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";
import { ensureTrailingSlash, toRawGithubUrl } from "@/entities/docs/lib/remote/github-url";
import type { LayoutItem, LayoutsConfig, ThemeTemplate } from "@/entities/docs/model/types";
import { tryReadJsonFile } from "../io/file-reader";
import { readRemoteJson, readRemoteJsonFromRepo, buildRepoRawBase } from "../io/remote-fetcher";

const DEFAULT_LAYOUTS_PATH = "gitpagedocs/layouts/layoutsConfig.json";
const DEFAULT_TEMPLATES_BASE_PATH = "gitpagedocs/layouts/";

function deriveRemoteTemplatesBaseUrl(
  layoutsConfigPath: string | undefined,
  templatesPathOverride: string | undefined,
  owner: string | undefined,
  repo: string | undefined,
): string | undefined {
  if (templatesPathOverride) {
    return ensureTrailingSlash(toRawGithubUrl(templatesPathOverride));
  }

  if (layoutsConfigPath) {
    const rawUrl = toRawGithubUrl(layoutsConfigPath);
    return ensureTrailingSlash(rawUrl.slice(0, rawUrl.lastIndexOf("/") + 1));
  }

  if (owner && repo) {
    return buildRepoRawBase(owner, repo, DEFAULT_TEMPLATES_BASE_PATH);
  }

  return undefined;
}

function buildRemoteTemplateUrl(layoutFile: string, remoteTemplatesBaseUrl: string): string {
  const normalizedBase = ensureTrailingSlash(remoteTemplatesBaseUrl);
  const basePath = new URL(normalizedBase).pathname;
  const baseEndsWithTemplates = /\/templates\/$/i.test(basePath);
  const normalizedFile = layoutFile.replace(/^\.\//, "");
  const fileWithoutTemplatesPrefix = normalizedFile.replace(/^templates\//i, "");
  const filePath = baseEndsWithTemplates ? fileWithoutTemplatesPrefix : normalizedFile;
  return new URL(filePath, normalizedBase).toString();
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
  let layoutsConfig: LayoutsConfig | null = null;
  let remoteTemplatesBaseUrl: string | undefined;
  const preferredRemoteLayoutsPath = options.useOfficialLayouts
    ? options.officialLayoutsConfigPath || options.layoutsConfigPath
    : options.layoutsConfigPath;
  const preferredRemoteTemplatesPath = options.useOfficialLayouts
    ? options.officialLayoutsTemplatesPath || options.layoutsConfigPathTemplates
    : options.layoutsConfigPathTemplates;

  if (options.useOfficialLayouts && preferredRemoteLayoutsPath) {
    const remoteConfig = await readRemoteJson<LayoutsConfig>(preferredRemoteLayoutsPath);
    if (remoteConfig?.layouts?.length) {
      layoutsConfig = remoteConfig;
      remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
        preferredRemoteLayoutsPath,
        preferredRemoteTemplatesPath,
        options.owner,
        options.repo,
      );
    }
  }

  if (!layoutsConfig && options.isLocal) {
    layoutsConfig = await tryReadJsonFile<LayoutsConfig>(DEFAULT_LAYOUTS_PATH);
  } else if (!layoutsConfig) {
    if (preferredRemoteLayoutsPath) {
      const remoteConfig = await readRemoteJson<LayoutsConfig>(preferredRemoteLayoutsPath);
      if (remoteConfig?.layouts?.length) {
        layoutsConfig = remoteConfig;
        remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
          preferredRemoteLayoutsPath,
          preferredRemoteTemplatesPath,
          options.owner,
          options.repo,
        );
      }
    }

    if (!layoutsConfig && options.owner && options.repo) {
      const repoLayouts = await readRemoteJsonFromRepo<LayoutsConfig>(options.owner, options.repo, DEFAULT_LAYOUTS_PATH);
      if (repoLayouts?.layouts?.length) {
        layoutsConfig = repoLayouts;
        remoteTemplatesBaseUrl = deriveRemoteTemplatesBaseUrl(
          undefined,
          preferredRemoteTemplatesPath,
          options.owner,
          options.repo,
        );
      }
    }

    if (!layoutsConfig?.layouts?.length) {
      layoutsConfig = await tryReadJsonFile<LayoutsConfig>(DEFAULT_LAYOUTS_PATH);
    }
  }

  if (!layoutsConfig?.layouts?.length) {
    return buildFallbackLayoutsAndThemes();
  }

  const themes: Record<string, ThemeTemplate> = {};

  await Promise.all(
    layoutsConfig.layouts.map(async (layoutItem: LayoutItem) => {
      try {
        let template: ThemeTemplate | null = null;

        if (remoteTemplatesBaseUrl && !options.isLocal) {
          const templateUrl = buildRemoteTemplateUrl(layoutItem.file, remoteTemplatesBaseUrl);
          template = await readRemoteJson<ThemeTemplate>(templateUrl);
        }

        if (!template) {
          const templatePath = path.join("gitpagedocs/layouts", layoutItem.file);
          template = await tryReadJsonFile<ThemeTemplate>(templatePath);
        }

        if (!template && remoteTemplatesBaseUrl && !options.isLocal) {
          const templateUrl = buildRemoteTemplateUrl(layoutItem.file, remoteTemplatesBaseUrl);
          template = await readRemoteJson<ThemeTemplate>(templateUrl);
        }

        if (!template) {
          return;
        }

        themes[layoutItem.id] = template;
      } catch {
        // Keep app resilient even if one template is missing.
      }
    }),
  );

  return { layoutsConfig, themes };
}
