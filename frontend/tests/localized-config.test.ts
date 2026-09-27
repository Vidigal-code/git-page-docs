import { describe, expect, it, vi } from "vitest";
import { localizeConfig } from "@/entities/docs/api/config/localize-config";
import { SITE_CONFIG_DEFAULTS, withConfigDefaults } from "@/entities/docs/lib/with-config-defaults";
import { applyLanguageToggles, getLanguages } from "@/entities/docs/api/utils/route-utils";
import type { ContentTypeRouteConfig, GitPageDocsConfig } from "@/entities/docs/model/types";

const LEGACY_CONFIG = {
  site: { name: "Legacy", defaultLanguage: "en", rendering: "" },
  VersionControl: { versions: [] },
} as unknown as GitPageDocsConfig;

function withSite(overrides: Record<string, unknown>): GitPageDocsConfig {
  return { ...LEGACY_CONFIG, site: { ...LEGACY_CONFIG.site, ...overrides } } as unknown as GitPageDocsConfig;
}

function repoReader(files: Record<string, unknown>) {
  return vi.fn(async (relativePath: string) => files[relativePath] ?? null);
}

describe("localizeConfig + withConfigDefaults", () => {
  it("backfills a legacy config without langs/ from the shipped baseline, adding no language toggles", async () => {
    const config = withConfigDefaults(await localizeConfig(LEGACY_CONFIG, repoReader({})));

    expect(config.site.langmenu.en.menuOpen).toBe("Menu");
    expect(config.site.langmenu.pt.menuClose).toBe("Fechar");
    expect(config.site.languages).toBeUndefined();
    expect(config.site.supportedLanguages).toBeUndefined();
    expect(config.translations?.navigation?.next?.es).toBe("Siguiente");
  });

  it("the site baseline never carries language toggles or a supported list", () => {
    const baseline = SITE_CONFIG_DEFAULTS as unknown as Record<string, unknown>;
    expect(baseline.languages).toBeUndefined();
    expect(baseline.supportedLanguages).toBeUndefined();
  });

  it("loads only the languages config.json enables and never reads langs.json", async () => {
    const readJson = repoReader({
      "gitpagedocs/langs.json": { languages: ["en", "pt", "es"] },
      "gitpagedocs/langs/en.json": { langmenu: { menuOpen: "Bundle EN" } },
      "gitpagedocs/langs/pt.json": { langmenu: { menuOpen: "Bundle PT" } },
      "gitpagedocs/langs/es.json": { langmenu: { menuOpen: "Bundle ES" } },
    });
    const config = await localizeConfig(withSite({ languages: { en: true, pt: true, es: false } }), readJson);

    expect(config.site.langmenu.en.menuOpen).toBe("Bundle EN");
    expect(config.site.langmenu.pt.menuOpen).toBe("Bundle PT");
    expect(config.site.langmenu.es).toBeUndefined();
    expect(config.site.supportedLanguages).toEqual(["en", "pt"]);
    expect(config.site.languages).toEqual({ en: true, pt: true, es: false });
    expect(readJson).not.toHaveBeenCalledWith("gitpagedocs/langs.json");
    expect(readJson).not.toHaveBeenCalledWith("gitpagedocs/langs/es.json");
  });

  it("withConfigDefaults keeps a disabled language disabled", async () => {
    const config = withConfigDefaults(
      await localizeConfig(withSite({ languages: { en: true, pt: true, es: false } }), repoReader({})),
    );
    expect(config.site.languages).toEqual({ en: true, pt: true, es: false });
    // The baseline still backfills the strings of a disabled language (harmless: it is hidden from the selector).
    expect(typeof config.site.langmenu.es.menuOpen).toBe("string");
  });

  it("lets enabled bundles override the baseline and inline strings", async () => {
    const config = withConfigDefaults(
      await localizeConfig(
        withSite({ languages: { en: true, fr: true }, langmenu: { en: { menuOpen: "Inline menu" } } }),
        repoReader({
          "gitpagedocs/langs/en.json": { langmenu: { menuOpen: "Bundle menu" } },
          "gitpagedocs/langs/fr.json": {
            langmenu: { menuOpen: "Menu FR" },
            translations: { navigation: { next: "Suivant" } },
          },
        }),
      ),
    );

    expect(config.site.langmenu.en.menuOpen).toBe("Bundle menu");
    expect(config.site.langmenu.en.menuClose).toBe("Close");
    expect(config.site.langmenu.fr.menuOpen).toBe("Menu FR");
    expect(config.site.supportedLanguages).toEqual(["en", "fr"]);
    expect(config.translations?.navigation?.next).toMatchObject({ en: "Next", fr: "Suivant" });
  });

  it("keeps inline strings when an enabled bundle cannot be read", async () => {
    const config = withConfigDefaults(
      await localizeConfig(
        withSite({ languages: { en: true }, langmenu: { en: { menuOpen: "Inline menu" } } }),
        repoReader({}),
      ),
    );

    expect(config.site.langmenu.en.menuOpen).toBe("Inline menu");
  });
});

describe("available languages honour site.languages", () => {
  const routesMd = [
    { id: 1, path: { en: "docs/en/index.md", pt: "docs/pt/index.md", es: "docs/es/index.md" } },
  ] as ContentTypeRouteConfig[];

  it("getLanguages hides languages toggled off in config.json", () => {
    expect(getLanguages(withSite({ languages: { en: true, pt: true, es: false } }), routesMd, [], [], [], [])).toEqual(["en", "pt"]);
  });

  it("getLanguages keeps every content language when there are no toggles", () => {
    expect(getLanguages(LEGACY_CONFIG, routesMd, [], [], [], [])).toEqual(["en", "pt", "es"]);
  });

  it("getLanguages falls back to the default language when everything is disabled", () => {
    const config = withSite({ defaultLanguage: "pt", languages: { en: false, pt: false, es: false } });
    expect(getLanguages(config, routesMd, [], [], [], [])).toEqual(["pt"]);
  });

  it("applyLanguageToggles is the shared filter of the remote loader", () => {
    expect(applyLanguageToggles(withSite({ languages: { es: false } }), ["en", "es", "pt"])).toEqual(["en", "pt"]);
    expect(applyLanguageToggles(withSite({ defaultLanguage: "es", languages: { en: false, pt: false } }), ["en", "pt"])).toEqual(["en"]);
    expect(applyLanguageToggles(LEGACY_CONFIG, ["es"])).toEqual(["es"]);
  });
});
