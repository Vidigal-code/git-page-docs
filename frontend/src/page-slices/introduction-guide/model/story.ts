import type { GuideBlock, GuideSection } from "./types";

/** One scene of the scroll story, derived from a guide section. */
export interface StoryChapter {
  id: string;
  icon: string;
  /** Two-digit ordinal shown as the chapter numeral ("01"). */
  number: string;
  title: string;
  lead: string;
  /** The section's first paragraph, when it has one. */
  body?: string;
  /** Short items that summarize the section (list items, table keys or commands). */
  highlights: string[];
}

export const STORY_HIGHLIGHT_LIMIT = 4;
const ORDINAL_DIGITS = 2;
const CODE_COMMENT_PREFIX = "#";

export function formatOrdinal(position: number): string {
  return String(position).padStart(ORDINAL_DIGITS, "0");
}

function firstOfType(blocks: GuideBlock[], type: GuideBlock["type"]): GuideBlock | undefined {
  return blocks.find((block) => block.type === type);
}

function codeLines(code: string | undefined): string[] {
  return (code ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith(CODE_COMMENT_PREFIX));
}

/** Summary items: a list first, else the first column of a table, else the commands of a code block. */
function highlightsOf(blocks: GuideBlock[]): string[] {
  const list = firstOfType(blocks, "list")?.items;
  const tableKeys = firstOfType(blocks, "table")?.rows?.map((row) => row[0]).filter(Boolean);
  const commands = codeLines(firstOfType(blocks, "code")?.code);
  const source = [list, tableKeys, commands].find((items) => items && items.length > 0) ?? [];
  return source.slice(0, STORY_HIGHLIGHT_LIMIT);
}

export function buildStoryChapters(sections: readonly GuideSection[]): StoryChapter[] {
  return sections.map((section, index) => ({
    id: section.id,
    icon: section.icon,
    number: formatOrdinal(index + 1),
    title: section.title,
    lead: section.lead,
    body: firstOfType(section.blocks, "paragraph")?.text,
    highlights: highlightsOf(section.blocks),
  }));
}

/** Index of the chapter that owns a scroll progress value. */
export function chapterAt(progress: number, total: number): number {
  return Math.min(total - 1, Math.max(0, Math.floor(progress * total)));
}
