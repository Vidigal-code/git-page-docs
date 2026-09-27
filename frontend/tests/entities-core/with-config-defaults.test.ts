import { describe, expect, it } from "vitest";
import {
  SITE_CONFIG_DEFAULTS,
  TRANSLATIONS_CONFIG_DEFAULTS,
  withConfigDefaults,
} from "@/entities/docs/lib/with-config-defaults";
import type { GitPageDocsConfig, SiteConfig } from "@/entities/docs/model/types";

function config(site: Partial<SiteConfig> | undefined, extra: Partial<GitPageDocsConfig> = {}): GitPageDocsConfig {
  return { site: site as SiteConfig, routes: [{ id: 1, path: { en: "a.md" } }], "menus-header": [], ...extra };
}

describe("withConfigDefaults", () => {
  it("backfills missing site fields from the baseline while keeping explicit values", () => {
    const result = withConfigDefaults(config({ name: "Mine", ThemeDefault: "carbon-dark" }));
    expect(result.site.name).toBe("Mine");
    expect(result.site.ThemeDefault).toBe("carbon-dark");
    expect(result.site.FooterLinkName).toBe(SITE_CONFIG_DEFAULTS.FooterLinkName);
    expect(result.site.langmenu.en.footerLabel).toBe("Project");
  });

  it("merges nested langmenu entries key by key", () => {
    const result = withConfigDefaults(config({ langmenu: { pt: { footerLabel: "Meu projeto" } } }));
    expect(result.site.langmenu.pt.footerLabel).toBe("Meu projeto");
    expect(result.site.langmenu.pt.en).toBe(SITE_CONFIG_DEFAULTS.langmenu.pt.en);
    expect(result.site.langmenu.en).toEqual(SITE_CONFIG_DEFAULTS.langmenu.en);
  });

  it("replaces arrays wholesale and ignores undefined overrides", () => {
    const tracks = [{ url: "a.mp3", type: "mp3" }];
    const result = withConfigDefaults(config({ audioTracks: tracks, FooterLinkName: undefined }));
    expect(result.site.audioTracks).toBe(tracks);
    expect(result.site.FooterLinkName).toBe(SITE_CONFIG_DEFAULTS.FooterLinkName);
  });

  it("uses the full baseline when the site section is missing", () => {
    expect(withConfigDefaults(config(undefined)).site).toEqual(SITE_CONFIG_DEFAULTS);
  });

  it("backfills translations recursively without touching routes or menus", () => {
    const translations = { navigation: { next: { en: "Forward" } } };
    const result = withConfigDefaults(config({}, { translations, "routes-md": [{ id: 1, path: { en: "a.md" } }] }));
    expect(result.translations?.navigation?.next?.en).toBe("Forward");
    expect(result.translations?.navigation?.next?.pt).toBe(TRANSLATIONS_CONFIG_DEFAULTS.navigation?.next?.pt);
    expect(result.translations?.navigation?.previous).toEqual(TRANSLATIONS_CONFIG_DEFAULTS.navigation?.previous);
    expect(result.translations?.footer).toEqual(TRANSLATIONS_CONFIG_DEFAULTS.footer);
    expect(result.routes).toEqual([{ id: 1, path: { en: "a.md" } }]);
    expect(result["routes-md"]).toEqual([{ id: 1, path: { en: "a.md" } }]);
    expect(result["menus-header"]).toEqual([]);
  });

  it("does not mutate the baseline objects", () => {
    const siteBefore = JSON.stringify(SITE_CONFIG_DEFAULTS);
    const translationsBefore = JSON.stringify(TRANSLATIONS_CONFIG_DEFAULTS);
    withConfigDefaults(config({ langmenu: { en: { footerLabel: "X" } }, name: "Y" }, { translations: { footer: { footerLabel: { en: "Z" } } } }));
    expect(JSON.stringify(SITE_CONFIG_DEFAULTS)).toBe(siteBefore);
    expect(JSON.stringify(TRANSLATIONS_CONFIG_DEFAULTS)).toBe(translationsBefore);
  });
});

describe("withConfigDefaults with the compact config format", () => {
  it("expands site.icons into the flat Icon* keys the viewer reads", () => {
    const config = {
      site: {
        name: "Compact",
        icons: {
          defaults: { reactIcon: true, colorDark: "White", colorLight: "black", size: "25px" },
          NavMenuOpen: { tag: "FaBars", size: "22px" },
        },
      },
    } as unknown as GitPageDocsConfig;

    const site = withConfigDefaults(config).site as unknown as Record<string, unknown>;

    expect(site).not.toHaveProperty("icons");
    expect(site.IconNavMenuOpenReactIconesTag).toBe("FaBars");
    expect(site.IconNavMenuOpenReactIconesTagSize).toBe("22px");
    expect(site.IconNavMenuOpenReactIconesTagColorDark).toBe("White");
  });

  it("applies routeDefaults under every route, keeping route values", () => {
    const config = {
      site: { name: "Routes" },
      routeDefaults: { titleCss: "font-weight: 700;", marginTop: "" },
      "routes-md": [{ id: 1, marginTop: "8px" }, { id: 2 }],
    } as unknown as GitPageDocsConfig;

    const merged = withConfigDefaults(config) as unknown as Record<string, unknown>;

    expect(merged).not.toHaveProperty("routeDefaults");
    expect(merged["routes-md"]).toEqual([
      { id: 1, titleCss: "font-weight: 700;", marginTop: "8px" },
      { id: 2, titleCss: "font-weight: 700;", marginTop: "" },
    ]);
  });

  it("keeps a flat 0.0.x config working unchanged", () => {
    const config = { site: { name: "Flat", IconNavMenuOpenReactIconesTag: "FaBars" } } as unknown as GitPageDocsConfig;
    const site = withConfigDefaults(config).site as unknown as Record<string, unknown>;
    expect(site.IconNavMenuOpenReactIconesTag).toBe("FaBars");
  });
});
