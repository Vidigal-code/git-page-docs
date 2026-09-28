/** One rendered character of an animated title, with a key that stays stable across renders. */
export interface Glyph {
  readonly key: string;
  readonly char: string;
}

/**
 * Splits text into user-perceived characters (grapheme clusters), so accented
 * letters and emoji animate as one glyph instead of breaking apart.
 */
export function splitGlyphs(text: string): Glyph[] {
  const chars =
    typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment)
      : Array.from(text);
  return chars.map((char, index) => ({ key: `${index}-${char}`, char }));
}

/** A word of an animated title: its glyphs animate one by one, but the word never breaks across lines. */
export interface GlyphWord {
  readonly key: string;
  readonly glyphs: Glyph[];
}

const WORD_SEPARATOR = " ";

/** Splits a title into words of glyphs; empty runs from repeated spaces are dropped. */
export function splitWords(text: string): GlyphWord[] {
  return text
    .split(WORD_SEPARATOR)
    .filter(Boolean)
    .map((word, index) => ({ key: `${index}-${word}`, glyphs: splitGlyphs(word) }));
}
