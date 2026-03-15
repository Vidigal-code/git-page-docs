"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { FaGithubAlt, FaGithubSquare } from "react-icons/fa";
import { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import { toSearchShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";
import { LanguageSelector } from "@/features/language-selector/ui/language-selector";
import { RepositorySearchForm } from "@/features/repository-search-form/ui/repository-search-form";
import { SiteFooter } from "@/shared/ui/site-footer";
import styles from "./repository-search-shell.module.css";

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
  const searchParams = useSearchParams();
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
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);

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

  const ownerLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "searchOwnerLabel", "Owner");
  const repoLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "searchRepoLabel", "Repository");
  const searchLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "searchButtonLabel", "Search");

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
  const footerEnabled = data.config.site.FooterEnabled !== false;
  const projectFooterUrl = "https://github.com/Vidigal-code/git-page-docs";

  // Local-only theme for search page (does not affect docs shell state).
  useEffect(() => {
    const urlMode = searchParams.get("modetheme");
    const targetMode = urlMode === "dark" || urlMode === "light" ? urlMode : configuredDefaultMode;
    const base = data.layoutsConfig.layouts.find((layout) => layout.id === initialThemeBaseId) ?? data.layoutsConfig.layouts[0];
    if (base) {
      const resolved = resolveThemeByMode(data.layoutsConfig.layouts, base, targetMode);
      setActiveThemeId(resolved.id);
    }
  }, [searchParams, configuredDefaultMode, data.layoutsConfig.layouts, initialThemeBaseId]);

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
            <LanguageSelector
              languages={searchLanguages}
              value={language}
              onChange={setLanguage}
              className={styles.select}
              getLabel={(lang) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang)}
            />
          )}
          <select className={styles.select} value={activeThemeId} onChange={(event) => setActiveThemeId(event.target.value)}>
            {data.layoutsConfig.layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name}
              </option>
            ))}
          </select>

        </div>

        <RepositorySearchForm
          owner={ownerInput}
          repo={repoInput}
          ownerLabel={ownerLabel}
          repoLabel={repoLabel}
          searchLabel={searchLabel}
          onOwnerChange={setOwnerInput}
          onRepoChange={setRepoInput}
          onSubmit={onSearch}
          classNames={{
            form: styles.form,
            input: styles.input,
            button: styles.button,
          }}
        />
      </section>
      {footerEnabled && <SiteFooter language={language} projectUrl={projectFooterUrl} />}
    </main>
  );
}
