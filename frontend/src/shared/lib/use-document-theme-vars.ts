/**
 * @file use-document-theme-vars.ts
 * @description Mirrors the active shell palette onto <html>, keeping
 * document-level surfaces — the window scrollbar above all — in step with the
 * theme on live theme switches. Runtime counterpart of ThemePreloadScript,
 * which applies the cached palette to :root before first paint; like it, this
 * only ever writes (no cleanup), so navigation between shells never flashes
 * back to the default palette.
 */
"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";

export function useDocumentThemeVars(themeVars: CSSProperties | undefined): void {
  useEffect(() => {
    if (!themeVars) return;
    const rootStyle = document.documentElement.style;
    for (const [name, value] of Object.entries(themeVars)) {
      if (name.startsWith("--") && typeof value === "string" && value) {
        rootStyle.setProperty(name, value);
      }
    }
  }, [themeVars]);
}
