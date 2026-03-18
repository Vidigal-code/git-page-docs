import { useMemo } from "react";
import {
  buildFooterConfigFromData,
  buildVersionLinkOptions,
  getBackgroundAudioConfig,
  getLanguageLabelFromMenu,
  getLangMenuLabelFromMenu,
  type LayoutItem,
  type LoadedDocsData,
  type LoadedPage,
  type VersionEntry,
} from "@/entities/docs";
import { getBasePath } from "@/shared/lib/base-path";
import {
  resolveAudioPlayerPopoverCloseIconConfig,
  resolveAudioPlayerPopoverLoopOffIconConfig,
  resolveAudioPlayerPopoverLoopOnIconConfig,
  resolveAudioPlayerPopoverPauseIconConfig,
  resolveAudioPlayerPopoverPlayIconConfig,
  resolveAudioPlayerPopoverRestartIconConfig,
  resolveHeaderIconConfig,
  resolveNavMenuOpenIconConfig,
  resolveNavMenuCloseIconConfig,
  resolveNavMenuMobileOpenIconConfig,
  resolveNavMenuMobileCloseIconConfig,
  resolveNavMenuBlockActiveIconConfig,
  resolveNavMenuBlockInactiveIconConfig,
} from "@/shared/lib/resolve-site-assets";

export interface DocsShellControlsConfig {
  fallbackProjectLink: string | undefined;
  projectLabel: string;
  useReactProjectLinkIcon: boolean;
  projectLinkReactIconTag: string | undefined;
  projectLinkReactIconStyle: React.CSSProperties;
  versionLinkOptionsWithLabels: { id: "branch" | "release" | "commit"; label: string; url: string }[];
  versionLinksLabel: string;
  useReactVersionLinksIcon: boolean;
  versionLinksIconTag: string | undefined;
  versionLinksIconStyle: React.CSSProperties;
  versionLinksIconImage: string | undefined;
  versionLinksIconImgWidth: number;
  versionLinksIconImgHeight: number;
  infoIconImgWidth: number;
  infoIconImgHeight: number;
  previewIconImgWidth: number;
  previewIconImgHeight: number;
  showInfoButton: boolean;
  updateDate: string;
  lastUpdateLabel: string;
  useReactInfoIcon: boolean;
  infoIconTag: string | undefined;
  infoIconStyle: React.CSSProperties;
  infoIconImage: string | undefined;
  showPreviewButton: boolean;
  previewProjectUrl: string;
  useReactPreviewIcon: boolean;
  previewIconTag: string | undefined;
  previewIconStyle: React.CSSProperties;
  previewIconImage: string | undefined;
  focusModeEnabled: boolean;
  focusModeLabel: string;
  activeNavigation: boolean;
  quickNavLabel: string;
  showVersionSelector: boolean;
  availableVersions: VersionEntry[];
  selectedVersionValue: string;
  versionLabel: string;
  isLanguageSelectVisible: boolean;
  availableLanguages: string[];
  language: string;
  languageLabelResolver: (lang: string) => string;
  hideThemeSelector: boolean;
  activeThemeId: string;
  layouts: LayoutItem[];
  canToggleMode: boolean;
  nextModeIsDark: boolean;
  darkModeLabel: string;
  lightModeLabel: string;
  showAudioPlayer: boolean;
  audioPlayerConfig: import("@/entities/docs").ResolvedBackgroundAudioConfig | null;
  useReactAudioPlayIcon: boolean;
  audioPlayIconTag: string | undefined;
  audioPlayIconStyle: React.CSSProperties;
  useReactAudioPauseIcon: boolean;
  audioPauseIconTag: string | undefined;
  audioPauseIconStyle: React.CSSProperties;
  audioPlayLabel: string;
  audioPauseLabel: string;
  audioPlaylistTitle: string;
  audioPlaylistDescription: string;
  audioPopoverCloseLabel: string;
  audioPopoverCloseIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverPlayIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverPauseIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverRestartIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverLoopOnIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverLoopOffIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverNowPlayingLabel: string;
  audioPopoverRestartLabel: string;
  audioPopoverLoopOnLabel: string;
  audioPopoverLoopOffLabel: string;
  audioPopoverSourceLabel: string;
  audioPopoverHideSource: boolean;
  audioPopoverSourceCustomLabel: Record<string, string> | undefined;
  audioPopoverShowMinutes: boolean;
  audioPopoverStatusPlayingLabel: string;
  audioPopoverStatusPausedLabel: string;
  audioPopoverStatusLoopOnLabel: string;
  audioPopoverStatusLoopOffLabel: string;
}

export interface NavMenuConfig {
  navMenuOpenIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  navMenuCloseIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  navMenuMobileOpenIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  navMenuMobileCloseIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  navMenuBlockActiveIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  navMenuBlockInactiveIcon: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  blockMenuOnNavLabelActive: string;
  blockMenuOnNavLabelInactive: string;
}

export function useDocsShellConfig(
  data: LoadedDocsData,
  activeLayout: { mode?: "dark" | "light" } | undefined,
  language: string,
  selectedVersionValue: string,
  activeThemeId: string,
  canToggleMode: boolean,
  nextModeIsDark: boolean,
  currentPage: LoadedPage | undefined,
) {
  const basePath = getBasePath();

  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, activeLayout?.mode ?? "dark", basePath),
    [data.config.site, activeLayout?.mode, basePath],
  );

  const versionLinkOptions = useMemo(() => buildVersionLinkOptions(data.activeVersion), [data.activeVersion]);
  const branchLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "branchLabel", "Branch");
  const releaseLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "releaseLabel", "Release");
  const commitLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "commitLabel", "Commit");

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
  const audioPlayerConfig = useMemo(
    () => getBackgroundAudioConfig(currentPage, site, language),
    [currentPage, site, language]
  );

  const controlsConfig: DocsShellControlsConfig = useMemo(
    () => ({
      fallbackProjectLink: data.activeVersion?.ProjectLink?.trim() || site.ProjectLink?.trim(),
      projectLabel: getLangMenuLabelFromMenu(site.langmenu, language, "projectLabel", "Project"),
      useReactProjectLinkIcon: Boolean(site.IconProjectLinkReactIcones),
      projectLinkReactIconTag: site.IconProjectLinkReactIconesTag,
      projectLinkReactIconStyle: {
        color: (mode === "dark" ? site.IconProjectLinkReactIconesTagColorDark : site.IconProjectLinkReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconProjectLinkReactIconesTagSize?.trim() || undefined,
      },
      versionLinkOptionsWithLabels,
      versionLinksLabel: getLangMenuLabelFromMenu(site.langmenu, language, "versionLinksLabel", "Repository links"),
      useReactVersionLinksIcon: Boolean(site.IconVersionLinksReactIcones),
      versionLinksIconTag: site.IconVersionLinksReactIconesTag,
      versionLinksIconStyle: {
        color: (mode === "dark" ? site.IconVersionLinksReactIconesTagColorDark : site.IconVersionLinksReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconVersionLinksReactIconesTagSize?.trim() || undefined,
      },
      versionLinksIconImage:
        (mode === "dark"
          ? site.IconVersionLinksDarkImg?.trim() || site.IconVersionLinksHeaderDark?.trim()
          : site.IconVersionLinksLightImg?.trim() || site.IconVersionLinksLight?.trim()) || undefined,
      versionLinksIconImgWidth: Number(site.IconVersionLinksImgWidth) || 20,
      versionLinksIconImgHeight: Number(site.IconVersionLinksImgHeight) || 20,
      infoIconImgWidth: Number(site.IconInfoHeaderMenuImgWidth) || 20,
      infoIconImgHeight: Number(site.IconInfoHeaderMenuImgHeight) || 20,
      previewIconImgWidth: Number(site.IconPreviewProjectLinkImgWidth) || 20,
      previewIconImgHeight: Number(site.IconPreviewProjectLinkImgHeight) || 20,
      showInfoButton: Boolean(data.activeVersion?.UpdateDate?.trim()),
      updateDate: data.activeVersion?.UpdateDate?.trim() ?? "",
      lastUpdateLabel: getLangMenuLabelFromMenu(site.langmenu, language, "lastUpdateVersionLabel", "Last update version"),
      useReactInfoIcon: Boolean(site.IconInfoHeaderMenuReactIcones),
      infoIconTag: site.IconInfoHeaderMenuReactIconesTag,
      infoIconStyle: {
        color: (mode === "dark" ? site.IconInfoHeaderMenuReactIconesTagColorDark : site.IconInfoHeaderMenuReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconInfoHeaderMenuReactIconesTagSize?.trim() || undefined,
      },
      infoIconImage:
        (mode === "dark"
          ? site.IconInfoHeaderMenuDarkImg?.trim() || site.IconInfoHeaderMenuHeaderDark?.trim()
          : site.IconInfoHeaderMenuLightImg?.trim() || site.IconInfoHeaderMenuLight?.trim()) || undefined,
      showPreviewButton: Boolean(data.activeVersion?.PreviewProject?.trim()),
      previewProjectUrl: data.activeVersion?.PreviewProject?.trim() ?? "",
      useReactPreviewIcon: Boolean(site.IconPreviewProjectLinkReactIcones),
      previewIconTag: site.IconPreviewProjectLinkReactIconesTag,
      previewIconStyle: {
        color: (mode === "dark" ? site.IconPreviewProjectLinkReactIconesTagColorDark : site.IconPreviewProjectLinkReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconPreviewProjectLinkReactIconesTagSize?.trim() || undefined,
      },
      previewIconImage:
        (mode === "dark"
          ? site.IconPreviewProjectLinkDarkImg?.trim() || site.IconPreviewProjectLinkHeaderDark?.trim()
          : site.IconPreviewProjectLinkLightImg?.trim() || site.IconPreviewProjectLinkLight?.trim()) || undefined,
      focusModeEnabled: Boolean(site.FocusMode),
      focusModeLabel: getLangMenuLabelFromMenu(site.langmenu, language, "focusMode", "Focus mode"),
      activeNavigation: Boolean(site.ActiveNavigation),
      quickNavLabel: getLangMenuLabelFromMenu(site.langmenu, language, "quickNavigation", "Ctrl+K"),
      showVersionSelector: data.availableVersions.length > 1,
      availableVersions: data.availableVersions,
      selectedVersionValue,
      versionLabel: getLangMenuLabelFromMenu(site.langmenu, language, "versionLabel", "Version"),
      isLanguageSelectVisible: data.availableLanguages.length > 1,
      availableLanguages: data.availableLanguages,
      language,
      languageLabelResolver: (lang: string) => getLanguageLabelFromMenu(site.langmenu, language, lang),
      hideThemeSelector: Boolean(site.HideThemeSelector),
      activeThemeId,
      layouts: data.layoutsConfig.layouts,
      canToggleMode,
      nextModeIsDark,
      darkModeLabel: getLangMenuLabelFromMenu(site.langmenu, language, "darkMode", "Dark mode"),
      lightModeLabel: getLangMenuLabelFromMenu(site.langmenu, language, "lightMode", "Light mode"),
      showAudioPlayer: Boolean(audioPlayerConfig),
      audioPlayerConfig,
      useReactAudioPlayIcon: Boolean(site.IconAudioPlayReactIcones),
      audioPlayIconTag: site.IconAudioPlayReactIconesTag,
      audioPlayIconStyle: {
        color: (mode === "dark" ? site.IconAudioPlayReactIconesTagColorDark : site.IconAudioPlayReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconAudioPlayReactIconesTagSize?.trim() || undefined,
      },
      useReactAudioPauseIcon: Boolean(site.IconAudioPauseReactIcones),
      audioPauseIconTag: site.IconAudioPauseReactIconesTag,
      audioPauseIconStyle: {
        color: (mode === "dark" ? site.IconAudioPauseReactIconesTagColorDark : site.IconAudioPauseReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconAudioPauseReactIconesTagSize?.trim() || undefined,
      },
      audioPlayLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPlayLabel", "Play background music"),
      audioPauseLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPauseLabel", "Pause background music"),
      audioPlaylistTitle: getLangMenuLabelFromMenu(site.langmenu, language, "audioPlaylistTitle", "Choose track"),
      audioPlaylistDescription: getLangMenuLabelFromMenu(site.langmenu, language, "audioPlaylistDescription", "Select a track to play from the playlist."),
      audioPopoverCloseLabel: getLangMenuLabelFromMenu(site.langmenu, language, "menuClose", "Close"),
      audioPopoverCloseIcon: resolveAudioPlayerPopoverCloseIconConfig(site, mode as "dark" | "light", basePath),
      audioPopoverPlayIcon: resolveAudioPlayerPopoverPlayIconConfig(site, mode as "dark" | "light", basePath),
      audioPopoverPauseIcon: resolveAudioPlayerPopoverPauseIconConfig(site, mode as "dark" | "light", basePath),
      audioPopoverRestartIcon: resolveAudioPlayerPopoverRestartIconConfig(site, mode as "dark" | "light", basePath),
      audioPopoverLoopOnIcon: resolveAudioPlayerPopoverLoopOnIconConfig(site, mode as "dark" | "light", basePath),
      audioPopoverLoopOffIcon: resolveAudioPlayerPopoverLoopOffIconConfig(site, mode as "dark" | "light", basePath),
      audioPopoverNowPlayingLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverNowPlaying", "Now playing"),
      audioPopoverRestartLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverRestart", "Restart"),
      audioPopoverLoopOnLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverLoopOn", "Loop on"),
      audioPopoverLoopOffLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverLoopOff", "Loop off"),
      audioPopoverSourceLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverSource", "File"),
      audioPopoverHideSource: Boolean(site.audioPopoverHideSource),
      audioPopoverSourceCustomLabel: site.audioPopoverSourceCustomLabel,
      audioPopoverShowMinutes: site.audioPopoverShowMinutes !== false,
      audioPopoverStatusPlayingLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverStatusPlaying", "Playing"),
      audioPopoverStatusPausedLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverStatusPaused", "Paused"),
      audioPopoverStatusLoopOnLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverStatusLoopOn", "Loop on"),
      audioPopoverStatusLoopOffLabel: getLangMenuLabelFromMenu(site.langmenu, language, "audioPopoverStatusLoopOff", "Loop off"),
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

  const footerConfig = useMemo(
    () => buildFooterConfigFromData(data, language),
    [data, language],
  );

  const navMenuConfig = useMemo((): NavMenuConfig => {
    const site = data.config.site;
    const mode = (activeLayout?.mode ?? "dark") as "dark" | "light";
    const basePath = getBasePath();
    return {
      navMenuOpenIcon: resolveNavMenuOpenIconConfig(site, mode, basePath),
      navMenuCloseIcon: resolveNavMenuCloseIconConfig(site, mode, basePath),
      navMenuMobileOpenIcon: resolveNavMenuMobileOpenIconConfig(site, mode, basePath),
      navMenuMobileCloseIcon: resolveNavMenuMobileCloseIconConfig(site, mode, basePath),
      navMenuBlockActiveIcon: resolveNavMenuBlockActiveIconConfig(site, mode, basePath),
      navMenuBlockInactiveIcon: resolveNavMenuBlockInactiveIconConfig(site, mode, basePath),
      blockMenuOnNavLabelActive: getLangMenuLabelFromMenu(site.langmenu, language, "blockMenuOnNavActive", "Block menu on navigation"),
      blockMenuOnNavLabelInactive: getLangMenuLabelFromMenu(site.langmenu, language, "blockMenuOnNavInactive", "Allow menu on navigation"),
    };
  }, [data.config.site, activeLayout?.mode, language]);

  return {
    headerIconConfig,
    controlsConfig,
    navMenuConfig,
    footerEnabled: data.config.site.FooterEnabled !== false,
    footerConfig,
  };
}
