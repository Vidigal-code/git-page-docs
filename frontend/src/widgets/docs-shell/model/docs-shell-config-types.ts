import type { LanguageCode, LayoutItem, ResolvedBackgroundAudioConfig, VersionEntry, VersionLinkOption } from "@/entities/docs";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

/** Version selector and repository links config */
export interface DocsShellVersionConfig {
  versionLinkOptionsWithLabels: { id: "branch" | "release" | "commit"; label: string; url: string }[];
  versionLinksLabel: string;
  useReactVersionLinksIcon: boolean;
  versionLinksIconTag: string | undefined;
  versionLinksIconStyle: React.CSSProperties;
  versionLinksIconImage: string | undefined;
  versionLinksIconImgWidth: number;
  versionLinksIconImgHeight: number;
  showVersionSelector: boolean;
  availableVersions: VersionEntry[];
  selectedVersionValue: string;
  versionLabel: string;
  updateDate: string;
  lastUpdateLabel: string;
}

/** Header/project links config (info, preview, project) */
export interface DocsShellHeaderConfig {
  fallbackProjectLink: string | undefined;
  projectLabel: string;
  useReactProjectLinkIcon: boolean;
  projectLinkReactIconTag: string | undefined;
  projectLinkReactIconStyle: React.CSSProperties;
  infoIconImgWidth: number;
  infoIconImgHeight: number;
  previewIconImgWidth: number;
  previewIconImgHeight: number;
  showInfoButton: boolean;
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
}

/** Audio player and popover config */
export interface DocsShellAudioConfig {
  showAudioPlayer: boolean;
  audioPlayerConfig: ResolvedBackgroundAudioConfig | null;
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
  audioPopoverCloseIcon: ResolvedNavMenuIconConfig;
  audioPopoverPlayIcon: ResolvedNavMenuIconConfig;
  audioPopoverPauseIcon: ResolvedNavMenuIconConfig;
  audioPopoverRestartIcon: ResolvedNavMenuIconConfig;
  audioPopoverLoopOnIcon: ResolvedNavMenuIconConfig;
  audioPopoverLoopOffIcon: ResolvedNavMenuIconConfig;
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

/** Theme and navigation controls config */
export interface DocsShellThemeNavConfig {
  focusModeEnabled: boolean;
  focusModeLabel: string;
  activeNavigation: boolean;
  quickNavLabel: string;
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
}

/** Base controls props (header, version, theme, nav) */
export interface DocsShellControlsBaseProps {
  fallbackProjectLink: string | undefined;
  projectLabel: string;
  useReactProjectLinkIcon: boolean;
  projectLinkReactIconTag: string | undefined;
  projectLinkReactIconStyle: React.CSSProperties;
  versionLinkOptionsWithLabels: VersionLinkOption[];
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
  availableLanguages: LanguageCode[];
  language: LanguageCode;
  languageLabelResolver: (lang: LanguageCode) => string;
  hideThemeSelector: boolean;
  activeThemeId: string;
  layouts: LayoutItem[];
  canToggleMode: boolean;
  nextModeIsDark: boolean;
  darkModeLabel: string;
  lightModeLabel: string;
  onOpenVersionLinksPopup: () => void;
  onOpenInfoPopup: () => void;
  onOpenFocusMode: () => void;
  onOpenQuickNavigation: () => void;
  onVersionChange: (versionId: string) => void;
  onLanguageChange: (language: LanguageCode) => void;
  onThemeChange: (themeId: string) => void;
  onToggleMode: () => void;
}

/** Audio-related controls props */
export interface DocsShellControlsAudioProps {
  showAudioPlayer?: boolean;
  audioPlayerConfig?: ResolvedBackgroundAudioConfig | null;
  themeVarsStyle?: React.CSSProperties;
  audioPlayIconTag?: string;
  audioPlayIconStyle?: React.CSSProperties;
  audioPauseIconTag?: string;
  audioPauseIconStyle?: React.CSSProperties;
  audioPlayLabel?: string;
  audioPauseLabel?: string;
  audioPlaylistTitle?: string;
  audioPlaylistDescription?: string;
  audioPopoverCloseLabel?: string;
  audioPopoverCloseIcon?: ResolvedNavMenuIconConfig;
  audioPopoverPlayIcon?: ResolvedNavMenuIconConfig;
  audioPopoverPauseIcon?: ResolvedNavMenuIconConfig;
  audioPopoverRestartIcon?: ResolvedNavMenuIconConfig;
  audioPopoverLoopOnIcon?: ResolvedNavMenuIconConfig;
  audioPopoverLoopOffIcon?: ResolvedNavMenuIconConfig;
  audioPopoverNowPlayingLabel?: string;
  audioPopoverRestartLabel?: string;
  audioPopoverLoopOnLabel?: string;
  audioPopoverLoopOffLabel?: string;
  audioPopoverSourceLabel?: string;
  audioPopoverHideSource?: boolean;
  audioPopoverSourceCustomLabel?: Record<string, string>;
  audioPopoverShowMinutes?: boolean;
  audioPopoverStatusPlayingLabel?: string;
  audioPopoverStatusPausedLabel?: string;
  audioPopoverStatusLoopOnLabel?: string;
  audioPopoverStatusLoopOffLabel?: string;
}
