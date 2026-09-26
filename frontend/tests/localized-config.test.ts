import { describe, expect, it } from "vitest";
import { localizeConfig } from "@/entities/docs/api/config/localize-config";
import { withConfigDefaults } from "@/entities/docs/lib/with-config-defaults";
import type { GitPageDocsConfig } from "@/entities/docs/model/types";

const LEGACY_CONFIG = {
  site: { name: "Legacy", defaultLanguage: "en", rendering: "" },
  VersionControl: { versions: [] },
} as unknown as GitPageDocsConfig;

function repoReader(files: Record<string, unknown>) {
  return async (relativePath: string) => files[relativePath] ?? null;
}

describe("localizeConfig + withConfigDefaults", () => {
  it("backfills a legacy config without langs/ from the shipped baseline", async () => {
    const config = withConfigDefaults(await localizeConfig(LEGACY_CONFIG, repoReader({})));

    expect(config.site.langmenu.en.menuOpen).toBe("Menu");
    expect(config.site.langmenu.pt.menuClose).toBe("Fechar");
    expect(config.site.supportedLanguages).toEqual(["en", "pt", "es"]);
    expect(config.translations?.navigation?.next?.es).toBe("Siguiente");
  });

  it("lets a repository's langs/ files override the baseline and inline strings", async () => {
    const inlineConfig = {
      ...LEGACY_CONFIG,
      site: { ...LEGACY_CONFIG.site, langmenu: { en: { menuOpen: "Inline menu" } } },
    } as unknown as GitPageDocsConfig;
    const config = withConfigDefaults(
      await localizeConfig(
        inlineConfig,
        repoReader({
          "gitpagedocs/langs.json": { languages: ["en", "fr"] },
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

  it("keeps inline strings when the manifest exists but no bundle can be read", async () => {
    const inlineConfig = {
      ...LEGACY_CONFIG,
      site: { ...LEGACY_CONFIG.site, langmenu: { en: { menuOpen: "Inline menu" } } },
    } as unknown as GitPageDocsConfig;
    const config = withConfigDefaults(
      await localizeConfig(inlineConfig, repoReader({ "gitpagedocs/langs.json": { languages: ["en"] } })),
    );

    expect(config.site.langmenu.en.menuOpen).toBe("Inline menu");
  });
});
