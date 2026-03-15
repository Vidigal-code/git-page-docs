import Image from "next/image";
import Link from "next/link";
import { ThemeModeToggle } from "@/features/theme-switcher/ui/theme-mode-toggle";
import { LanguageSelector } from "@/features/language-selector/ui/language-selector";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { LanguageCode, LayoutItem } from "@/entities/docs/model/types";
import styles from "../search-shell-header.module.css";

interface SearchShellHeaderProps {
  siteName: string;
  basePath: string;
  language: LanguageCode;
  languages: LanguageCode[];
  onLanguageChange: (lang: LanguageCode) => void;
  activeThemeId: string;
  layouts: LayoutItem[];
  onThemeChange: (themeId: string) => void;
  nextModeIsDark: boolean;
  canToggleMode: boolean;
  onToggleMode: () => void;
  iconImage?: string;
  useReactHeaderIcon?: boolean;
  reactHeaderIconTag?: string;
  headerReactIconStyle?: React.CSSProperties;
  getLanguageLabel: (lang: LanguageCode) => string;
}

export function SearchShellHeader({
  siteName,
  basePath,
  language,
  languages,
  onLanguageChange,
  activeThemeId,
  layouts,
  onThemeChange,
  nextModeIsDark,
  canToggleMode,
  onToggleMode,
  iconImage,
  useReactHeaderIcon,
  reactHeaderIconTag,
  headerReactIconStyle,
  getLanguageLabel,
}: SearchShellHeaderProps) {
  const homeHref = basePath ? `${basePath}/` : "/";
  const darkModeLabel = "Dark mode";
  const lightModeLabel = "Light mode";

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <Link href={homeHref} className={styles.brandLink} aria-label={siteName}>
            {useReactHeaderIcon && reactHeaderIconTag ? (
              <span className={styles.brandReactIcon} style={headerReactIconStyle}>
                <ReactIconByTag tag={reactHeaderIconTag} />
              </span>
            ) : iconImage ? (
              <Image src={iconImage} alt="" width={28} height={28} className={styles.brandIcon} unoptimized />
            ) : (
              <span className={styles.brandReactIcon} style={headerReactIconStyle}>
                <ReactIconByTag tag="FaGithubSquare" />
              </span>
            )}
            <strong>{siteName}</strong>
          </Link>
        </div>

        <div className={styles.headerRight}>
          {layouts.length > 1 && (
            <select
              className={styles.select}
              value={activeThemeId}
              onChange={(e) => onThemeChange(e.target.value)}
              aria-label="Theme selector"
            >
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          )}

          <ThemeModeToggle
            className={styles.modeIconButton}
            isDarkMode={nextModeIsDark}
            canToggle={canToggleMode}
            label={nextModeIsDark ? darkModeLabel : lightModeLabel}
            onToggle={onToggleMode}
          />

          {languages.length > 1 && (
            <LanguageSelector
              className={styles.select}
              languages={languages}
              value={language}
              onChange={onLanguageChange}
              getLabel={getLanguageLabel}
              ariaLabel="Language selector"
            />
          )}
        </div>
      </div>
    </header>
  );
}
