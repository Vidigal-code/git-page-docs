import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LANGS_MANIFEST_PATH,
  applyLanguageBundles,
  buildLanguageManifest,
  getLanguageBundlePath,
  isLanguageCode,
  loadLanguageBundles,
  parseLanguageBundle,
  parseLanguageManifest,
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

describe("parseLanguageManifest", () => {
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
  it("returns null without a manifest (legacy inline config)", async () => {
    const readJson = readerFor({});
    expect(await loadLanguageBundles(readJson)).toBeNull();
    expect(readJson).toHaveBeenCalledWith(DEFAULT_LANGS_MANIFEST_PATH);
  });

  it("loads every listed bundle and skips missing ones", async () => {
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

  it("returns null when no listed bundle can be read", async () => {
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

  it("builds a manifest copy of the language list", () => {
    const languages = ["en", "pt"];
    const manifest = buildLanguageManifest(languages);
    expect(manifest).toEqual({ languages: ["en", "pt"] });
    expect(manifest.languages).not.toBe(languages);
  });
});
