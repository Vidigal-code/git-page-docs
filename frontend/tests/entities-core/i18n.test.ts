import { describe, expect, it } from "vitest";
import { getLangMenuLabelFromMenu, getLanguageLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";

const langMenu = {
  en: { en: "English", pt: "Portuguese", footerLabel: "Project" },
  pt: { pt: "Portugues", footerLabel: "Projeto", empty: "" },
};

describe("getLanguageLabelFromMenu", () => {
  it("reads the label from the selected language, then English, then upper-cases the code", () => {
    expect(getLanguageLabelFromMenu(langMenu, "pt", "pt")).toBe("Portugues");
    expect(getLanguageLabelFromMenu(langMenu, "pt", "en")).toBe("English");
    expect(getLanguageLabelFromMenu(langMenu, "es", "pt")).toBe("Portuguese");
    expect(getLanguageLabelFromMenu(langMenu, "pt", "es")).toBe("ES");
    expect(getLanguageLabelFromMenu({}, "en", "fr")).toBe("FR");
  });
});

describe("getLangMenuLabelFromMenu", () => {
  it("reads the key from the selected language, treating empty strings as missing", () => {
    expect(getLangMenuLabelFromMenu(langMenu, "pt", "footerLabel", "Fallback")).toBe("Projeto");
    expect(getLangMenuLabelFromMenu(langMenu, "es", "footerLabel", "Fallback")).toBe("Project");
    expect(getLangMenuLabelFromMenu(langMenu, "pt", "empty", "Fallback")).toBe("Fallback");
    expect(getLangMenuLabelFromMenu(langMenu, "pt", "missing", "Fallback")).toBe("Fallback");
    expect(getLangMenuLabelFromMenu({}, "en", "footerLabel", "Fallback")).toBe("Fallback");
  });
});

describe("resolveTranslation", () => {
  it("prefers the language, then English, then the fallback", () => {
    expect(resolveTranslation({ en: "Next", pt: "Proximo" }, "pt", "F")).toBe("Proximo");
    expect(resolveTranslation({ en: "Next" }, "pt", "F")).toBe("Next");
    expect(resolveTranslation({ es: "Siguiente" }, "pt", "F")).toBe("F");
    expect(resolveTranslation(undefined, "pt", "F")).toBe("F");
  });
});
