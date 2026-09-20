/**
 * @file token-style.ts
 * @description Converts a Shiki themed token into inline React styles
 * (color + TextMate font-style bitmask).
 */
import type { CSSProperties } from "react";
import type { ThemedToken } from "shiki";

const FONT_STYLE_ITALIC = 1;
const FONT_STYLE_BOLD = 2;
const FONT_STYLE_UNDERLINE = 4;

export function toTokenStyle(token: ThemedToken): CSSProperties | undefined {
  const fontStyle = token.fontStyle ?? 0;
  const style: CSSProperties = {};
  if (token.color) style.color = token.color;
  if (fontStyle & FONT_STYLE_ITALIC) style.fontStyle = "italic";
  if (fontStyle & FONT_STYLE_BOLD) style.fontWeight = 600;
  if (fontStyle & FONT_STYLE_UNDERLINE) style.textDecoration = "underline";
  return Object.keys(style).length > 0 ? style : undefined;
}
