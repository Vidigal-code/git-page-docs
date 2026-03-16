import type { LayoutItem, LayoutsConfig, ThemeTemplate } from "@/entities/docs/model/types";

const FALLBACK_LAYOUT_ID = "gitpagedocs-fallback-dark";

export function buildFallbackLayoutsAndThemes(): {
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
} {
  const fallbackLayout: LayoutItem = {
    id: FALLBACK_LAYOUT_ID,
    name: "Fallback Dark",
    author: "gitpagedocs",
    file: "templates/fallback-dark.json",
    preview: "",
    supportsLightAndDarkModes: false,
    mode: "dark",
  };

  const fallbackTheme: ThemeTemplate = {
    id: FALLBACK_LAYOUT_ID,
    name: "Fallback Dark",
    author: "gitpagedocs",
    version: "1.0.0",
    mode: "dark",
    supportsLightAndDarkModes: false,
    colors: {
      background: "#0b0f15",
      primary: "#7c3aed",
      secondary: "#22d3ee",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      cardBackground: "#0f172a",
      cardBorder: "#334155",
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: {
        base: "16px",
        heading: "28px",
        small: "14px",
      },
    },
    components: {
      header: {
        backgroundColor: "#0b1220",
        borderBottom: "1px solid #334155",
      },
      button: {
        borderRadius: "10px",
        border: "1px solid #334155",
      },
      select: {
        borderRadius: "10px",
        border: "1px solid #334155",
        backgroundColor: "#0f172a",
      },
      card: {
        borderRadius: "16px",
        boxShadow: "0 18px 60px rgba(0, 0, 0, 0.35)",
      },
      headerControls: {
        common: {
          borderRadius: "10px",
          border: "1px solid #334155",
          backgroundColor: "#0f172a",
        },
      },
    },
    animations: {},
  };

  return {
    layoutsConfig: { layouts: [fallbackLayout] },
    themes: { [FALLBACK_LAYOUT_ID]: fallbackTheme },
  };
}
