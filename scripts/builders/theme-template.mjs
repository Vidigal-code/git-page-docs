/** Build theme JSON template from layout definition */

import { THEME_COLORS } from "../data/theme-colors.mjs";

export function createThemeTemplate(layout, themeColors = THEME_COLORS) {
  const colors = themeColors[layout.id] ?? themeColors.default;
  const dark = layout.mode === "dark";
  return {
    id: layout.id,
    name: layout.name,
    author: layout.author,
    version: "1.0.0",
    mode: layout.mode,
    supportsLightAndDarkModes: layout.supportsLightAndDarkModes,
    colors,
    typography: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif",
      fontSize: {
        small: "0.875rem",
        base: "1rem",
        medium: "1.125rem",
        large: "1.25rem",
        xlarge: "2rem",
      },
    },
    components: {
      header: {
        height: "80px",
        backgroundColor: dark ? "#0B1220" : "#FFFFFF",
        borderBottom: dark ? "1px solid #334155" : "1px solid #E2E8F0",
      },
      footer: {
        height: "60px",
        backgroundColor: dark ? "#0B1220" : "#FFFFFF",
        borderTop: dark ? "1px solid #334155" : "1px solid #E2E8F0",
      },
      card: {
        borderRadius: "16px",
        padding: "24px",
        boxShadow: dark ? "0 18px 60px rgba(0, 0, 0, 0.45)" : "0 18px 50px rgba(15, 23, 42, 0.08)",
      },
      button: {
        borderRadius: "12px",
        padding: "10px 18px",
        border: dark ? "1px solid #334155" : "1px solid #E2E8F0",
        hoverGlow: dark ? "0 0 0 3px rgba(124, 58, 237, 0.18)" : "0 0 0 4px rgba(109, 40, 217, 0.15)",
      },
      select: {
        borderRadius: "12px",
        padding: "10px 40px 10px 16px",
        border: dark ? "1px solid #334155" : "1px solid #E2E8F0",
        backgroundColor: dark ? "#0F172A" : "#FFFFFF",
        textAlign: "center",
        iconColor: colors.secondary,
        hoverBorderColor: dark ? "rgba(34, 211, 238, 0.7)" : "rgba(8, 145, 178, 0.7)",
        focusBorderColor: dark ? "rgba(124, 58, 237, 0.8)" : "rgba(109, 40, 217, 0.8)",
        focusGlow: dark ? "0 0 0 4px rgba(124, 58, 237, 0.18)" : "0 0 0 4px rgba(109, 40, 217, 0.15)",
      },
      checkbox: {
        width: "20px",
        height: "20px",
        accentColor: colors.primary,
        borderColor: dark ? "#475569" : "#CBD5E1",
        hoverBorderColor: dark ? "rgba(34, 211, 238, 0.75)" : "rgba(8, 145, 178, 0.7)",
        checkMarkColor: colors.background,
        borderRadius: "6px",
      },
    },
    animations: {
      enableTypingEffect: false,
      enableGlow: dark,
      transitionDuration: "0.22s",
    },
  };
}
