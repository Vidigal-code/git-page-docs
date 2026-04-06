import { useMemo } from "react";
import { buildFooterConfigFromData, type LoadedDocsData, type LoadedPage } from "@/entities/docs";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import { useBuildDocsControlsConfig } from "./use-build-docs-controls-config";
import { useBuildNavMenuConfig } from "./use-build-nav-menu-config";

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
  availableVersions: import("@/entities/docs").VersionEntry[];
  selectedVersionValue: string;
  versionLabel: string;
  isLanguageSelectVisible: boolean;
  availableLanguages: string[];
  language: string;
  languageLabelResolver: (lang: string) => string;
  hideThemeSelector: boolean;
  activeThemeId: string;
  layouts: import("@/entities/docs").LayoutItem[];
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
  const mode = (activeLayout?.mode ?? "dark") as "dark" | "light";

  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, mode, basePath),
    [data.config.site, mode, basePath],
  );

  const controlsConfig = useBuildDocsControlsConfig(
    data,
    activeLayout,
    language,
    selectedVersionValue,
    activeThemeId,
    canToggleMode,
    nextModeIsDark,
    currentPage,
  );

  const navMenuConfig = useBuildNavMenuConfig(data.config, mode, language);

  const footerConfig = useMemo(
    () => buildFooterConfigFromData(data, language),
    [data, language],
  );

  return {
    headerIconConfig,
    controlsConfig,
    navMenuConfig,
    footerEnabled: data.config.site.FooterEnabled !== false,
    footerConfig,
  };
}
