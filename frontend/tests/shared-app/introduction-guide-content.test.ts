import { describe, expect, it, vi } from "vitest";

// The docs barrel re-exports a .tsx component; the guide content only needs
// the translation helper, so serve the real one in place of the barrel.
vi.mock("@/entities/docs", async () => {
  const actual = await vi.importActual<typeof import("@/entities/docs/lib/i18n/resolve-translation")>(
    "@/entities/docs/lib/i18n/resolve-translation",
  );
  return { resolveTranslation: actual.resolveTranslation };
});

import rawGuide from "@/page-slices/introduction-guide/content/guide.content.json";
import { getGuideContent } from "@/page-slices/introduction-guide/content";
import { sectionMatchesQuery } from "@/page-slices/introduction-guide/model/use-guide-search";
import type { GuideSection } from "@/page-slices/introduction-guide/model/types";

type Localized = Record<string, string>;
interface RawBlock {
  type: string;
  text?: Localized;
  items?: Array<string | Localized>;
  headers?: Record<string, string[]>;
  rows?: Array<Array<string | Localized>>;
  code?: string;
  lang?: string;
  tone?: string;
}
interface RawSection {
  id: string;
  icon: string;
  title: Localized;
  lead: Localized;
  keywords: string[];
  blocks: RawBlock[];
}
const raw = rawGuide as unknown as {
  hero: Record<string, Localized | string>;
  ui: Record<string, Localized>;
  sections: RawSection[];
};

const pick = (value: Localized | string | undefined, language: string): string =>
  typeof value === "string" ? value : (value?.[language] ?? value?.en ?? "");

const LANGUAGES = ["en", "pt", "es"] as const;

describe("getGuideContent", () => {
  it.each(LANGUAGES)("resolves hero, ui and every section to %s", (language) => {
    const content = getGuideContent(language);

    expect(content.hero.title).toBe(pick(raw.hero.title, language));
    expect(content.hero.subtitle).toBe(pick(raw.hero.subtitle, language));
    expect(content.hero.install).toBe(pick(raw.hero.install, language));
    expect(content.ui.searchPlaceholder).toBe(raw.ui.searchPlaceholder[language]);
    expect(content.ui.backToSearch).toBe(raw.ui.backToSearch[language]);

    expect(content.sections.map((section) => section.id)).toEqual(raw.sections.map((section) => section.id));
    content.sections.forEach((section, index) => {
      const source = raw.sections[index];
      expect(section.icon).toBe(source.icon);
      expect(section.keywords).toEqual(source.keywords);
      expect(section.title).toBe(source.title[language]);
      expect(section.lead).toBe(source.lead[language]);
      expect(section.blocks).toHaveLength(source.blocks.length);
    });
  });

  it("resolves each block type: localized text, cells, headers, code and tone", () => {
    const content = getGuideContent("pt");
    const flatRaw = raw.sections.flatMap((section) => section.blocks);
    const flat = content.sections.flatMap((section) => section.blocks);
    expect(flat).toHaveLength(flatRaw.length);

    const seen = new Set<string>();
    flat.forEach((block, index) => {
      const source = flatRaw[index];
      seen.add(source.type);
      expect(block.type).toBe(source.type);
      expect(block.text).toBe(source.text ? pick(source.text, "pt") : undefined);
      expect(block.items).toEqual(source.items?.map((item) => pick(item, "pt")));
      expect(block.headers).toEqual(source.headers ? (source.headers.pt ?? source.headers.en) : undefined);
      expect(block.rows).toEqual(source.rows?.map((row) => row.map((cell) => pick(cell, "pt"))));
      expect(block.code).toBe(source.code);
      expect(block.lang).toBe(source.lang);
      expect(block.tone).toBe(source.tone);
    });
    // The authored guide exercises every renderer branch.
    expect([...seen].sort()).toEqual(["callout", "code", "list", "paragraph", "table"]);
  });

  it("falls back to English for an unsupported language", () => {
    expect(getGuideContent("de")).toEqual(getGuideContent("en"));
  });
});

describe("sectionMatchesQuery", () => {
  const section: GuideSection = {
    id: "cli",
    icon: "FiTerminal",
    title: "Command Line",
    lead: "Scaffold and build from the terminal.",
    keywords: ["cli", "npx"],
    blocks: [],
  };

  it("matches everything for a blank query", () => {
    expect(sectionMatchesQuery(section, "")).toBe(true);
    expect(sectionMatchesQuery(section, "   ")).toBe(true);
  });

  it("matches title, lead and keywords case-insensitively", () => {
    expect(sectionMatchesQuery(section, "COMMAND")).toBe(true);
    expect(sectionMatchesQuery(section, "terminal")).toBe(true);
    expect(sectionMatchesQuery(section, "npx")).toBe(true);
  });

  it("requires every term to match", () => {
    expect(sectionMatchesQuery(section, "command terminal")).toBe(true);
    expect(sectionMatchesQuery(section, "command docker")).toBe(false);
    expect(sectionMatchesQuery(section, "docker")).toBe(false);
  });
});
