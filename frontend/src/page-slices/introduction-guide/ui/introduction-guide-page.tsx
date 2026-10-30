"use client";

import { useMemo, type ReactNode } from "react";
import {
  getLanguageLabelFromMenu,
  resolveThemeBackground,
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
import { resolveControlIcon } from "@/shared/lib/icons/resolve-control-icon";
import { getGuideContent } from "../content";
import { useGuideSearch } from "../model/use-guide-search";
import { useActiveSection, scrollToSection } from "../model/use-active-section";
import { GuideHero } from "./guide-hero";
import { GuideSidebar } from "./guide-sidebar";
import { GuideSection } from "./guide-section";
import { GuideMotionProvider, useGuideMotion } from "./motion/guide-motion-provider";
import { GuideParallaxBackdrop } from "./motion/guide-parallax-backdrop";
import { GuideReveal } from "./motion/guide-reveal";
import { GuideStory } from "./story/guide-story";
import { GuideBackToTop } from "./guide-back-to-top";
import styles from "./introduction-guide-page.module.css";
import motionStyles from "./motion/guide-motion.module.css";

const GUIDE_LANGUAGES: LanguageCode[] = ["en", "pt", "es"];
const GUIDE_ANIMATION_LABELS: Record<string, { pause: string; resume: string; reduced: string }> = {
  en: { pause: "Pause guide animations", resume: "Resume guide animations", reduced: "Animations reduced by your system" },
  pt: { pause: "Pausar animações do guia", resume: "Retomar animações do guia", reduced: "Animações reduzidas pelo sistema" },
  es: { pause: "Pausar animaciones de la guía", resume: "Reanudar animaciones de la guía", reduced: "Animaciones reducidas por el sistema" },
};
/** Anchor of the full guide: the story's skip link lands here. */
const GUIDE_BODY_ID = "guide-body";
/** Anchor of the hero: "back to top" scrolls here and moves focus to it. */
const GUIDE_TOP_ID = "guide-top";
const FALLBACK_LANGMENU = {
  en: { en: "English", pt: "Português", es: "Español" },
  pt: { en: "English", pt: "Português", es: "Español" },
  es: { en: "English", pt: "Português", es: "Español" },
} as const;

/** Standalone documentation guide. Self-loads theme/layout config like the not-found shell. */
export function IntroductionGuidePage() {
  return <GuideMotionProvider><GuidePageContent /></GuideMotionProvider>;
}

function GuidePageContent() {
  const { enabled, reducedMotion, toggle } = useGuideMotion();
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
  const animationLabels = GUIDE_ANIMATION_LABELS[language] ?? GUIDE_ANIMATION_LABELS.en;
  const playbackLabel = animationLabels[enabled ? "pause" : "resume"];
  const animationLabel = reducedMotion ? animationLabels.reduced : playbackLabel;
  const { query, setQuery, results } = useGuideSearch(content.sections);
  const sectionIds = useMemo(() => content.sections.map((section) => section.id), [content.sections]);
  const { activeId, setActiveId } = useActiveSection(sectionIds);

  const onSelectSection = (id: string) => {
    setActiveId(id);
    scrollToSection(id);
  };

  const activeTheme = themes[activeLayout?.id ?? ""];
  const themeBackground = useMemo(
    () => resolveThemeBackground({ theme: activeTheme, settings: siteConfig?.backgroundEffects }),
    [activeTheme, siteConfig?.backgroundEffects],
  );
  const cssVars = useMemo(() => toSearchShellCssVars(activeTheme), [activeTheme]);

  const basePath = getBasePath();
  const backToSearchHref = basePath ? `${basePath}/` : "/";
  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(siteConfig ?? undefined, nextModeIsDark ? "dark" : "light", basePath),
    [siteConfig, nextModeIsDark, basePath],
  );
  const projectUrl = PROJECT_FOOTER_URL;

  const header = (backgroundControl: ReactNode) => (
    <SearchShellHeader
      additionalControls={backgroundControl}
      languageSelectorIcon={resolveControlIcon(siteConfig, { name: "LanguageSelector", mode: activeLayout?.mode ?? "dark" })}
      themeSelectorIcon={resolveControlIcon(siteConfig, { name: "ThemeSelector", mode: activeLayout?.mode ?? "dark" })}
      themeVarsStyle={cssVars}
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
    <SearchShellLayout header={header} footerEnabled projectFooterUrl={PROJECT_FOOTER_URL} language={language} style={cssVars} theme={activeTheme} backgroundEffects={siteConfig?.backgroundEffects} siteConfig={siteConfig ?? undefined}
      playbackControl={{ paused: !enabled, toggle, label: animationLabel, disabled: reducedMotion }}>
        <div className={`${styles.page} ${motionStyles.motionRoot} ${enabled ? "" : motionStyles.staticEffects}`} data-guide-motion={enabled ? "enabled" : "disabled"}>
          {!themeBackground && <GuideParallaxBackdrop />}
          <GuideHero
            id={GUIDE_TOP_ID}
            hero={content.hero}
            projectUrl={projectUrl}
            backToSearchHref={backToSearchHref}
            backToSearchLabel={content.ui.backToSearch}
            onPrimary={() => scrollToSection(sectionIds[1] ?? sectionIds[0])}
          />
          <GuideStory sections={content.sections} ui={content.ui} skipTargetId={GUIDE_BODY_ID} />
          <div id={GUIDE_BODY_ID} className={styles.body} tabIndex={-1}>
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
                <GuideReveal key={section.id}>
                  <GuideSection section={section} />
                </GuideReveal>
              ))}
            </div>
            <GuideBackToTop label={content.ui.backToTop} targetId={GUIDE_TOP_ID} settings={siteConfig?.backToTop} />
          </div>
        </div>
    </SearchShellLayout>
  );
}
