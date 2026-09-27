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

/** Scroll progress (0..1) at which a chapter starts, is fully in, starts leaving and is gone. */
export interface ChapterWindow {
  start: number;
  enter: number;
  exit: number;
  end: number;
}

/** Keyframes for one chapter: strictly increasing inputs and the matching outputs. */
export interface ChapterTimeline {
  input: number[];
  opacity: number[];
  /** -1..1: 1 = still below (entering), 0 = in place, -1 = above (leaving). */
  shift: number[];
}

export const STORY_HIGHLIGHT_LIMIT = 4;
/** Share of a chapter's scroll slice spent fading in, and again fading out. */
const CHAPTER_FADE_SHARE = 0.2;
const ORDINAL_DIGITS = 2;
const PROGRESS_PRECISION = 1e4;
const CODE_COMMENT_PREFIX = "#";

function round(value: number): number {
  return Math.round(value * PROGRESS_PRECISION) / PROGRESS_PRECISION;
}

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

/** Equal scroll slices per chapter; the first is already in at 0 and the last stays in at 1. */
export function chapterWindow(index: number, total: number): ChapterWindow {
  const slice = 1 / total;
  const start = round(index * slice);
  const end = round((index + 1) * slice);
  const fade = slice * CHAPTER_FADE_SHARE;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  return {
    start,
    enter: isFirst ? start : round(start + fade),
    exit: isLast ? end : round(end - fade),
    end,
  };
}

/** Motion keyframes for a chapter; duplicate inputs (first/last chapter) are dropped. */
export function chapterTimeline(index: number, total: number): ChapterTimeline {
  const slice = chapterWindow(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const points: Array<[number, number, number]> = [];
  if (!isFirst) points.push([slice.start, 0, 1]);
  points.push([slice.enter, 1, 0], [slice.exit, 1, 0]);
  if (!isLast) points.push([slice.end, 0, -1]);
  const unique = points.filter((point, i) => i === 0 || point[0] > points[i - 1][0]);
  return {
    input: unique.map(([input]) => input),
    opacity: unique.map(([, opacity]) => opacity),
    shift: unique.map(([, , shift]) => shift),
  };
}

/** Index of the chapter that owns a scroll progress value. */
export function chapterAt(progress: number, total: number): number {
  return Math.min(total - 1, Math.max(0, Math.floor(progress * total)));
}
