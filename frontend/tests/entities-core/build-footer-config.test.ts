import { describe, expect, it } from "vitest";
import { buildFooterConfigFromData } from "@/entities/docs/lib/footer/build-footer-config";
import { PROJECT_FOOTER_URL } from "@/shared/config/constants";
import { makeDocsData, makeSite } from "./fixtures/docs-data";

describe("buildFooterConfigFromData", () => {
  it("uses the built-in defaults for a bare site", () => {
    expect(buildFooterConfigFromData(makeDocsData(), "en")).toEqual({
      projectLabel: "Project",
      linkName: "GitPageDocs",
      linkUrl: PROJECT_FOOTER_URL,
      dateMode: "browser",
      dateCustom: "",
    });
  });

  it("resolves the label from translations, then the langmenu, then the default", () => {
    const withTranslations = makeDocsData({
      translations: { footer: { footerLabel: { pt: "Projeto" } } },
      site: makeSite({ langmenu: { en: { footerLabel: "Menu label" } } }),
    });
    expect(buildFooterConfigFromData(withTranslations, "pt").projectLabel).toBe("Projeto");
    expect(buildFooterConfigFromData(withTranslations, "es").projectLabel).toBe("Menu label");

    const withMenu = makeDocsData({ site: makeSite({ langmenu: { pt: { footerLabel: "Projeto" }, en: { footerLabel: "Project (en)" } } }) });
    expect(buildFooterConfigFromData(withMenu, "pt").projectLabel).toBe("Projeto");
    expect(buildFooterConfigFromData(withMenu, "es").projectLabel).toBe("Project (en)");
  });

  it("trims the link name and url, preferring the explicit footer url over project links", () => {
    const site = makeSite({ FooterLinkName: "  Docs  ", FooterLinkUrl: " https://footer.example ", ProjectLink: "https://site.example" });
    const data = makeDocsData({ site }, { activeVersion: { id: "v1", path: "v1", ProjectLink: "https://version.example" } });
    expect(buildFooterConfigFromData(data, "en")).toMatchObject({ linkName: "Docs", linkUrl: "https://footer.example" });
  });

  it("falls back to the active version link, then the site link, then the project url", () => {
    const versioned = makeDocsData(
      { site: makeSite({ ProjectLink: "https://site.example" }) },
      { activeVersion: { id: "v1", path: "v1", ProjectLink: " https://version.example " } },
    );
    expect(buildFooterConfigFromData(versioned, "en").linkUrl).toBe("https://version.example");
    expect(buildFooterConfigFromData(makeDocsData({ site: makeSite({ ProjectLink: "https://site.example" }) }), "en").linkUrl).toBe(
      "https://site.example",
    );
    expect(buildFooterConfigFromData(makeDocsData({ site: makeSite({ ProjectLink: "  " }) }), "en").linkUrl).toBe(PROJECT_FOOTER_URL);
  });

  it("keeps only the known date modes and trims the custom date", () => {
    expect(buildFooterConfigFromData(makeDocsData({ site: makeSite({ FooterDateMode: "year" }) }), "en").dateMode).toBe("year");
    const custom = buildFooterConfigFromData(makeDocsData({ site: makeSite({ FooterDateMode: "custom", FooterDateCustom: " 2024 " }) }), "en");
    expect(custom).toMatchObject({ dateMode: "custom", dateCustom: "2024" });
    const unknownMode = "epoch" as unknown as "year";
    expect(buildFooterConfigFromData(makeDocsData({ site: makeSite({ FooterDateMode: unknownMode }) }), "en").dateMode).toBe("browser");
  });
});
