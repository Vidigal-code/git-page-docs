import type { LanguageCode } from "@/entities/docs";

/** A string translated into the supported languages, as authored in the content JSON. */
export type LocalizedText = Record<LanguageCode, string>;

/** A table/inline cell that is either language-agnostic (code, literal) or localized. */
export type LocalizedCell = string | LocalizedText;

export type GuideBlockType = "paragraph" | "list" | "table" | "code" | "callout";

/** A content block AFTER it has been resolved to a single active language. */
export interface GuideBlock {
  type: GuideBlockType;
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  code?: string;
  lang?: string;
  tone?: "info" | "warn";
}

/** A guide section AFTER resolution. */
export interface GuideSection {
  id: string;
  icon: string;
  title: string;
  lead: string;
  keywords: string[];
  blocks: GuideBlock[];
}

export interface GuideHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  install: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface GuideUi {
  searchPlaceholder: string;
  searchEmpty: string;
  onThisPage: string;
  sectionsLabel: string;
  backToSearch: string;
}

/** The whole guide AFTER resolution — what the UI renders. */
export interface GuideContent {
  hero: GuideHero;
  ui: GuideUi;
  sections: GuideSection[];
}
