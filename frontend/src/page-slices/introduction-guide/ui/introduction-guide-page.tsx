"use client";

import { useMemo } from "react";
import {
  getLanguageLabelFromMenu,
  toSearchShellCssVars,
  type LanguageCode,
} from "@/entities/docs";
import {
  SearchShellHeader,
  useStandaloneShellConfig,
  useStandaloneShellPreferences,
} from "@/widgets/search-shell-header";
import { SearchShellLayout } from "@/widgets/search-shell-layout";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import { getGuideContent } from "../content";
import { useGuideSearch } from "../model/use-guide-search";
import { useActiveSection, scrollToSection } from "../model/use-active-section";
import { GuideHero } from "./guide-hero";
import { GuideSidebar } from "./guide-sidebar";
import { GuideSection } from "./guide-section";
import styles from "./introduction-guide-page.module.css";

const GUIDE_LANGUAGES: LanguageCode[] = ["en", "pt", "es"];
const FALLBACK_LANGMENU = {
  en: { en: "English", pt: "Português", es: "Español" },
  pt: { en: "English", pt: "Português", es: "Español" },
  es: { en: "English", pt: "Português", es: "Español" },
} as const;

/** Standalone documentation guide. Self-loads theme/layout config like the not-found shell. */
export function IntroductionGuidePage() {
  const { config: standaloneConfig } = useStandaloneShellConfig();
  const layouts = useMemo(() => standaloneConfig?.layoutsConfig?.layouts ?? [], [standaloneConfig]);
  const themes = standaloneConfig?.themes ?? {};
  const siteConfig = standaloneConfig?.siteConfig;
  const siteName = siteConfig?.name ?? "GitPageDocs";
  const initialThemeBaseId = layouts.find((layout) => layout.id === "aurora-dark")?.id ?? layouts[0]?.id;

  const {
    language,
    onLanguageChange,
    activeThemeId,
    onThemeChange,
    onToggleMode,
    activeLayout,
    nextModeIsDark,
    canToggleMode,
  } = useStandaloneShellPreferences({
    siteName,
    defaultLanguage: "en",
    availableLanguages: GUIDE_LANGUAGES,
    layouts,
    configuredDefaultMode: "dark",
    initialThemeBaseId,
  });

  const content = useMemo(() => getGuideContent(language), [language]);
  const { query, setQuery, results } = useGuideSearch(content.sections);
  const sectionIds = useMemo(() => content.sections.map((section) => section.id), [content.sections]);
  const { activeId, setActiveId } = useActiveSection(sectionIds);

  const onSelectSection = (id: string) => {
    setActiveId(id);
    scrollToSection(id);
  };

  const activeTheme = themes[activeLayout?.id ?? ""];
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);

  const basePath = getBasePath();
  const backToSearchHref = basePath ? `${basePath}/` : "/";
  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(siteConfig ?? undefined, nextModeIsDark ? "dark" : "light", basePath),
    [siteConfig, nextModeIsDark, basePath],
  );
  const projectUrl = PROJECT_FOOTER_URL;

  const header = (
    <SearchShellHeader
      siteName={headerIconConfig.headerName}
      basePath={basePath}
      language={language}
      languages={GUIDE_LANGUAGES}
      onLanguageChange={onLanguageChange}
      activeThemeId={activeThemeId}
      layouts={layouts}
      onThemeChange={onThemeChange}
      nextModeIsDark={nextModeIsDark}
      canToggleMode={canToggleMode}
      onToggleMode={onToggleMode}
      iconImage={headerIconConfig.iconImage}
      iconImgWidth={headerIconConfig.iconImgWidth}
      iconImgHeight={headerIconConfig.iconImgHeight}
      useReactHeaderIcon={headerIconConfig.useReactIcon}
      reactHeaderIconTag={headerIconConfig.reactIconTag}
      headerReactIconStyle={headerIconConfig.reactIconStyle}
      getLanguageLabel={(targetLang) =>
        getLanguageLabelFromMenu(siteConfig?.langmenu ?? FALLBACK_LANGMENU, language, targetLang)
      }
    />
  );

  return (
    <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={language} style={cssVars}>
      <div className={styles.page}>
        <GuideHero
          hero={content.hero}
          projectUrl={projectUrl}
          backToSearchHref={backToSearchHref}
          backToSearchLabel={content.ui.backToSearch}
          onPrimary={() => scrollToSection(sectionIds[1] ?? sectionIds[0])}
        />
        <div className={styles.body}>
          <GuideSidebar
            ui={content.ui}
            sections={results}
            query={query}
            onQueryChange={setQuery}
            activeId={activeId}
            onSelect={onSelectSection}
          />
          <div className={styles.content}>
            {content.sections.map((section) => (
              <GuideSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </SearchShellLayout>
  );
}
