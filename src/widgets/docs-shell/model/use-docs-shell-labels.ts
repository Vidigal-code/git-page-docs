import { useMemo } from "react";
import { getLangMenuLabelFromMenu, resolveTranslation, type LoadedDocsData } from "@/entities/docs";

export interface DocsShellLabels {
  previousLabel: string;
  nextLabel: string;
  browsePrevLabel: string;
  browseNextLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
  quickNavPlaceholder: string;
  noNavigationResults: string;
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  fullscreenExpandLabel: string;
}

export function useDocsShellLabels(data: LoadedDocsData, language: string): DocsShellLabels {
  return useMemo(() => {
    const previousLabel = resolveTranslation(
      data.config.translations?.navigation?.previous,
      language,
      "Previous",
    );
    const nextLabel = resolveTranslation(data.config.translations?.navigation?.next, language, "Next");
    const browsePrevLabel = resolveTranslation(
      data.config.translations?.navigation?.browsePrev,
      language,
      previousLabel,
    );
    const browseNextLabel = resolveTranslation(
      data.config.translations?.navigation?.browseNext,
      language,
      nextLabel,
    );
    const menuCloseLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "menuClose",
      resolveTranslation(data.config.translations?.navigation?.menuClose, language, "Close"),
    );
    const menuOpenLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "menuOpen",
      resolveTranslation(data.config.translations?.navigation?.menuOpen, language, "Menu"),
    );
    const quickNavPlaceholder = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "typeToNavigate",
      "Type to navigate...",
    );
    const noNavigationResults = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "noNavigationResults",
      "No navigation results.",
    );
    const navigateHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "navigateHint",
      "Navigate",
    );
    const selectHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "selectHint",
      "Select",
    );
    const escHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "escHint",
      "ESC",
    );
    const closeHintLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "closeHint",
      menuCloseLabel,
    );
    const fullscreenExpandLabel = getLangMenuLabelFromMenu(
      data.config.site.langmenu,
      language,
      "showMenu",
      "Fullscreen",
    );

    return {
      previousLabel,
      nextLabel,
      browsePrevLabel,
      browseNextLabel,
      menuOpenLabel,
      menuCloseLabel,
      quickNavPlaceholder,
      noNavigationResults,
      navigateHintLabel,
      selectHintLabel,
      escHintLabel,
      closeHintLabel,
      fullscreenExpandLabel,
    };
  }, [data.config.site.langmenu, data.config.translations, language]);
}
