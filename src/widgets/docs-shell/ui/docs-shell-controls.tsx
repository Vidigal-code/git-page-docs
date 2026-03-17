import type { ResolvedBackgroundAudioConfig } from "@/entities/docs/lib/audio";
import { DocsShellControlsAudio } from "./docs-shell-controls-audio";
import { DocsShellControlsIcons } from "./docs-shell-controls-icons";
import { LanguageSelector } from "@/features/language-selector";
import { QuickNavigationTrigger } from "@/features/quick-navigation";
import { ThemeModeToggle } from "@/features/theme-switcher";
import { VersionSelector } from "@/features/version-selector";
import type { VersionLinkOption } from "@/entities/docs/lib/version-links";
import type { LanguageCode, LayoutItem, VersionEntry } from "@/entities/docs/model/types";
import styles from "../docs-shell.module.css";

export interface DocsShellControlsProps {
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
  audioPopoverCloseIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverPlayIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverPauseIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverRestartIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverLoopOnIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
  audioPopoverLoopOffIcon?: import("@/shared/lib/resolve-nav-menu-icon").ResolvedNavMenuIconConfig;
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
  onOpenVersionLinksPopup: () => void;
  onOpenInfoPopup: () => void;
  onOpenFocusMode: () => void;
  onOpenQuickNavigation: () => void;
  onVersionChange: (versionId: string) => void;
  onLanguageChange: (language: LanguageCode) => void;
  onThemeChange: (themeId: string) => void;
  onToggleMode: () => void;
}

export function DocsShellControls({
  fallbackProjectLink,
  projectLabel,
  useReactProjectLinkIcon,
  projectLinkReactIconTag,
  projectLinkReactIconStyle,
  versionLinkOptionsWithLabels,
  versionLinksLabel,
  useReactVersionLinksIcon,
  versionLinksIconTag,
  versionLinksIconStyle,
  versionLinksIconImage,
  versionLinksIconImgWidth,
  versionLinksIconImgHeight,
  infoIconImgWidth,
  infoIconImgHeight,
  previewIconImgWidth,
  previewIconImgHeight,
  showInfoButton,
  updateDate,
  lastUpdateLabel,
  useReactInfoIcon,
  infoIconTag,
  infoIconStyle,
  infoIconImage,
  showPreviewButton,
  previewProjectUrl,
  useReactPreviewIcon,
  previewIconTag,
  previewIconStyle,
  previewIconImage,
  focusModeEnabled,
  focusModeLabel,
  activeNavigation,
  quickNavLabel,
  showVersionSelector,
  availableVersions,
  selectedVersionValue,
  versionLabel,
  isLanguageSelectVisible,
  availableLanguages,
  language,
  languageLabelResolver,
  hideThemeSelector,
  activeThemeId,
  layouts,
  canToggleMode,
  nextModeIsDark,
  darkModeLabel,
  lightModeLabel,
  showAudioPlayer,
  audioPlayerConfig,
  themeVarsStyle,
  audioPlayIconTag,
  audioPlayIconStyle,
  audioPauseIconTag,
  audioPauseIconStyle,
  audioPlayLabel,
  audioPauseLabel,
  audioPlaylistTitle,
  audioPlaylistDescription,
  audioPopoverCloseLabel,
  audioPopoverCloseIcon,
  audioPopoverPlayIcon,
  audioPopoverPauseIcon,
  audioPopoverRestartIcon,
  audioPopoverLoopOnIcon,
  audioPopoverLoopOffIcon,
  audioPopoverNowPlayingLabel,
  audioPopoverRestartLabel,
  audioPopoverLoopOnLabel,
  audioPopoverLoopOffLabel,
  audioPopoverSourceLabel,
  audioPopoverHideSource,
  audioPopoverSourceCustomLabel,
  audioPopoverShowMinutes,
  audioPopoverStatusPlayingLabel,
  audioPopoverStatusPausedLabel,
  audioPopoverStatusLoopOnLabel,
  audioPopoverStatusLoopOffLabel,
  onOpenVersionLinksPopup,
  onOpenInfoPopup,
  onOpenFocusMode,
  onOpenQuickNavigation,
  onVersionChange,
  onLanguageChange,
  onThemeChange,
  onToggleMode,
}: DocsShellControlsProps) {
  return (
    <>
      <DocsShellControlsIcons
        fallbackProjectLink={fallbackProjectLink}
        projectLabel={projectLabel}
        useReactProjectLinkIcon={useReactProjectLinkIcon}
        projectLinkReactIconTag={projectLinkReactIconTag}
        projectLinkReactIconStyle={projectLinkReactIconStyle}
        versionLinkOptionsWithLabels={versionLinkOptionsWithLabels}
        versionLinksLabel={versionLinksLabel}
        useReactVersionLinksIcon={useReactVersionLinksIcon}
        versionLinksIconTag={versionLinksIconTag}
        versionLinksIconStyle={versionLinksIconStyle}
        versionLinksIconImage={versionLinksIconImage}
        versionLinksIconImgWidth={versionLinksIconImgWidth}
        versionLinksIconImgHeight={versionLinksIconImgHeight}
        infoIconImgWidth={infoIconImgWidth}
        infoIconImgHeight={infoIconImgHeight}
        previewIconImgWidth={previewIconImgWidth}
        previewIconImgHeight={previewIconImgHeight}
        showInfoButton={showInfoButton}
        lastUpdateLabel={lastUpdateLabel}
        useReactInfoIcon={useReactInfoIcon}
        infoIconTag={infoIconTag}
        infoIconStyle={infoIconStyle}
        infoIconImage={infoIconImage}
        showPreviewButton={showPreviewButton}
        previewProjectUrl={previewProjectUrl}
        useReactPreviewIcon={useReactPreviewIcon}
        previewIconTag={previewIconTag}
        previewIconStyle={previewIconStyle}
        previewIconImage={previewIconImage}
        onOpenVersionLinksPopup={onOpenVersionLinksPopup}
        onOpenInfoPopup={onOpenInfoPopup}
      />
      <DocsShellControlsAudio
        showAudioPlayer={showAudioPlayer}
        audioPlayerConfig={audioPlayerConfig}
        language={language}
        themeVarsStyle={themeVarsStyle}
        audioPlayIconTag={audioPlayIconTag}
        audioPlayIconStyle={audioPlayIconStyle}
        audioPauseIconTag={audioPauseIconTag}
        audioPauseIconStyle={audioPauseIconStyle}
        audioPlayLabel={audioPlayLabel}
        audioPauseLabel={audioPauseLabel}
        audioPlaylistTitle={audioPlaylistTitle}
        audioPlaylistDescription={audioPlaylistDescription}
        audioPopoverCloseLabel={audioPopoverCloseLabel}
        audioPopoverCloseIcon={audioPopoverCloseIcon}
        audioPopoverPlayIcon={audioPopoverPlayIcon}
        audioPopoverPauseIcon={audioPopoverPauseIcon}
        audioPopoverRestartIcon={audioPopoverRestartIcon}
        audioPopoverLoopOnIcon={audioPopoverLoopOnIcon}
        audioPopoverLoopOffIcon={audioPopoverLoopOffIcon}
        audioPopoverNowPlayingLabel={audioPopoverNowPlayingLabel}
        audioPopoverRestartLabel={audioPopoverRestartLabel}
        audioPopoverLoopOnLabel={audioPopoverLoopOnLabel}
        audioPopoverLoopOffLabel={audioPopoverLoopOffLabel}
        audioPopoverSourceLabel={audioPopoverSourceLabel}
        audioPopoverHideSource={audioPopoverHideSource}
        audioPopoverSourceCustomLabel={audioPopoverSourceCustomLabel}
        audioPopoverShowMinutes={audioPopoverShowMinutes}
        audioPopoverStatusPlayingLabel={audioPopoverStatusPlayingLabel}
        audioPopoverStatusPausedLabel={audioPopoverStatusPausedLabel}
        audioPopoverStatusLoopOnLabel={audioPopoverStatusLoopOnLabel}
        audioPopoverStatusLoopOffLabel={audioPopoverStatusLoopOffLabel}
      />
      {focusModeEnabled && (
        <button className={styles.button} onClick={onOpenFocusMode} aria-label={focusModeLabel}>
          {focusModeLabel}
        </button>
      )}
      {activeNavigation && <QuickNavigationTrigger className={styles.button} label={quickNavLabel} onClick={onOpenQuickNavigation} />}
      {showVersionSelector && (
        <VersionSelector
          className={styles.select}
          versions={availableVersions}
          value={selectedVersionValue}
          onChange={onVersionChange}
          ariaLabel={versionLabel}
        />
      )}
      {isLanguageSelectVisible && (
        <LanguageSelector
          className={styles.select}
          languages={availableLanguages}
          value={language}
          onChange={onLanguageChange}
          getLabel={languageLabelResolver}
          ariaLabel="Language selector"
        />
      )}
      {!hideThemeSelector && (
        <select className={styles.select} value={activeThemeId} onChange={(event) => onThemeChange(event.target.value)} aria-label="Theme selector">
          {layouts.map((layout) => (
            <option key={layout.id} value={layout.id}>
              {layout.name}
            </option>
          ))}
        </select>
      )}
      <ThemeModeToggle
        className={`${styles.button} ${styles.modeIconButton}`}
        isDarkMode={nextModeIsDark}
        canToggle={canToggleMode}
        label={nextModeIsDark ? darkModeLabel : lightModeLabel}
        onToggle={onToggleMode}
      />
    </>
  );
}
