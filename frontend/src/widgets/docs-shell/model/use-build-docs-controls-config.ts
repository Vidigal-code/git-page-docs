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

function getLabel(site: SiteConfig, language: string, key: string, fallback: string): string {
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

function getReactIconStyle(
  mode: ThemeMode,
  darkColor: string | undefined,
  lightColor: string | undefined,
  size: string | undefined,
): { color?: string; fontSize?: string } {
  return {
    color: getThemeValue(mode, darkColor, lightColor),
    fontSize: trimToUndefined(size),
  };
}

export function useBuildDocsControlsConfig(
  data: LoadedDocsData,
  activeLayout: { mode?: ThemeMode } | undefined,
  language: string,
  selectedVersionValue: string,
  activeThemeId: string,
  canToggleMode: boolean,
  nextModeIsDark: boolean,
  currentPage: LoadedPage | undefined,
): DocsShellControlsConfig {
  const versionLinkOptions = useMemo(() => buildVersionLinkOptions(data.activeVersion), [data.activeVersion]);
  const branchLabel = getLabel(data.config.site, language, "branchLabel", "Branch");
  const releaseLabel = getLabel(data.config.site, language, "releaseLabel", "Release");
  const commitLabel = getLabel(data.config.site, language, "commitLabel", "Commit");

  const versionLinkOptionsWithLabels = useMemo(
    () =>
      versionLinkOptions.map((option) => ({
        ...option,
        label: option.id === "branch" ? branchLabel : option.id === "release" ? releaseLabel : commitLabel,
      })),
    [versionLinkOptions, branchLabel, releaseLabel, commitLabel],
  );

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
      projectLabel: getLabel(site, language, "projectLabel", "Project"),
      useReactProjectLinkIcon: Boolean(site.IconProjectLinkReactIcones),
      projectLinkReactIconTag: site.IconProjectLinkReactIconesTag || DEFAULT_ICON_TAGS.projectLink,
      projectLinkReactIconStyle: getReactIconStyle(
        mode,
        site.IconProjectLinkReactIconesTagColorDark,
        site.IconProjectLinkReactIconesTagColorLight,
        site.IconProjectLinkReactIconesTagSize,
      ),
      versionLinkOptionsWithLabels,
      versionLinksLabel: getLabel(site, language, "versionLinksLabel", "Repository links"),
      useReactVersionLinksIcon: Boolean(site.IconVersionLinksReactIcones),
      versionLinksIconTag: site.IconVersionLinksReactIconesTag || DEFAULT_ICON_TAGS.versionLinks,
      versionLinksIconStyle: getReactIconStyle(
        mode,
        site.IconVersionLinksReactIconesTagColorDark,
        site.IconVersionLinksReactIconesTagColorLight,
        site.IconVersionLinksReactIconesTagSize,
      ),
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
      lastUpdateLabel: getLabel(site, language, "lastUpdateVersionLabel", "Last update version"),
      useReactInfoIcon: Boolean(site.IconInfoHeaderMenuReactIcones),
      infoIconTag: site.IconInfoHeaderMenuReactIconesTag || DEFAULT_ICON_TAGS.info,
      infoIconStyle: getReactIconStyle(
        mode,
        site.IconInfoHeaderMenuReactIconesTagColorDark,
        site.IconInfoHeaderMenuReactIconesTagColorLight,
        site.IconInfoHeaderMenuReactIconesTagSize,
      ),
      infoIconImage: getFirstThemeImage(
        mode,
        [site.IconInfoHeaderMenuDarkImg, site.IconInfoHeaderMenuHeaderDark],
        [site.IconInfoHeaderMenuLightImg, site.IconInfoHeaderMenuLight],
      ),
      showPreviewButton: Boolean(trimToUndefined(data.activeVersion?.PreviewProject)),
      previewProjectUrl: trimToUndefined(data.activeVersion?.PreviewProject) ?? "",
      useReactPreviewIcon: Boolean(site.IconPreviewProjectLinkReactIcones),
      previewIconTag: site.IconPreviewProjectLinkReactIconesTag || DEFAULT_ICON_TAGS.preview,
      previewIconStyle: getReactIconStyle(
        mode,
        site.IconPreviewProjectLinkReactIconesTagColorDark,
        site.IconPreviewProjectLinkReactIconesTagColorLight,
        site.IconPreviewProjectLinkReactIconesTagSize,
      ),
      previewIconImage: getFirstThemeImage(
        mode,
        [site.IconPreviewProjectLinkDarkImg, site.IconPreviewProjectLinkHeaderDark],
        [site.IconPreviewProjectLinkLightImg, site.IconPreviewProjectLinkLight],
      ),
      focusModeEnabled: Boolean(site.FocusMode),
      focusModeLabel: getLabel(site, language, "focusMode", "Focus mode"),
      activeNavigation: Boolean(site.ActiveNavigation),
      quickNavLabel: getLabel(site, language, "quickNavigation", "Ctrl+K"),
      showVersionSelector: data.availableVersions.length > 1,
      availableVersions: data.availableVersions,
      selectedVersionValue,
      versionLabel: getLabel(site, language, "versionLabel", "Version"),
      isLanguageSelectVisible: data.availableLanguages.length > 1,
      availableLanguages: data.availableLanguages,
      language,
      languageLabelResolver: (lang: string) => getLanguageLabelFromMenu(site.langmenu, language, lang),
      hideThemeSelector: Boolean(site.HideThemeSelector),
      activeThemeId,
      layouts: data.layoutsConfig.layouts,
      canToggleMode,
      nextModeIsDark,
      darkModeLabel: getLabel(site, language, "darkMode", "Dark mode"),
      lightModeLabel: getLabel(site, language, "lightMode", "Light mode"),
      showAudioPlayer: Boolean(audioPlayerConfig),
      audioPlayerConfig,
      useReactAudioPlayIcon: Boolean(site.IconAudioPlayReactIcones),
      audioPlayIconTag: site.IconAudioPlayReactIconesTag || DEFAULT_ICON_TAGS.audioPlay,
      audioPlayIconStyle: getReactIconStyle(
        mode,
        site.IconAudioPlayReactIconesTagColorDark,
        site.IconAudioPlayReactIconesTagColorLight,
        site.IconAudioPlayReactIconesTagSize,
      ),
      useReactAudioPauseIcon: Boolean(site.IconAudioPauseReactIcones),
      audioPauseIconTag: site.IconAudioPauseReactIconesTag || DEFAULT_ICON_TAGS.audioPause,
      audioPauseIconStyle: getReactIconStyle(
        mode,
        site.IconAudioPauseReactIconesTagColorDark,
        site.IconAudioPauseReactIconesTagColorLight,
        site.IconAudioPauseReactIconesTagSize,
      ),
      audioPlayLabel: getLabel(site, language, "audioPlayLabel", "Play background music"),
      audioPauseLabel: getLabel(site, language, "audioPauseLabel", "Pause background music"),
      audioPlaylistTitle: getLabel(site, language, "audioPlaylistTitle", "Choose track"),
      audioPlaylistDescription: getLabel(site, language, "audioPlaylistDescription", "Select a track to play from the playlist."),
      audioPopoverCloseLabel: getLabel(site, language, "menuClose", "Close"),
      audioPopoverCloseIcon: resolveAudioPlayerPopoverCloseIconConfig(site, mode, basePath),
      audioPopoverPlayIcon: resolveAudioPlayerPopoverPlayIconConfig(site, mode, basePath),
      audioPopoverPauseIcon: resolveAudioPlayerPopoverPauseIconConfig(site, mode, basePath),
      audioPopoverRestartIcon: resolveAudioPlayerPopoverRestartIconConfig(site, mode, basePath),
      audioPopoverLoopOnIcon: resolveAudioPlayerPopoverLoopOnIconConfig(site, mode, basePath),
      audioPopoverLoopOffIcon: resolveAudioPlayerPopoverLoopOffIconConfig(site, mode, basePath),
      audioPopoverNowPlayingLabel: getLabel(site, language, "audioPopoverNowPlaying", "Now playing"),
      audioPopoverRestartLabel: getLabel(site, language, "audioPopoverRestart", "Restart"),
      audioPopoverLoopOnLabel: getLabel(site, language, "audioPopoverLoopOn", "Loop on"),
      audioPopoverLoopOffLabel: getLabel(site, language, "audioPopoverLoopOff", "Loop off"),
      audioPopoverSourceLabel: getLabel(site, language, "audioPopoverSource", "File"),
      audioPopoverHideSource: Boolean(site.audioPopoverHideSource),
      audioPopoverSourceCustomLabel: site.audioPopoverSourceCustomLabel,
      audioPopoverShowMinutes: site.audioPopoverShowMinutes !== false,
      audioPopoverStatusPlayingLabel: getLabel(site, language, "audioPopoverStatusPlaying", "Playing"),
      audioPopoverStatusPausedLabel: getLabel(site, language, "audioPopoverStatusPaused", "Paused"),
      audioPopoverStatusLoopOnLabel: getLabel(site, language, "audioPopoverStatusLoopOn", "Loop on"),
      audioPopoverStatusLoopOffLabel: getLabel(site, language, "audioPopoverStatusLoopOff", "Loop off"),
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
    ],
  );
}
