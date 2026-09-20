/**
 * @file resolve-shiki-theme.ts
 * @description Maps every shipped site layout to a bundled Shiki (VS Code)
 * theme from the same color family, so the source viewer's token palette and
 * editor background match the active site theme. Unknown/custom layouts fall
 * back to VS Code's defaults by mode. Type-only Shiki imports keep the bundle
 * lazy while making every mapped theme id compile-time checked.
 */
import type { BundledTheme } from "shiki";

export type HighlightThemeMode = "light" | "dark";

/** VS Code's default editor themes, used when a layout has no dedicated match. */
export const FALLBACK_SHIKI_THEME_BY_MODE: Readonly<Record<HighlightThemeMode, BundledTheme>> = {
  dark: "dark-plus",
  light: "light-plus",
};

/**
 * Site layout id -> bundled Shiki theme with a matching palette.
 * Every template in `gitpagelayouts/templates/` has an entry (enforced by
 * tests); a few related layouts intentionally share the closest match.
 */
export const SHIKI_THEME_BY_LAYOUT_ID: Readonly<Record<string, BundledTheme>> = {
  // Dark layouts
  "amber-dark": "gruvbox-dark-medium",
  "aurora-dark": "aurora-x",
  "carbon-dark": "vesper",
  "cobalt-dark": "night-owl",
  "crimson-dark": "red",
  "cyberpunk-dark": "synthwave-84",
  "duet-dark": "dracula",
  "ember-dark": "gruvbox-dark-hard",
  "emerald-dark": "vitesse-dark",
  "forest-dark": "everforest-dark",
  "github-dark": "github-dark",
  "graphite-dark": "min-dark",
  "indigo-dark": "material-theme-palenight",
  "lagoon-dark": "poimandres",
  "lava-dark": "horizon",
  "matrix-dark": "vitesse-black",
  "midnight-dark": "tokyo-night",
  "mono-dark": "min-dark",
  "moss-dark": "gruvbox-dark-soft",
  "neon-noir-dark": "laserwave",
  "nord-dark": "nord",
  "obsidian-dark": "kanagawa-dragon",
  "oceanic-dark": "material-theme-ocean",
  "orchid-dark": "rose-pine-moon",
  "plum-dark": "catppuccin-mocha",
  "rose-dark": "rose-pine",
  "skyline-dark": "ayu-mirage",
  "slate-dark": "github-dark-dimmed",
  "steel-dark": "ayu-dark",
  "sunset-dark": "horizon",
  "velvet-dark": "dracula-soft",
  "verdant-dark": "everforest-dark",
  "violet-dark": "andromeeda",
  "vscode-dark": "dark-plus",
  // Light layouts
  "amber-light": "gruvbox-light-medium",
  "arctic-light": "min-light",
  "aurora-light": "ayu-light",
  "azure-light": "night-owl-light",
  "blush-light": "rose-pine-dawn",
  "coral-light": "horizon-bright",
  "cyberpunk-light": "snazzy-light",
  "duet-light": "one-light",
  "emerald-light": "vitesse-light",
  "forest-light": "everforest-light",
  "github-light": "github-light",
  "graphite-light": "slack-ochin",
  "lava-light": "gruvbox-light-hard",
  "marigold-light": "gruvbox-light-soft",
  "matrix-light": "vitesse-light",
  "mint-light": "everforest-light",
  "mono-light": "min-light",
  "nord-light": "kanagawa-lotus",
  "oceanic-light": "night-owl-light",
  "rose-light": "rose-pine-dawn",
  "sage-light": "everforest-light",
  "sakura-light": "rose-pine-dawn",
  "sand-light": "solarized-light",
  "skyline-light": "ayu-light",
  "slate-light": "github-light-default",
  "sunset-light": "horizon-bright",
  "tangerine-light": "gruvbox-light-medium",
  "violet-light": "catppuccin-latte",
  "vscode-light": "light-plus",
  default: "light-plus",
};

/**
 * Resolves the Shiki theme for the active site layout, falling back to the
 * VS Code default palette for the given mode.
 */
export function resolveShikiTheme(
  themeId: string | undefined,
  mode: HighlightThemeMode,
): BundledTheme {
  return (themeId && SHIKI_THEME_BY_LAYOUT_ID[themeId]) || FALLBACK_SHIKI_THEME_BY_MODE[mode];
}
