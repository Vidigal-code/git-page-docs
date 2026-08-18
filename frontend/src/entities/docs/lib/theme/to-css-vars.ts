import type {
  SiteConfig,
  ThemeButtonComponent,
  ThemeCardComponent,
  ThemeHeaderComponent,
  ThemeSelectComponent,
  ThemeTemplate,
} from "@/entities/docs/model/types";
import type { CSSProperties } from "react";

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

const DEFAULT_BUTTON: ThemeButtonComponent = { borderRadius: "10px", border: "1px solid #334155" };
const DEFAULT_SELECT: ThemeSelectComponent = {
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "#0f172a",
};
const DEFAULT_CARD: ThemeCardComponent = {
  borderRadius: "16px",
  boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)",
};

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
  const vars: Record<string, string> = {};
  for (const [colorKey, cssVar] of Object.entries(THEME_CSS_VAR_BY_COLOR)) {
    const value = colors[colorKey as keyof typeof THEME_CSS_VAR_BY_COLOR];
    if (value) {
      vars[cssVar] = value;
    }
  }
  return vars as CSSProperties;
}

export function toDocsShellCssVars(
  theme: ThemeTemplate | undefined,
  site?: SiteConfig,
): CSSProperties {
  const base = toBaseThemeCssVars(theme);
  const components = theme?.components ?? {};
  const button = components.button ?? DEFAULT_BUTTON;
  const select = components.select ?? DEFAULT_SELECT;
  const card = components.card ?? DEFAULT_CARD;
  const headerControls = components.headerControls?.common;

  return {
    ...base,
    ["--header-background" as string]: components.header?.backgroundColor ?? DEFAULT_HEADER.backgroundColor,
    ["--header-border" as string]: components.header?.borderBottom ?? DEFAULT_HEADER.borderBottom,
    ["--card-shadow" as string]: card.boxShadow,
    ["--card-radius" as string]: card.borderRadius,
    ["--control-radius" as string]: headerControls?.borderRadius ?? button.borderRadius ?? "10px",
    ["--control-border" as string]: headerControls?.border ?? button.border ?? "1px solid #334155",
    ["--control-background" as string]: headerControls?.backgroundColor ?? select.backgroundColor ?? "#0f172a",
    ["--select-radius" as string]: select.borderRadius ?? "10px",
    ["--select-border" as string]: select.border ?? "1px solid #334155",
    ["--button-radius" as string]: button.borderRadius ?? "10px",
    ["--button-border" as string]: button.border ?? "1px solid #334155",
    ["--button-glow" as string]: button.hoverGlow ?? "0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)",
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
    ["--header-background" as string]: header.backgroundColor ?? colors.cardBackground ?? DEFAULT_COLORS.cardBackground,
    ["--header-border" as string]: header.borderBottom ?? `1px solid ${colors.cardBorder ?? DEFAULT_COLORS.cardBorder}`,
  };
}
