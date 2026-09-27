"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FiArrowLeft, IoMdClose } from "@/shared/ui/fallback-icons";
import { LanguageSelector } from "@/features/language-selector";
import { ThemeModeToggle } from "@/features/theme-switcher";
import { ThemeSelector } from "@/features/theme-selector";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { LanguageCode, LayoutItem } from "@/entities/docs";
import styles from "../search-shell-header.module.css";

interface SearchShellBrandIconProps {
  useReactHeaderIcon?: boolean;
  reactHeaderIconTag?: string;
  headerReactIconStyle?: React.CSSProperties;
  iconImage?: string;
  iconImgWidth: number;
  iconImgHeight: number;
}

/** Brand slot: the configured react icon, else the configured image, else the GitHub mark. */
function SearchShellBrandIcon({
  useReactHeaderIcon,
  reactHeaderIconTag,
  headerReactIconStyle,
  iconImage,
  iconImgWidth,
  iconImgHeight,
}: Readonly<SearchShellBrandIconProps>) {
  if (useReactHeaderIcon && reactHeaderIconTag) {
    return (
      <span className={styles.brandReactIcon} style={headerReactIconStyle}>
        <ReactIconByTag tag={reactHeaderIconTag} />
      </span>
    );
  }
  if (iconImage) {
    return <Image src={iconImage} alt="" width={iconImgWidth} height={iconImgHeight} className={styles.brandIcon} unoptimized />;
  }
  return (
    <span className={styles.brandReactIcon} style={headerReactIconStyle}>
      <ReactIconByTag tag="FaGithubSquare" />
    </span>
  );
}

/** An optional "back" affordance rendered beside the brand (e.g. the source viewer returning to the docs). */
export interface SearchShellBackLink {
  href: string;
  label: string;
}

interface SearchShellHeaderProps {
  siteName: string;
  basePath: string;
  backLink?: SearchShellBackLink;
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
  /** Theme CSS variables forwarded to selector modals (portaled to <body>). */
  themeVarsStyle?: React.CSSProperties;
}

export function SearchShellHeader({
  siteName,
  basePath: _basePath,
  backLink,
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
  themeVarsStyle,
}: Readonly<SearchShellHeaderProps>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  // Escape closes the drawer while focus is inside it. Scoped to the drawer so
  // an Escape aimed at a selector dialog portaled to <body> leaves it open.
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (event.target instanceof Node && drawerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Use "/" so Next.js Link adds basePath automatically when configured.
  const homeHref = "/";
  const darkModeLabel = "Dark mode";
  const lightModeLabel = "Light mode";
  const menuOpenLabel = "Open menu";
  const menuCloseLabel = "Close menu";

  const controls = (
    <>
      {layouts.length > 1 && (
        <ThemeSelector
          className={styles.select}
          layouts={layouts}
          value={activeThemeId}
          onChange={onThemeChange}
          ariaLabel="Theme selector"
          themeVarsStyle={themeVarsStyle}
        />
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
          themeVarsStyle={themeVarsStyle}
        />
      )}
    </>
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <div className={styles.brandGroup}>
            <Link href={homeHref} className={styles.brandLink} aria-label={siteName}>
              <SearchShellBrandIcon
                useReactHeaderIcon={useReactHeaderIcon}
                reactHeaderIconTag={reactHeaderIconTag}
                headerReactIconStyle={headerReactIconStyle}
                iconImage={iconImage}
                iconImgWidth={iconImgWidth}
                iconImgHeight={iconImgHeight}
              />
              <strong>{siteName}</strong>
            </Link>
            {backLink && (
              <Link href={backLink.href} className={styles.backLink} aria-label={backLink.label} title={backLink.label}>
                <FiArrowLeft aria-hidden />
                <span className={styles.backLinkText}>{backLink.label}</span>
              </Link>
            )}
          </div>
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? menuCloseLabel : menuOpenLabel}
            title={menuOpen ? menuCloseLabel : menuOpenLabel}
          >
            {menuOpen ? <IoMdClose aria-hidden /> : <FaBars aria-hidden />}
          </button>
        </div>

        <div className={styles.headerRight}>{controls}</div>
      </div>

      {menuOpen && (
        <div className={styles.mobileDrawerOverlay}>
          <button
            type="button"
            className={styles.overlayBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-label={menuCloseLabel}
            tabIndex={-1}
          />
          <aside ref={drawerRef} className={styles.mobileDrawer}>
            <div className={styles.mobileDrawerHeader}>
              <strong>{siteName}</strong>
              <button
                type="button"
                className={styles.mobileDrawerClose}
                onClick={() => setMenuOpen(false)}
                aria-label={menuCloseLabel}
                title={menuCloseLabel}
              >
                <IoMdClose aria-hidden />
              </button>
            </div>
            <div className={styles.mobileControls}>{controls}</div>
          </aside>
        </div>
      )}
    </header>
  );
}
