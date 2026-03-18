import type { LoadedDocsData } from "@/entities/docs";
import { useDocsShellPopups } from "./use-docs-shell-popups";
import { useDocsShellThemeState } from "./use-docs-shell-theme-state";
import { useDocsShellLanguageState } from "./use-docs-shell-language-state";
import { useDocsShellNavigationState } from "./use-docs-shell-navigation-state";

export function useDocsShellState(
  data: LoadedDocsData,
  opts: {
    languageStorageKey: string;
    themeModeStorageKey: string;
    themeLayoutStorageKey: string;
    blockMenuOnNav: boolean;
    searchParams: URLSearchParams;
    pathname: string | null;
    getCurrentSearchParams: () => URLSearchParams;
    replaceUrlWithoutNavigation: (path: string, params: URLSearchParams) => void;
  },
) {
  const popups = useDocsShellPopups();
  const defaultLanguage = data.config.site.defaultLanguage;
  const configuredDefaultMode = data.config.site.ThemeModeDefault === "light" ? "light" : "dark";
  const initialThemeBaseId = data.config.site.ThemeDefault || data.layoutsConfig.layouts[0]?.id;

  const pathname = opts.pathname ?? "/";

  const themeState = useDocsShellThemeState({
    layouts: data.layoutsConfig.layouts,
    configuredDefaultMode,
    initialThemeBaseId,
    searchParams: opts.searchParams,
    themeModeStorageKey: opts.themeModeStorageKey,
    themeLayoutStorageKey: opts.themeLayoutStorageKey,
    pathname,
    getCurrentSearchParams: opts.getCurrentSearchParams,
    replaceUrlWithoutNavigation: opts.replaceUrlWithoutNavigation,
  });

  const languageState = useDocsShellLanguageState({
    defaultLanguage,
    availableLanguages: data.availableLanguages,
    languageStorageKey: opts.languageStorageKey,
    searchParams: opts.searchParams,
    pathname,
    getCurrentSearchParams: opts.getCurrentSearchParams,
    replaceUrlWithoutNavigation: opts.replaceUrlWithoutNavigation,
  });

  const navigationState = useDocsShellNavigationState({
    data,
    language: languageState.language,
    setSidebarOpen: popups.setSidebarOpen,
    setMenuOpen: popups.setMenuOpen,
    blockSidebarOpenOnNav: opts.blockMenuOnNav,
  });

  return {
    ...popups,
    ...themeState,
    ...languageState,
    ...navigationState,
  };
}
