"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LanguageSelector } from "@/features/language-selector";
import { ThemeModeToggle } from "@/features/theme-switcher";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { LanguageCode, LayoutItem } from "@/entities/docs";
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
  iconImgWidth?: number;
  iconImgHeight?: number;
  useReactHeaderIcon?: boolean;
  reactHeaderIconTag?: string;
  headerReactIconStyle?: React.CSSProperties;
  getLanguageLabel: (lang: LanguageCode) => string;
}

export function SearchShellHeader({
  siteName,
  basePath: _basePath,
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
  iconImgWidth = 20,
  iconImgHeight = 20,
  useReactHeaderIcon,
  reactHeaderIconTag,
  headerReactIconStyle,
  getLanguageLabel,
}: SearchShellHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Use "/" so Next.js Link adds basePath automatically when configured (avoids hydration mismatch)
  const homeHref = "/";
  const darkModeLabel = "Dark mode";
  const lightModeLabel = "Light mode";
  const menuOpenLabel = "Open menu";
  const menuCloseLabel = "Close menu";

  const controls = (
    <>
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
    </>
  );

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
              <Image src={iconImage} alt="" width={iconImgWidth} height={iconImgHeight} className={styles.brandIcon} unoptimized />
            ) : (
              <span className={styles.brandReactIcon} style={headerReactIconStyle}>
                <ReactIconByTag tag="FaGithubSquare" />
              </span>
            )}
            <strong>{siteName}</strong>
          </Link>
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? menuCloseLabel : menuOpenLabel}
            title={menuOpen ? menuCloseLabel : menuOpenLabel}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className={styles.headerRight}>{controls}</div>
      </div>

      {menuOpen && (
        <div
          className={styles.mobileDrawerOverlay}
          onClick={() => setMenuOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
        >
          <aside
            className={styles.mobileDrawer}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileDrawerHeader}>
              <strong>{siteName}</strong>
              <button
                type="button"
                className={styles.mobileDrawerClose}
                onClick={() => setMenuOpen(false)}
                aria-label={menuCloseLabel}
                title={menuCloseLabel}
              >
                ✕
              </button>
            </div>
            <div className={styles.mobileControls}>{controls}</div>
          </aside>
        </div>
      )}
    </header>
  );
}
