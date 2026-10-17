import { DocsShellControlsAudio } from "./docs-shell-controls-audio";
import { DocsShellControlsIcons } from "./docs-shell-controls-icons";
import { LanguageSelector } from "@/features/language-selector";
import { QuickNavigationTrigger } from "@/features/quick-navigation";
import { ThemeModeToggle } from "@/features/theme-switcher";
import { ThemeSelector } from "@/features/theme-selector";
import { VersionSelector } from "@/features/version-selector";
import { ControlIcon } from "@/shared/ui/control-icon";
import { MdFullscreen } from "@/shared/ui/fallback-icons";
import type {
  DocsShellControlsBaseProps,
  DocsShellControlsAudioProps,
} from "../model/docs-shell-config-types";
import styles from "../docs-shell.module.css";

export type DocsShellControlsProps = DocsShellControlsBaseProps & DocsShellControlsAudioProps;

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
  updateDate: _updateDate,
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
  focusModeIcon,
  activeNavigation,
  quickNavLabel,
  quickNavigationIcon,
  showVersionSelector,
  availableVersions,
  selectedVersionValue,
  versionLabel,
  isLanguageSelectVisible,
  availableLanguages,
  language,
  languageLabelResolver,
  languageSelectorIcon,
  themeSelectorIcon,
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
  audioPlayLabel,
  audioPauseLabel,
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
        audioPlayIconTag={audioPlayIconTag}
        audioPlayIconStyle={audioPlayIconStyle}
        audioPauseIconTag={audioPauseIconTag}
        audioPlayLabel={audioPlayLabel}
        audioPauseLabel={audioPauseLabel}
      />
      {focusModeEnabled && (
        <button
          type="button"
          className={focusModeIcon ? `${styles.button} ${styles.modeIconButton}` : styles.button}
          onClick={onOpenFocusMode}
          aria-label={focusModeLabel}
          title={focusModeLabel}
        >
          {focusModeIcon ? <ControlIcon icon={focusModeIcon} fallback={<MdFullscreen aria-hidden />} /> : focusModeLabel}
        </button>
      )}
      {activeNavigation && <QuickNavigationTrigger className={quickNavigationIcon ? `${styles.button} ${styles.modeIconButton}` : styles.button} label={quickNavLabel} icon={quickNavigationIcon} onClick={onOpenQuickNavigation} />}
      {showVersionSelector && (
        <VersionSelector
          className={styles.select}
          versions={availableVersions}
          value={selectedVersionValue}
          onChange={onVersionChange}
          ariaLabel={versionLabel}
          themeVarsStyle={themeVarsStyle}
        />
      )}
      {isLanguageSelectVisible && (
        <LanguageSelector
          className={languageSelectorIcon ? `${styles.button} ${styles.modeIconButton}` : styles.select}
          icon={languageSelectorIcon}
          languages={availableLanguages}
          value={language}
          onChange={onLanguageChange}
          getLabel={languageLabelResolver}
          ariaLabel="Language selector"
          themeVarsStyle={themeVarsStyle}
        />
      )}
      {!hideThemeSelector && (
        <ThemeSelector
          className={themeSelectorIcon ? `${styles.button} ${styles.modeIconButton}` : styles.select}
          icon={themeSelectorIcon}
          layouts={layouts}
          value={activeThemeId}
          onChange={onThemeChange}
          ariaLabel="Theme selector"
          themeVarsStyle={themeVarsStyle}
        />
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
