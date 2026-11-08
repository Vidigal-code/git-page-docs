import type {
  SiteConfig,
  ThemeButtonComponent,
  ThemeCardComponent,
  ThemeHeaderComponent,
  ThemeSelectComponent,
  ThemeTemplate,
} from "@/entities/docs/model/types";
import type { CSSProperties } from "react";
import { contrastRatio, mixHexColors, readableTextColor, relativeLuminance } from "@/shared/lib/color-contrast";
export { relativeLuminance } from "@/shared/lib/color-contrast";

const TOC_SCROLL_MAX_HEIGHT_DESKTOP_DEFAULT = "min(65vh, 400px)";
const TOC_SCROLL_MAX_HEIGHT_MOBILE_DEFAULT = "min(45vh, 280px)";

const DEFAULT_COLORS = {
  background: "#0b0f15",
  primary: "#7c3aed",
  secondary: "#22d3ee",
  text: "#e2e8f0",
  textSecondary: "#94a3b8",
  cardBackground: "#0f172a",
  cardBorder: "#334155",
} as const;

/**
 * Theme colour field to CSS custom property. Shared with the pre-paint theme
 * script so both write the same variables from the same palette.
 */
export const THEME_CSS_VAR_BY_COLOR = {
  background: "--background",
  primary: "--primary",
  secondary: "--secondary",
  text: "--text",
  textSecondary: "--text-secondary",
  cardBackground: "--card-background",
  cardBorder: "--card-border",
  scrollbarTrack: "--scrollbar-track",
  scrollbarThumb: "--scrollbar-thumb",
  scrollbarThumbHover: "--scrollbar-thumb-hover",
} as const;

const DEFAULT_HEADER: Required<Pick<ThemeHeaderComponent, "backgroundColor" | "borderBottom">> = {
  backgroundColor: "#0b1220",
  borderBottom: "1px solid #334155",
};

// Controls without a theme definition follow the palette (card surface and
// border) instead of a fixed navy, so a green or amber theme never shows a
// slate dropdown.
const PALETTE_CONTROL_BORDER = "1px solid var(--card-border)";
const PALETTE_CONTROL_BACKGROUND = "var(--card-background)";

const DEFAULT_BUTTON: ThemeButtonComponent = { borderRadius: "10px", border: PALETTE_CONTROL_BORDER };
const DEFAULT_SELECT: ThemeSelectComponent = {
  borderRadius: "10px",
  border: PALETTE_CONTROL_BORDER,
  backgroundColor: PALETTE_CONTROL_BACKGROUND,
};
const DEFAULT_CARD: ThemeCardComponent = {
  borderRadius: "16px",
  boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)",
};

const DARK_FOREGROUND = "#0b0f15";
const LIGHT_FOREGROUND = "#ffffff";
/** Backgrounds brighter than this belong to a light scheme. */
const LIGHT_SCHEME_LUMINANCE = 0.4;
const CODE_SURFACE_TINT = 0.06;

/**
 * Text colour that reads best on the theme's primary: whichever of white or
 * near-black has the higher WCAG contrast against it. Non-hex colours fall back to white.
 */
export function contrastForeground(color: string | undefined): string {
  const luminance = relativeLuminance(color);
  if (luminance === undefined) return LIGHT_FOREGROUND;
  const onDark = contrastRatio(luminance, relativeLuminance(DARK_FOREGROUND) ?? 0);
  const onLight = contrastRatio(luminance, relativeLuminance(LIGHT_FOREGROUND) ?? 1);
  return onDark > onLight ? DARK_FOREGROUND : LIGHT_FOREGROUND;
}

function toMarkdownCssVars(colors: ThemeTemplate["colors"]): Record<string, string> {
  const background = colors.cardBackground ?? DEFAULT_COLORS.cardBackground;
  const text = readableTextColor(colors.text ?? DEFAULT_COLORS.text, background);
  const codeBackground = mixHexColors(background, text, CODE_SURFACE_TINT);
  return {
    "--markdown-background": background,
    "--markdown-text": text,
    "--markdown-link": readableTextColor(colors.primary ?? DEFAULT_COLORS.primary, background),
    "--markdown-muted": readableTextColor(colors.textSecondary ?? DEFAULT_COLORS.textSecondary, background),
    "--markdown-code-background": codeBackground,
    "--markdown-code-text": readableTextColor(text, codeBackground),
  };
}

/** `color-scheme` for native controls (select popups, scrollbars): the declared mode, else read off the background. */
export function resolveColorScheme(theme: Pick<ThemeTemplate, "mode" | "colors">): "dark" | "light" {
  if (theme.mode === "light" || theme.mode === "dark") return theme.mode;
  const luminance = relativeLuminance(theme.colors?.background);
  return luminance !== undefined && luminance > LIGHT_SCHEME_LUMINANCE ? "light" : "dark";
}

export function toBaseThemeCssVars(theme: ThemeTemplate | undefined): CSSProperties {
  // No theme yet: emit nothing so the page inherits the :root defaults instead
  // of freezing them into prerendered markup. That keeps the pre-paint theme
  // script (which sets :root) able to show a cached palette in the first
  // painted frame, rather than being shadowed by an inline default.
  if (!theme) {
    return {};
  }
  const colors = theme.colors ?? {};
  // Colours the theme does not define are left out so the :root defaults apply,
  // which keeps one canonical default palette instead of a second copy here.
  const vars: Record<string, string> = toMarkdownCssVars(colors);
  for (const [colorKey, cssVar] of Object.entries(THEME_CSS_VAR_BY_COLOR)) {
    const value = colors[colorKey as keyof typeof THEME_CSS_VAR_BY_COLOR];
    if (value) {
      vars[cssVar] = value;
    }
  }
  // Themes declare neither the text colour for primary surfaces nor a colour
  // scheme, so both are derived from the palette: buttons stay readable on a
  // white or lime primary, and native popups follow light/dark themes.
  vars["--color-scheme"] = resolveColorScheme(theme);
  if (colors.primary) {
    vars["--primary-foreground"] = contrastForeground(colors.primary);
  }
  // Resolve neutral scrollbar colours on the theme wrapper; inherited custom
  // properties otherwise keep the palette of the element that declared them.
  // Explicit theme values from the loop above take precedence.
  if (!colors.scrollbarTrack) {
    vars["--scrollbar-track"] = "transparent";
  }
  if (!colors.scrollbarThumb) {
    vars["--scrollbar-thumb"] = "color-mix(in srgb, var(--text-secondary) 65%, transparent)";
  }
  if (!colors.scrollbarThumbHover) {
    vars["--scrollbar-thumb-hover"] = "color-mix(in srgb, var(--text-secondary) 85%, transparent)";
  }
  return vars as CSSProperties;
}

function toControlCssVars(components: ThemeTemplate["components"]): CSSProperties {
  const button = components.button ?? DEFAULT_BUTTON;
  const select = components.select ?? DEFAULT_SELECT;
  const headerControls = components.headerControls?.common;

  return {
    ["--control-radius" as string]: headerControls?.borderRadius ?? button.borderRadius ?? "10px",
    ["--control-border" as string]: headerControls?.border ?? button.border ?? PALETTE_CONTROL_BORDER,
    ["--control-background" as string]:
      headerControls?.backgroundColor ?? select.backgroundColor ?? PALETTE_CONTROL_BACKGROUND,
    ["--select-radius" as string]: select.borderRadius ?? "10px",
    ["--select-border" as string]: select.border ?? PALETTE_CONTROL_BORDER,
    ["--button-radius" as string]: button.borderRadius ?? "10px",
    ["--button-border" as string]: button.border ?? PALETTE_CONTROL_BORDER,
    ["--button-glow" as string]: button.hoverGlow ?? "0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)",
  };
}

export function toDocsShellCssVars(
  theme: ThemeTemplate | undefined,
  site?: SiteConfig,
): CSSProperties {
  const base = toBaseThemeCssVars(theme);
  const components = theme?.components ?? {};
  const card = components.card ?? DEFAULT_CARD;

  return {
    ...base,
    ...toControlCssVars(components),
    ["--header-background" as string]: components.header?.backgroundColor ?? DEFAULT_HEADER.backgroundColor,
    ["--header-border" as string]: components.header?.borderBottom ?? DEFAULT_HEADER.borderBottom,
    ["--card-shadow" as string]: card.boxShadow,
    ["--card-radius" as string]: card.borderRadius,
    ["--toc-scroll-max-height-desktop" as string]:
      site?.TocScrollMaxHeightDesktop ?? TOC_SCROLL_MAX_HEIGHT_DESKTOP_DEFAULT,
    ["--toc-scroll-max-height-mobile" as string]:
      site?.TocScrollMaxHeightMobile ?? TOC_SCROLL_MAX_HEIGHT_MOBILE_DEFAULT,
  };
}

export function toSearchShellCssVars(theme: ThemeTemplate | undefined): CSSProperties {
  if (!theme) {
    return {};
  }
  const base = toBaseThemeCssVars(theme);
  const colors = theme.colors ?? {};
  const header = theme.components.header ?? {};
  return {
    ...base,
    ...toControlCssVars(theme.components),
    ["--header-background" as string]: header.backgroundColor ?? colors.cardBackground ?? DEFAULT_COLORS.cardBackground,
    ["--header-border" as string]: header.borderBottom ?? `1px solid ${colors.cardBorder ?? DEFAULT_COLORS.cardBorder}`,
  };
}
