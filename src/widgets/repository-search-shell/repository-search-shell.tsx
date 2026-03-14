"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { FaGithubAlt, FaGithubSquare } from "react-icons/fa";
import type { LanguageCode, LayoutItem, LoadedDocsData, ThemeTemplate } from "@/entities/docs/model/types";
import styles from "./repository-search-shell.module.css";

function resolveThemeByMode(layouts: LayoutItem[], active: LayoutItem, mode: "light" | "dark"): LayoutItem {
  if (!active.supportsLightAndDarkModes || !active.supportsLightAndDarkModesReference) {
    return active;
  }

  return (
    layouts.find(
      (item) => item.supportsLightAndDarkModesReference === active.supportsLightAndDarkModesReference && item.mode === mode,
    ) ?? active
  );
}

function toCssVars(theme: ThemeTemplate | undefined): CSSProperties {
  const colors = theme?.colors ?? {};
  return {
    ["--background" as string]: colors.background ?? "#0b0f15",
    ["--primary" as string]: colors.primary ?? "#7c3aed",
    ["--secondary" as string]: colors.secondary ?? "#22d3ee",
    ["--text" as string]: colors.text ?? "#e2e8f0",
    ["--text-secondary" as string]: colors.textSecondary ?? "#94a3b8",
    ["--card-background" as string]: colors.cardBackground ?? "#0f172a",
    ["--card-border" as string]: colors.cardBorder ?? "#334155",
  };
}

function getLanguageLabel(data: LoadedDocsData, selectedLanguage: LanguageCode, target: LanguageCode): string {
  const labels = data.config.site.langmenu[selectedLanguage];
  return labels?.[target] ?? target.toUpperCase();
}

function getLangMenuLabel(data: LoadedDocsData, selectedLanguage: LanguageCode, key: string, fallback: string): string {
  const labels = data.config.site.langmenu[selectedLanguage] as Record<string, string> | undefined;
  return labels?.[key] ?? fallback;
}

function resolveHeaderReactIcon(tag: string | undefined, mode: "light" | "dark" | undefined): React.ReactNode {
  const normalizedTag = (tag ?? "").trim();
  if (normalizedTag === "FaGithubAlt") {
    return <FaGithubAlt aria-hidden />;
  }
  if (normalizedTag === "FaGithubSquare") {
    return <FaGithubSquare aria-hidden />;
  }
  return mode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />;
}

export function RepositorySearchShell({
  data,
  repositoryNotUsingGitPageDocs,
}: {
  data: LoadedDocsData;
  repositoryNotUsingGitPageDocs: boolean;
}) {
  const router = useRouter();
  const defaultLanguage = data.config.site.defaultLanguage;
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [ownerInput, setOwnerInput] = useState(data.activeRepository.owner ?? "");
  const [repoInput, setRepoInput] = useState(data.activeRepository.repo ?? "");
  const searchLanguages: LanguageCode[] = repositoryNotUsingGitPageDocs
    ? (["en", "pt", "es"] as LanguageCode[])
    : data.availableLanguages;

  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;
  const initialThemeBase =
    data.layoutsConfig.layouts.find((layout) => layout.id === initialThemeBaseId) ?? data.layoutsConfig.layouts[0];
  const initialThemeId = initialThemeBase
    ? resolveThemeByMode(data.layoutsConfig.layouts, initialThemeBase, configuredDefaultMode).id
    : "";
  const [activeThemeId, setActiveThemeId] = useState(initialThemeId);

  const activeLayout = data.layoutsConfig.layouts.find((layout) => layout.id === activeThemeId) ?? data.layoutsConfig.layouts[0];
  const activeTheme = data.themes[activeLayout?.id];
  const cssVars = useMemo(() => toCssVars(activeTheme), [activeTheme]);
  const hideThemeSelector = Boolean(data.config.site.HideThemeSelector);
  const canToggleMode = Boolean(activeLayout?.supportsLightAndDarkModes);
  const nextMode = activeLayout?.mode === "dark" ? "light" : "dark";

  const iconImage =
    (activeLayout?.mode === "dark"
      ? data.config.site.IconImageMenuHeaderDark?.trim()
      : data.config.site.IconImageMenuHeaderLight?.trim()) || data.config.site.IconImageMenuHeader?.trim();
  const useReactHeaderIcon = Boolean(data.config.site.IconImageMenuHeaderReactIcones);
  const reactHeaderIconTag = data.config.site.IconImageMenuHeaderReactIconesTag;
  const headerReactIcon = resolveHeaderReactIcon(reactHeaderIconTag, activeLayout?.mode);
  const headerReactIconColor =
    activeLayout?.mode === "dark"
      ? data.config.site.IconImageMenuHeaderReactIconesTagColorDark
      : data.config.site.IconImageMenuHeaderReactIconesTagColorLight;
  const headerReactIconSize = data.config.site.IconImageMenuHeaderReactIconesTagSize;
  const headerReactIconStyle: CSSProperties = {
    color: headerReactIconColor?.trim() || undefined,
    fontSize: headerReactIconSize?.trim() || undefined,
  };

  const darkModeLabel = getLangMenuLabel(data, language, "darkMode", "Dark mode");
  const lightModeLabel = getLangMenuLabel(data, language, "lightMode", "Light mode");
  const ownerLabel = getLangMenuLabel(data, language, "searchOwnerLabel", "Owner");
  const repoLabel = getLangMenuLabel(data, language, "searchRepoLabel", "Repository");
  const searchLabel = getLangMenuLabel(data, language, "searchButtonLabel", "Search");

  const localizedMessage = {
    pt: "GitPageDocs Não instalado.",
    en: "GitPageDocs is not installed.",
    es: "GitPageDocs no está instalado.",
  }[language];

  const localizedDescription = {
    pt: "Informe usuario e repositorio para abrir a documentacao remota.",
    en: "Enter owner and repository to open remote documentation.",
    es: "Ingresa usuario y repositorio para abrir la documentacion remota.",
  }[language];

  const currentMessage = repositoryNotUsingGitPageDocs ? localizedMessage : localizedDescription;

  // Handle repository identification via URL hash (#/owner/repo) on mount only
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
      const parts = window.location.hash.slice(2).split("/").filter(Boolean);
      if (parts.length >= 2 && (!ownerInput || !repoInput)) {
        setOwnerInput(parts[0]);
        setRepoInput(parts[1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount to sync from hash
  }, []);

  function onThemeChange(nextThemeId: string) {
    setActiveThemeId(nextThemeId);
  }

  function onToggleMode() {
    if (!activeLayout) {
      return;
    }
    const nextLayout = resolveThemeByMode(data.layoutsConfig.layouts, activeLayout, nextMode);
    setActiveThemeId(nextLayout.id);
  }

  function onSearch() {
    const owner = ownerInput.trim();
    const repo = repoInput.trim();
    if (!owner || !repo) {
      return;
    }
    if (typeof window !== "undefined") {
      window.location.hash = `#/${owner}/${repo}`;
    }
    router.push(`/${owner}/${repo}`);
  }

  return (
    <main className={styles.page} style={cssVars}>
      <section className={styles.card}>
        <div className={styles.brand}>
          {useReactHeaderIcon ? (
            <span className={styles.brandReactIcon} style={headerReactIconStyle}>
              {headerReactIcon}
            </span>
          ) : iconImage ? (
            <Image src={iconImage} alt={data.config.site.name} width={34} height={34} className={styles.brandIcon} unoptimized />
          ) : null}
          <strong>{data.config.site.name}</strong>
        </div>

        <h1 className={styles.title}>{repositoryNotUsingGitPageDocs ? localizedMessage : "GitPageDocs"}</h1>
        <p className={styles.description}>{currentMessage}</p>

        <div className={styles.controls}>
          {searchLanguages.length > 1 && (
            <select className={styles.select} value={String(language)} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
              {searchLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageLabel(data, language, lang)}
                </option>
              ))}
            </select>
          )}

          {!hideThemeSelector && (
            <select className={styles.select} value={activeThemeId} onChange={(event) => onThemeChange(event.target.value)}>
              {data.layoutsConfig.layouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          )}

          {canToggleMode && (
            <button className={styles.button} onClick={onToggleMode} aria-label={nextMode === "dark" ? darkModeLabel : lightModeLabel}>
              {nextMode === "dark" ? <BsMoonStarsFill aria-hidden /> : <BsSunFill aria-hidden />}
            </button>
          )}
        </div>

        <div className={styles.form}>
          <input
            className={styles.input}
            value={ownerInput}
            onChange={(event) => setOwnerInput(event.target.value)}
            placeholder={ownerLabel}
            aria-label={ownerLabel}
          />
          <input
            className={styles.input}
            value={repoInput}
            onChange={(event) => setRepoInput(event.target.value)}
            placeholder={repoLabel}
            aria-label={repoLabel}
          />
          <button className={styles.button} onClick={onSearch}>
            {searchLabel}
          </button>
        </div>
      </section>
    </main>
  );
}
