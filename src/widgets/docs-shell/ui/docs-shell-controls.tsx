import { LanguageSelector } from "@/features/language-selector/ui/language-selector";
import { QuickNavigationTrigger } from "@/features/quick-navigation/ui/quick-navigation-trigger";
import { ThemeModeToggle } from "@/features/theme-switcher/ui/theme-mode-toggle";
import { VersionSelector } from "@/features/version-selector/ui/version-selector";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { LanguageCode, LayoutItem, VersionEntry } from "@/entities/docs/model/types";
import styles from "../docs-shell.module.css";

interface VersionLinkOption {
  id: "branch" | "release" | "commit";
  label: string;
  url: string;
}

interface DocsShellControlsProps {
  fallbackProjectLink: string | undefined;
  projectLabel: string;
  useReactProjectLinkIcon: boolean;
  projectLinkReactIconTag: string | undefined;
  projectLinkReactIconStyle: React.CSSProperties;
  versionLinkOptionsWithLabels: VersionLinkOption[];
  versionLinksLabel: string;
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
  onOpenVersionLinksPopup,
  onOpenFocusMode,
  onOpenQuickNavigation,
  onVersionChange,
  onLanguageChange,
  onThemeChange,
  onToggleMode,
}: DocsShellControlsProps) {
  return (
    <>
      {fallbackProjectLink && (
        <a
          href={fallbackProjectLink}
          target="_blank"
          rel="noreferrer"
          className={`${styles.button} ${styles.githubLinkButton}`}
          aria-label={projectLabel}
          title={projectLabel}
        >
          {useReactProjectLinkIcon ? (
            <ReactIconByTag tag={projectLinkReactIconTag} style={projectLinkReactIconStyle} />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden className={styles.githubIcon}>
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.85 9.72.5.1.68-.22.68-.5 0-.24-.01-.9-.01-1.77-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.93.85.09-.67.35-1.12.64-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.88a9.3 9.3 0 0 1 2.5.35c1.9-1.33 2.74-1.05 2.74-1.05.54 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.94-2.33 4.8-4.56 5.06.36.31.68.92.68 1.86 0 1.35-.01 2.43-.01 2.76 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
              />
            </svg>
          )}
        </a>
      )}
      {!!versionLinkOptionsWithLabels.length && (
        <button className={styles.button} onClick={onOpenVersionLinksPopup} aria-label={versionLinksLabel}>
          {versionLinksLabel}
        </button>
      )}
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
