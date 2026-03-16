"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import { toSearchShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { LanguageCode, LoadedDocsData } from "@/entities/docs/model/types";
import { RepositorySearchForm } from "@/features/repository-search-form";
import { SearchShellHeader } from "@/widgets/search-shell-header/ui/search-shell-header";
import { buildFooterConfigFromData } from "@/entities/docs/lib/footer/build-footer-config";
import { SearchShellLayout } from "@/widgets/search-shell-layout/search-shell-layout";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import styles from "./repository-search-shell.module.css";

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

  const basePath = getBasePath();
  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, activeLayout?.mode ?? "dark", basePath),
    [data.config.site, activeLayout?.mode, basePath],
  );
  const {
    iconImage,
    headerName,
    useReactIcon: useReactHeaderIcon,
    reactIconTag: reactHeaderIconTag,
    reactIconStyle: headerReactIconStyle,
    iconImgWidth: iconImageMenuHeaderImgWidth,
    iconImgHeight: iconImageMenuHeaderImgHeight,
  } = headerIconConfig;

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

  function onToggleMode() {
    if (!activeLayout?.supportsLightAndDarkModes) return;
    const nextMode = activeLayout.mode === "dark" ? "light" : "dark";
    const paired = resolveThemeByMode(data.layoutsConfig.layouts, activeLayout, nextMode);
    setActiveThemeId(paired.id);
  }

  const canToggleMode = Boolean(activeLayout?.supportsLightAndDarkModes);
  const nextModeIsDark = activeLayout?.mode === "dark";

  const header = (
    <SearchShellHeader
      siteName={headerName}
      basePath={basePath}
      language={language}
      languages={searchLanguages}
      onLanguageChange={setLanguage}
      activeThemeId={activeThemeId}
      layouts={data.layoutsConfig.layouts}
      onThemeChange={setActiveThemeId}
      nextModeIsDark={nextModeIsDark}
      canToggleMode={canToggleMode}
      onToggleMode={onToggleMode}
      iconImage={iconImage}
      iconImgWidth={iconImageMenuHeaderImgWidth}
      iconImgHeight={iconImageMenuHeaderImgHeight}
      useReactHeaderIcon={useReactHeaderIcon}
      reactHeaderIconTag={reactHeaderIconTag}
      headerReactIconStyle={headerReactIconStyle}
      getLanguageLabel={(lang) => getLanguageLabelFromMenu(data.config.site.langmenu, language, lang)}
    />
  );

  return (
    <SearchShellLayout
      header={header}
      footerEnabled={footerEnabled}
      projectFooterUrl={PROJECT_FOOTER_URL}
      language={language}
      style={cssVars}
      footerConfig={buildFooterConfigFromData(data, language)}
    >
      <section className={styles.card}>
        <h1 className={styles.title}>{repositoryNotUsingGitPageDocs ? localizedMessage : "GitPageDocs"}</h1>
        <p className={styles.description}>{currentMessage}</p>
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
    </SearchShellLayout>
  );
}
