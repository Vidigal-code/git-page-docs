import { useMemo } from "react";
import {
  buildVersionLinkOptions,
  getBackgroundAudioConfig,
  getLanguageLabelFromMenu,
  getLangMenuLabelFromMenu,
  type LoadedDocsData,
  type LoadedPage,
} from "@/entities/docs";
import {
  resolveAudioPlayerPopoverCloseIconConfig,
  resolveAudioPlayerPopoverLoopOffIconConfig,
  resolveAudioPlayerPopoverLoopOnIconConfig,
  resolveAudioPlayerPopoverPauseIconConfig,
  resolveAudioPlayerPopoverPlayIconConfig,
  resolveAudioPlayerPopoverRestartIconConfig,
} from "@/shared/lib/resolve-site-assets";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveControlIcon } from "@/shared/lib/icons/resolve-control-icon";
import type { DocsShellControlsConfig } from "./use-docs-shell-config";

type ThemeMode = "dark" | "light";
type SiteConfig = LoadedDocsData["config"]["site"];

const DEFAULT_ICON_SIZE = 20;
const DEFAULT_ICON_TAGS = {
  projectLink: "FaGithubAlt",
  versionLinks: "FaCodeBranch",
  info: "BsInfoSquareFill",
  preview: "CiGlobe",
  audioPlay: "CiPlay1",
  audioPause: "FaPause",
} as const;

interface LabelOptions {
  key: string;
  fallback: string;
}

function getLabel(site: SiteConfig, language: string, { key, fallback }: LabelOptions): string {
  return getLangMenuLabelFromMenu(site.langmenu, language, key, fallback);
}

function trimToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function coerceIconSize(value: unknown): number {
  return Number(value) || DEFAULT_ICON_SIZE;
}

function getThemeValue(mode: ThemeMode, darkValue: string | undefined, lightValue: string | undefined): string | undefined {
  return trimToUndefined(mode === "dark" ? darkValue : lightValue);
}

function getFirstThemeImage(
  mode: ThemeMode,
  darkValues: Array<string | undefined>,
  lightValues: Array<string | undefined>,
): string | undefined {
  const values = mode === "dark" ? darkValues : lightValues;
  for (const value of values) {
    const image = trimToUndefined(value);
    if (image) return image;
  }
  return undefined;
}

interface IconStyleOptions {
  darkColor?: string;
  lightColor?: string;
  size?: string;
}

function getReactIconStyle(mode: ThemeMode, { darkColor, lightColor, size }: IconStyleOptions): { color?: string; fontSize?: string } {
  return {
    color: getThemeValue(mode, darkColor, lightColor),
    fontSize: trimToUndefined(size),
  };
}

export interface UseBuildDocsControlsConfigArgs {
  data: LoadedDocsData;
  activeLayout: { mode?: ThemeMode } | undefined;
  language: string;
  selectedVersionValue: string;
  activeThemeId: string;
  canToggleMode: boolean;
  nextModeIsDark: boolean;
  currentPage: LoadedPage | undefined;
  /** Whether the current page has markdown in the active language (gates focus mode). */
  pageHasMarkdown: boolean;
}

export function useBuildDocsControlsConfig({
  data,
  activeLayout,
  language,
  selectedVersionValue,
  activeThemeId,
  canToggleMode,
  nextModeIsDark,
  currentPage,
  pageHasMarkdown,
}: UseBuildDocsControlsConfigArgs): DocsShellControlsConfig {
  const versionLinkOptions = useMemo(() => buildVersionLinkOptions(data.activeVersion), [data.activeVersion]);
  const branchLabel = getLabel(data.config.site, language, { key: "branchLabel", fallback: "Branch" });
  const releaseLabel = getLabel(data.config.site, language, { key: "releaseLabel", fallback: "Release" });
  const commitLabel = getLabel(data.config.site, language, { key: "commitLabel", fallback: "Commit" });

  const versionLinkOptionsWithLabels = useMemo(() => {
    const labels = { branch: branchLabel, release: releaseLabel, commit: commitLabel };
    return versionLinkOptions.map((option) => ({ ...option, label: labels[option.id] }));
  }, [versionLinkOptions, branchLabel, releaseLabel, commitLabel]);

  const mode = activeLayout?.mode ?? "dark";
  const site = data.config.site;
  const basePath = getBasePath();

  const audioPlayerConfig = useMemo(
    () => getBackgroundAudioConfig(currentPage, site, language),
    [currentPage, site, language],
  );

  return useMemo(
    () => ({
      fallbackProjectLink: trimToUndefined(data.activeVersion?.ProjectLink) || trimToUndefined(site.ProjectLink),
      projectLabel: getLabel(site, language, { key: "projectLabel", fallback: "Project" }),
      useReactProjectLinkIcon: Boolean(site.IconProjectLinkReactIcones),
      projectLinkReactIconTag: site.IconProjectLinkReactIconesTag || DEFAULT_ICON_TAGS.projectLink,
      projectLinkReactIconStyle: getReactIconStyle(mode, {
        darkColor: site.IconProjectLinkReactIconesTagColorDark,
        lightColor: site.IconProjectLinkReactIconesTagColorLight,
        size: site.IconProjectLinkReactIconesTagSize,
      }),
      versionLinkOptionsWithLabels,
      versionLinksLabel: getLabel(site, language, { key: "versionLinksLabel", fallback: "Repository links" }),
      useReactVersionLinksIcon: Boolean(site.IconVersionLinksReactIcones),
      versionLinksIconTag: site.IconVersionLinksReactIconesTag || DEFAULT_ICON_TAGS.versionLinks,
      versionLinksIconStyle: getReactIconStyle(mode, {
        darkColor: site.IconVersionLinksReactIconesTagColorDark,
        lightColor: site.IconVersionLinksReactIconesTagColorLight,
        size: site.IconVersionLinksReactIconesTagSize,
      }),
      versionLinksIconImage: getFirstThemeImage(
        mode,
        [site.IconVersionLinksDarkImg, site.IconVersionLinksHeaderDark],
        [site.IconVersionLinksLightImg, site.IconVersionLinksLight],
      ),
      versionLinksIconImgWidth: coerceIconSize(site.IconVersionLinksImgWidth),
      versionLinksIconImgHeight: coerceIconSize(site.IconVersionLinksImgHeight),
      infoIconImgWidth: coerceIconSize(site.IconInfoHeaderMenuImgWidth),
      infoIconImgHeight: coerceIconSize(site.IconInfoHeaderMenuImgHeight),
      previewIconImgWidth: coerceIconSize(site.IconPreviewProjectLinkImgWidth),
      previewIconImgHeight: coerceIconSize(site.IconPreviewProjectLinkImgHeight),
      showInfoButton: Boolean(trimToUndefined(data.activeVersion?.UpdateDate)),
      updateDate: trimToUndefined(data.activeVersion?.UpdateDate) ?? "",
      lastUpdateLabel: getLabel(site, language, { key: "lastUpdateVersionLabel", fallback: "Last update version" }),
      useReactInfoIcon: Boolean(site.IconInfoHeaderMenuReactIcones),
      infoIconTag: site.IconInfoHeaderMenuReactIconesTag || DEFAULT_ICON_TAGS.info,
      infoIconStyle: getReactIconStyle(mode, {
        darkColor: site.IconInfoHeaderMenuReactIconesTagColorDark,
        lightColor: site.IconInfoHeaderMenuReactIconesTagColorLight,
        size: site.IconInfoHeaderMenuReactIconesTagSize,
      }),
      infoIconImage: getFirstThemeImage(
        mode,
        [site.IconInfoHeaderMenuDarkImg, site.IconInfoHeaderMenuHeaderDark],
        [site.IconInfoHeaderMenuLightImg, site.IconInfoHeaderMenuLight],
      ),
      showPreviewButton: Boolean(trimToUndefined(data.activeVersion?.PreviewProject)),
      previewProjectUrl: trimToUndefined(data.activeVersion?.PreviewProject) ?? "",
      useReactPreviewIcon: Boolean(site.IconPreviewProjectLinkReactIcones),
      previewIconTag: site.IconPreviewProjectLinkReactIconesTag || DEFAULT_ICON_TAGS.preview,
      previewIconStyle: getReactIconStyle(mode, {
        darkColor: site.IconPreviewProjectLinkReactIconesTagColorDark,
        lightColor: site.IconPreviewProjectLinkReactIconesTagColorLight,
        size: site.IconPreviewProjectLinkReactIconesTagSize,
      }),
      previewIconImage: getFirstThemeImage(
        mode,
        [site.IconPreviewProjectLinkDarkImg, site.IconPreviewProjectLinkHeaderDark],
        [site.IconPreviewProjectLinkLightImg, site.IconPreviewProjectLinkLight],
      ),
      // Focus mode paginates the page's markdown, so it stays hidden on routes
      // that have none (source-viewer, media-only, untranslated document).
      focusModeEnabled: Boolean(site.FocusMode) && pageHasMarkdown,
      focusModeLabel: getLabel(site, language, { key: "focusMode", fallback: "Focus mode" }),
      focusModeIcon: resolveControlIcon(site, { name: "FocusMode", mode }),
      activeNavigation: Boolean(site.ActiveNavigation),
      quickNavLabel: getLabel(site, language, { key: "quickNavigation", fallback: "Ctrl+K" }),
      quickNavigationIcon: resolveControlIcon(site, { name: "QuickNavigation", mode }),
      showVersionSelector: data.availableVersions.length > 1,
      availableVersions: data.availableVersions,
      selectedVersionValue,
      versionLabel: getLabel(site, language, { key: "versionLabel", fallback: "Version" }),
      versionSelectorIcon: resolveControlIcon(site, { name: "VersionSelector", mode }),
      isLanguageSelectVisible: data.availableLanguages.length > 1,
      availableLanguages: data.availableLanguages,
      language,
      languageLabelResolver: (lang: string) => getLanguageLabelFromMenu(site.langmenu, language, lang),
      languageSelectorIcon: resolveControlIcon(site, { name: "LanguageSelector", mode }),
      hideThemeSelector: Boolean(site.HideThemeSelector),
      themeSelectorIcon: resolveControlIcon(site, { name: "ThemeSelector", mode }),
      activeThemeId,
      layouts: data.layoutsConfig.layouts,
      canToggleMode,
      nextModeIsDark,
      darkModeLabel: getLabel(site, language, { key: "darkMode", fallback: "Dark mode" }),
      lightModeLabel: getLabel(site, language, { key: "lightMode", fallback: "Light mode" }),
      showAudioPlayer: Boolean(audioPlayerConfig),
      audioPlayerConfig,
      useReactAudioPlayIcon: Boolean(site.IconAudioPlayReactIcones),
      audioPlayIconTag: site.IconAudioPlayReactIconesTag || DEFAULT_ICON_TAGS.audioPlay,
      audioPlayIconStyle: getReactIconStyle(mode, {
        darkColor: site.IconAudioPlayReactIconesTagColorDark,
        lightColor: site.IconAudioPlayReactIconesTagColorLight,
        size: site.IconAudioPlayReactIconesTagSize,
      }),
      useReactAudioPauseIcon: Boolean(site.IconAudioPauseReactIcones),
      audioPauseIconTag: site.IconAudioPauseReactIconesTag || DEFAULT_ICON_TAGS.audioPause,
      audioPauseIconStyle: getReactIconStyle(mode, {
        darkColor: site.IconAudioPauseReactIconesTagColorDark,
        lightColor: site.IconAudioPauseReactIconesTagColorLight,
        size: site.IconAudioPauseReactIconesTagSize,
      }),
      audioPlayLabel: getLabel(site, language, { key: "audioPlayLabel", fallback: "Play background music" }),
      audioPauseLabel: getLabel(site, language, { key: "audioPauseLabel", fallback: "Pause background music" }),
      audioPlaylistTitle: getLabel(site, language, { key: "audioPlaylistTitle", fallback: "Choose track" }),
      audioPlaylistDescription: getLabel(site, language, { key: "audioPlaylistDescription", fallback: "Select a track to play from the playlist." }),
      audioPopoverCloseLabel: getLabel(site, language, { key: "menuClose", fallback: "Close" }),
      audioPopoverCloseIcon: resolveAudioPlayerPopoverCloseIconConfig(site, mode, basePath),
      audioPopoverPlayIcon: resolveAudioPlayerPopoverPlayIconConfig(site, mode, basePath),
      audioPopoverPauseIcon: resolveAudioPlayerPopoverPauseIconConfig(site, mode, basePath),
      audioPopoverRestartIcon: resolveAudioPlayerPopoverRestartIconConfig(site, mode, basePath),
      audioPopoverLoopOnIcon: resolveAudioPlayerPopoverLoopOnIconConfig(site, mode, basePath),
      audioPopoverLoopOffIcon: resolveAudioPlayerPopoverLoopOffIconConfig(site, mode, basePath),
      audioPopoverNowPlayingLabel: getLabel(site, language, { key: "audioPopoverNowPlaying", fallback: "Now playing" }),
      audioPopoverRestartLabel: getLabel(site, language, { key: "audioPopoverRestart", fallback: "Restart" }),
      audioPopoverLoopOnLabel: getLabel(site, language, { key: "audioPopoverLoopOn", fallback: "Loop on" }),
      audioPopoverLoopOffLabel: getLabel(site, language, { key: "audioPopoverLoopOff", fallback: "Loop off" }),
      audioPopoverSourceLabel: getLabel(site, language, { key: "audioPopoverSource", fallback: "File" }),
      audioPopoverHideSource: Boolean(site.audioPopoverHideSource),
      audioPopoverSourceCustomLabel: site.audioPopoverSourceCustomLabel,
      audioPopoverShowMinutes: site.audioPopoverShowMinutes !== false,
      audioPopoverStatusPlayingLabel: getLabel(site, language, { key: "audioPopoverStatusPlaying", fallback: "Playing" }),
      audioPopoverStatusPausedLabel: getLabel(site, language, { key: "audioPopoverStatusPaused", fallback: "Paused" }),
      audioPopoverStatusLoopOnLabel: getLabel(site, language, { key: "audioPopoverStatusLoopOn", fallback: "Loop on" }),
      audioPopoverStatusLoopOffLabel: getLabel(site, language, { key: "audioPopoverStatusLoopOff", fallback: "Loop off" }),
    }),
    [
      data.activeVersion,
      data.availableVersions,
      data.availableLanguages,
      data.layoutsConfig.layouts,
      site,
      language,
      mode,
      versionLinkOptionsWithLabels,
      selectedVersionValue,
      activeThemeId,
      canToggleMode,
      nextModeIsDark,
      audioPlayerConfig,
      basePath,
      pageHasMarkdown,
    ],
  );
}
