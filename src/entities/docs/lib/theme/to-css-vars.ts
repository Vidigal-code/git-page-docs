import type { SiteConfig, ThemeTemplate } from "@/entities/docs/model/types";
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

export function toBaseThemeCssVars(theme: ThemeTemplate | undefined): CSSProperties {
  const colors = theme?.colors ?? {};
  return {
    ["--background" as string]: colors.background ?? DEFAULT_COLORS.background,
    ["--primary" as string]: colors.primary ?? DEFAULT_COLORS.primary,
    ["--secondary" as string]: colors.secondary ?? DEFAULT_COLORS.secondary,
    ["--text" as string]: colors.text ?? DEFAULT_COLORS.text,
    ["--text-secondary" as string]: colors.textSecondary ?? DEFAULT_COLORS.textSecondary,
    ["--card-background" as string]: colors.cardBackground ?? DEFAULT_COLORS.cardBackground,
    ["--card-border" as string]: colors.cardBorder ?? DEFAULT_COLORS.cardBorder,
    ["--scrollbar-track" as string]: colors.scrollbarTrack ?? "transparent",
    ["--scrollbar-thumb" as string]: colors.scrollbarThumb ?? "color-mix(in srgb, var(--text-secondary) 40%, transparent)",
    ["--scrollbar-thumb-hover" as string]: colors.scrollbarThumbHover ?? "color-mix(in srgb, var(--text-secondary) 60%, transparent)",
  };
}

export function toDocsShellCssVars(
  theme: ThemeTemplate | undefined,
  site?: SiteConfig,
): CSSProperties {
  const base = toBaseThemeCssVars(theme);
  const colors = theme?.colors ?? {};
  const button = (theme?.components.button as
    | {
        borderRadius?: string;
        border?: string;
        hoverGlow?: string;
      }
    | undefined) ?? { borderRadius: "10px", border: "1px solid #334155" };
  const select = (theme?.components.select as
    | {
        borderRadius?: string;
        border?: string;
        backgroundColor?: string;
      }
    | undefined) ?? { borderRadius: "10px", border: "1px solid #334155", backgroundColor: "#0f172a" };
  const card = (theme?.components.card as
    | {
        borderRadius?: string;
        boxShadow?: string;
      }
    | undefined) ?? { borderRadius: "16px", boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)" };
  const headerControls = (theme?.components.headerControls as
    | {
        common?: {
          borderRadius?: string;
          border?: string;
          backgroundColor?: string;
        };
      }
    | undefined)?.common;

  return {
    ...base,
    ["--header-background" as string]:
      (theme?.components.header as { backgroundColor?: string } | undefined)?.backgroundColor ?? "#0b1220",
    ["--header-border" as string]:
      (theme?.components.header as { borderBottom?: string } | undefined)?.borderBottom ?? "1px solid #334155",
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
  const base = toBaseThemeCssVars(theme);
  const colors = theme?.colors ?? {};
  const header = (theme?.components.header as { backgroundColor?: string; borderBottom?: string } | undefined) ?? {};
  return {
    ...base,
    ["--header-background" as string]: header.backgroundColor ?? colors.cardBackground ?? DEFAULT_COLORS.cardBackground,
    ["--header-border" as string]: header.borderBottom ?? `1px solid ${colors.cardBorder ?? DEFAULT_COLORS.cardBorder}`,
  };
}
