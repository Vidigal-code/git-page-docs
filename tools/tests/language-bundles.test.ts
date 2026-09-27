import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LANGS_MANIFEST_PATH,
  applyLanguageBundles,
  buildLanguageToggles,
  filterEnabledLanguages,
  getEnabledLanguages,
  getLanguageBundlePath,
  getSiteLanguageToggles,
  isLanguageCode,
  isLanguageEnabled,
  loadConfigLanguageBundles,
  loadLanguageBundles,
  parseLanguageBundle,
  parseLanguageManifest,
  parseLanguageToggles,
  resolveBundleLanguages,
  splitLanguageBundles,
  type JsonReader,
  type LanguageBundleMap,
} from "../src/i18n/language-bundles";

const enBundle = {
  langmenu: { menuOpen: "Menu", pt: "Portuguese" },
  translations: { navigation: { next: "Next" }, footer: { footerLabel: "Project" } },
};
const ptBundle = {
  langmenu: { menuOpen: "Menu", pt: "Portugues" },
  translations: { navigation: { next: "Proximo" }, footer: { footerLabel: "Projeto" } },
};
const esBundle = {
  langmenu: { menuOpen: "Menú", pt: "Portugués" },
  translations: { navigation: { next: "Siguiente" }, footer: { footerLabel: "Proyecto" } },
};

function readerFor(files: Record<string, unknown>): JsonReader {
  return vi.fn(async (relativePath: string) => files[relativePath] ?? null);
}

describe("language codes and paths", () => {
  it("accepts plain and regional codes, rejects path-like input", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("pt-BR")).toBe(true);
    expect(isLanguageCode("zh_Hant")).toBe(true);
    expect(isLanguageCode("../etc")).toBe(false);
    expect(isLanguageCode("en/../x")).toBe(false);
    expect(isLanguageCode("")).toBe(false);
    expect(isLanguageCode(7)).toBe(false);
  });

  it("builds bundle paths under the langs dir", () => {
    expect(getLanguageBundlePath("es")).toBe("gitpagedocs/langs/es.json");
    expect(getLanguageBundlePath("es", "custom/i18n")).toBe("custom/i18n/es.json");
  });
});

describe("site.languages toggles (config.json)", () => {
  it("buildLanguageToggles enables every language in order", () => {
    const toggles = buildLanguageToggles(["en", "pt", "es"]);
    expect(toggles).toEqual({ en: true, pt: true, es: true });
    expect(Object.keys(toggles)).toEqual(["en", "pt", "es"]);
    expect(buildLanguageToggles(["en"], false)).toEqual({ en: false });
  });

  it("parseLanguageToggles keeps boolean flags of valid codes only", () => {
    expect(parseLanguageToggles({ en: true, pt: false, "bad/code": true, es: "yes", 7: true })).toEqual({ en: true, pt: false });
    expect(parseLanguageToggles(null)).toBeNull();
    expect(parseLanguageToggles(["en", "pt"])).toBeNull();
    expect(parseLanguageToggles({})).toBeNull();
    expect(parseLanguageToggles({ en: "true" })).toBeNull();
  });

  it("getEnabledLanguages returns the true flags in key order", () => {
    expect(getEnabledLanguages({ es: true, en: false, pt: true })).toEqual(["es", "pt"]);
    expect(getEnabledLanguages(null)).toEqual([]);
    expect(getEnabledLanguages(undefined)).toEqual([]);
  });

  it("isLanguageEnabled: only an explicit false disables", () => {
    expect(isLanguageEnabled(null, "en")).toBe(true);
    expect(isLanguageEnabled({ pt: false }, "pt")).toBe(false);
    expect(isLanguageEnabled({ pt: false }, "en")).toBe(true);
    expect(isLanguageEnabled({ en: true }, "fr")).toBe(true);
  });

  it("filterEnabledLanguages drops disabled codes and keeps content order", () => {
    expect(filterEnabledLanguages(["en", "pt", "es"], { es: false })).toEqual(["en", "pt"]);
    expect(filterEnabledLanguages(["es", "en"], { en: true, pt: true, es: true })).toEqual(["es", "en"]);
    expect(filterEnabledLanguages(["en", "pt"], null)).toEqual(["en", "pt"]);
  });

  it("filterEnabledLanguages never returns an empty list when content exists", () => {
    expect(filterEnabledLanguages(["en", "pt"], { en: false, pt: false }, "pt")).toEqual(["pt"]);
    expect(filterEnabledLanguages(["en", "pt"], { en: false, pt: false }, "es")).toEqual(["en"]);
    expect(filterEnabledLanguages([], { en: false })).toEqual([]);
  });

  it("getSiteLanguageToggles reads config.site.languages only", () => {
    expect(getSiteLanguageToggles({ site: { languages: { en: true, es: false } } })).toEqual({ en: true, es: false });
    expect(getSiteLanguageToggles({ site: { supportedLanguages: ["en"] } })).toBeNull();
    expect(getSiteLanguageToggles({})).toBeNull();
  });

  it("resolveBundleLanguages lists the enabled toggles, null without toggles", () => {
    expect(resolveBundleLanguages({ site: { languages: { en: true, pt: false, es: true } } })).toEqual(["en", "es"]);
    expect(resolveBundleLanguages({ site: { languages: { en: false } } })).toEqual([]);
    expect(resolveBundleLanguages({ site: {} })).toBeNull();
  });
});

describe("parseLanguageManifest (legacy langs.json)", () => {
  it("keeps valid, unique codes in order", () => {
    expect(parseLanguageManifest({ languages: ["en", "pt", "en", "bad/code", 3, "es"] })).toEqual({
      languages: ["en", "pt", "es"],
    });
  });

  it("rejects manifests without usable languages", () => {
    expect(parseLanguageManifest(null)).toBeNull();
    expect(parseLanguageManifest({ languages: "en" })).toBeNull();
    expect(parseLanguageManifest({ languages: ["!"] })).toBeNull();
  });
});

describe("parseLanguageBundle", () => {
  it("keeps only string-valued sections", () => {
    expect(
      parseLanguageBundle({
        langmenu: { a: "A", broken: 1 },
        translations: { navigation: { next: "Next" }, junk: "x", nested: { deep: { too: "far" } } },
      }),
    ).toEqual({ translations: { navigation: { next: "Next" } } });
    expect(parseLanguageBundle({ langmenu: { a: "A" } })).toEqual({ langmenu: { a: "A" } });
  });

  it("rejects non-objects", () => {
    expect(parseLanguageBundle("nope")).toBeNull();
    expect(parseLanguageBundle([])).toBeNull();
  });
});

describe("loadLanguageBundles", () => {
  it("loads exactly the given languages and never touches langs.json", async () => {
    const readJson = readerFor({
      "gitpagedocs/langs.json": { languages: ["en", "pt", "es"] },
      "gitpagedocs/langs/en.json": enBundle,
      "gitpagedocs/langs/pt.json": ptBundle,
      "gitpagedocs/langs/es.json": esBundle,
    });
    const bundles = await loadLanguageBundles(readJson, { languages: ["en", "pt"] });
    expect(Object.keys(bundles ?? {})).toEqual(["en", "pt"]);
    expect(readJson).not.toHaveBeenCalledWith("gitpagedocs/langs.json");
    expect(readJson).not.toHaveBeenCalledWith("gitpagedocs/langs/es.json");
  });

  it("an empty language list loads nothing", async () => {
    const readJson = readerFor({ "gitpagedocs/langs/en.json": enBundle });
    expect(await loadLanguageBundles(readJson, { languages: [] })).toBeNull();
    expect(readJson).not.toHaveBeenCalled();
  });

  it("skips path-like codes in the requested list", async () => {
    const readJson = readerFor({ "gitpagedocs/langs/en.json": enBundle });
    expect(await loadLanguageBundles(readJson, { languages: ["../etc", "en"] })).toEqual({ en: enBundle });
    expect(readJson).toHaveBeenCalledTimes(1);
  });

  it("returns null without a list and without a legacy manifest (inline config)", async () => {
    const readJson = readerFor({});
    expect(await loadLanguageBundles(readJson)).toBeNull();
    expect(readJson).toHaveBeenCalledWith(DEFAULT_LANGS_MANIFEST_PATH);
  });

  it("falls back to the legacy manifest and skips bundles it cannot read", async () => {
    const readJson = readerFor({
      "gitpagedocs/langs.json": { languages: ["en", "pt", "fr"] },
      "gitpagedocs/langs/en.json": enBundle,
      "gitpagedocs/langs/pt.json": ptBundle,
    });

    const bundles = await loadLanguageBundles(readJson);

    expect(Object.keys(bundles ?? {})).toEqual(["en", "pt"]);
    expect(bundles?.en).toEqual(enBundle);
    expect(readJson).toHaveBeenCalledWith("gitpagedocs/langs/fr.json");
  });

  it("returns null when no requested bundle can be read", async () => {
    const readJson = readerFor({ "gitpagedocs/langs.json": { languages: ["en"] } });
    expect(await loadLanguageBundles(readJson)).toBeNull();
  });

  it("honours custom manifest and directory locations", async () => {
    const readJson = readerFor({
      "docs/i18n.json": { languages: ["en"] },
      "docs/i18n/en.json": enBundle,
    });
    const bundles = await loadLanguageBundles(readJson, { manifestPath: "docs/i18n.json", langsDir: "docs/i18n" });
    expect(bundles).toEqual({ en: enBundle });
  });
});

describe("loadConfigLanguageBundles", () => {
  it("loads the enabled site.languages and skips the disabled ones", async () => {
    const readJson = readerFor({
      "gitpagedocs/langs.json": { languages: ["en", "pt", "es"] },
      "gitpagedocs/langs/en.json": enBundle,
      "gitpagedocs/langs/pt.json": ptBundle,
      "gitpagedocs/langs/es.json": esBundle,
    });
    const bundles = await loadConfigLanguageBundles({ site: { languages: { en: true, es: false, pt: true } } }, readJson);
    expect(Object.keys(bundles ?? {})).toEqual(["en", "pt"]);
    expect(readJson).not.toHaveBeenCalledWith("gitpagedocs/langs/es.json");
    expect(readJson).not.toHaveBeenCalledWith("gitpagedocs/langs.json");
  });

  it("falls back to the legacy manifest for configs without toggles", async () => {
    const readJson = readerFor({
      "gitpagedocs/langs.json": { languages: ["es"] },
      "gitpagedocs/langs/es.json": esBundle,
    });
    expect(await loadConfigLanguageBundles({ site: {} }, readJson)).toEqual({ es: esBundle });
  });

  it("passes the directory options through", async () => {
    const readJson = readerFor({ "docs/i18n/en.json": enBundle });
    expect(await loadConfigLanguageBundles({ site: { languages: { en: true } } }, readJson, { langsDir: "docs/i18n" })).toEqual({
      en: enBundle,
    });
  });
});

describe("applyLanguageBundles", () => {
  const bundles: LanguageBundleMap = { en: enBundle, pt: ptBundle };

  it("returns the config untouched without bundles", () => {
    const config = { site: { name: "X" } };
    expect(applyLanguageBundles(config, null)).toBe(config);
    expect(applyLanguageBundles(config, {})).toBe(config);
  });

  it("folds bundles into the legacy inline shape", () => {
    const config = applyLanguageBundles({ site: { name: "X" } }, bundles);

    expect(config.site?.langmenu).toEqual({ en: enBundle.langmenu, pt: ptBundle.langmenu });
    expect(config.site?.supportedLanguages).toEqual(["en", "pt"]);
    expect(config.translations).toEqual({
      navigation: { next: { en: "Next", pt: "Proximo" } },
      footer: { footerLabel: { en: "Project", pt: "Projeto" } },
    });
    expect((config.site as { name: string }).name).toBe("X");
  });

  it("keeps the site.languages toggles on the folded config", () => {
    const folded = applyLanguageBundles({ site: { languages: { en: true, es: false } } }, { en: enBundle });
    expect(folded.site?.languages).toEqual({ en: true, es: false });
    expect(folded.site?.supportedLanguages).toEqual(["en"]);
  });

  it("lets bundles win over inline strings while keeping inline-only keys", () => {
    const config = applyLanguageBundles(
      {
        site: {
          langmenu: { en: { menuOpen: "Old", onlyInline: "Kept" }, es: { menuOpen: "Menu" } },
          supportedLanguages: ["es"],
        },
        translations: {
          navigation: { next: { en: "Old next", es: "Siguiente" }, previous: { en: "Previous" } },
        },
      },
      bundles,
    );

    expect(config.site?.langmenu?.en).toEqual({ menuOpen: "Menu", pt: "Portuguese", onlyInline: "Kept" });
    expect(config.site?.langmenu?.es).toEqual({ menuOpen: "Menu" });
    expect(config.site?.supportedLanguages).toEqual(["en", "pt"]);
    expect(config.translations?.navigation.next).toEqual({ en: "Next", es: "Siguiente", pt: "Proximo" });
    expect(config.translations?.navigation.previous).toEqual({ en: "Previous" });
  });

  it("does not mutate the input config", () => {
    const inline = { site: { langmenu: { en: { menuOpen: "Old" } } }, translations: { navigation: { next: { en: "Old" } } } };
    const snapshot = JSON.stringify(inline);
    applyLanguageBundles(inline, bundles);
    expect(JSON.stringify(inline)).toBe(snapshot);
  });
});

describe("splitLanguageBundles", () => {
  it("round-trips with applyLanguageBundles", () => {
    const langmenu = { en: enBundle.langmenu, pt: ptBundle.langmenu };
    const translations = {
      navigation: { next: { en: "Next", pt: "Proximo" } },
      footer: { footerLabel: { en: "Project", pt: "Projeto" } },
    };

    const bundles = splitLanguageBundles(["en", "pt"], langmenu, translations);
    expect(bundles).toEqual({ en: enBundle, pt: ptBundle });

    const rebuilt = applyLanguageBundles({}, bundles);
    expect(rebuilt.site?.langmenu).toEqual(langmenu);
    expect(rebuilt.translations).toEqual(translations);
  });

  it("omits sections a language has no strings for", () => {
    const bundles = splitLanguageBundles(["en", "fr"], { en: { a: "A" } }, { footer: { footerLabel: { en: "P" } } });
    expect(bundles.fr).toEqual({ langmenu: {}, translations: {} });
  });
});
