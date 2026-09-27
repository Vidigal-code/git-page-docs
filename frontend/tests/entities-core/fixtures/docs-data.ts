import type { GitPageDocsConfig, LoadedDocsData, SiteConfig } from "@/entities/docs/model/types";

/** Minimal site: only the required fields, with a two-language menu. */
export function makeSite(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    name: "Test Site",
    defaultLanguage: "en",
    HideThemeSelector: false,
    ThemeDefault: "aurora-dark",
    rendering: "",
    langmenu: {
      en: { en: "English", pt: "Portuguese" },
      pt: { en: "Ingles", pt: "Portugues" },
    },
    ...overrides,
  };
}

/** Loaded docs data with an empty config; pass config and data overrides per test. */
export function makeDocsData(
  config: Partial<GitPageDocsConfig> = {},
  data: Partial<Omit<LoadedDocsData, "config">> = {},
): LoadedDocsData {
  return {
    config: {
      site: makeSite(),
      routes: [],
      "menus-header": [],
      ...config,
    },
    docs: [],
    pages: [],
    pathToPageMap: {},
    availableVersions: [],
    activeRepository: { source: "local" },
    availableLanguages: ["en", "pt"],
    layoutsConfig: { layouts: [] },
    themes: {},
    ...data,
  };
}
