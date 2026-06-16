import { resolveTranslation, type LanguageCode } from "@/entities/docs";
import type {
  GuideBlock,
  GuideBlockType,
  GuideContent,
  GuideSection,
  LocalizedCell,
  LocalizedText,
} from "../model/types";
import rawGuide from "./guide.content.json";

/** Raw (multi-language) shapes as authored in guide.content.json. */
interface RawBlock {
  type: GuideBlockType;
  text?: LocalizedText;
  items?: LocalizedCell[];
  headers?: Record<string, string[]>;
  rows?: LocalizedCell[][];
  code?: string;
  lang?: string;
  tone?: "info" | "warn";
}
interface RawSection {
  id: string;
  icon: string;
  title: LocalizedText;
  lead: LocalizedText;
  keywords: string[];
  blocks: RawBlock[];
}
interface RawGuide {
  hero: Record<string, LocalizedText | string>;
  ui: Record<string, LocalizedText>;
  sections: RawSection[];
}

const guide = rawGuide as unknown as RawGuide;

/** Resolve a localized value to the active language, falling back to English. */
function pickText(value: LocalizedText, language: LanguageCode): string {
  return resolveTranslation(value, language, value.en ?? "");
}

/** A cell is either language-agnostic (literal/code) or localized. */
function pickCell(cell: LocalizedCell, language: LanguageCode): string {
  return typeof cell === "string" ? cell : pickText(cell, language);
}

/** Hero/ui entries may be a plain string (e.g. the install command) or localized. */
function pickField(value: LocalizedText | string | undefined, language: LanguageCode): string {
  if (value === undefined) return "";
  return typeof value === "string" ? value : pickText(value, language);
}

function resolveBlock(block: RawBlock, language: LanguageCode): GuideBlock {
  return {
    type: block.type,
    text: block.text ? pickText(block.text, language) : undefined,
    items: block.items?.map((item) => pickCell(item, language)),
    headers: block.headers ? (block.headers[language] ?? block.headers.en) : undefined,
    rows: block.rows?.map((row) => row.map((cell) => pickCell(cell, language))),
    code: block.code,
    lang: block.lang,
    tone: block.tone,
  };
}

function resolveSection(section: RawSection, language: LanguageCode): GuideSection {
  return {
    id: section.id,
    icon: section.icon,
    title: pickText(section.title, language),
    lead: pickText(section.lead, language),
    keywords: section.keywords,
    blocks: section.blocks.map((block) => resolveBlock(block, language)),
  };
}

/** Returns the entire guide resolved to a single language — the only public entry point. */
export function getGuideContent(language: LanguageCode): GuideContent {
  return {
    hero: {
      eyebrow: pickField(guide.hero.eyebrow, language),
      title: pickField(guide.hero.title, language),
      subtitle: pickField(guide.hero.subtitle, language),
      install: pickField(guide.hero.install, language),
      ctaPrimary: pickField(guide.hero.ctaPrimary, language),
      ctaSecondary: pickField(guide.hero.ctaSecondary, language),
    },
    ui: {
      searchPlaceholder: pickText(guide.ui.searchPlaceholder, language),
      searchEmpty: pickText(guide.ui.searchEmpty, language),
      onThisPage: pickText(guide.ui.onThisPage, language),
      sectionsLabel: pickText(guide.ui.sectionsLabel, language),
    },
    sections: guide.sections.map((section) => resolveSection(section, language)),
  };
}
