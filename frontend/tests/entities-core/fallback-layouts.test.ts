import { describe, expect, it } from "vitest";
import { buildFallbackLayoutsAndThemes } from "@/entities/docs/lib/fallback-layouts";

const FALLBACK_ID = "gitpagedocs-fallback-dark";

describe("buildFallbackLayoutsAndThemes", () => {
  it("ships one dark-only layout whose theme is keyed by the same id", () => {
    const { layoutsConfig, themes } = buildFallbackLayoutsAndThemes();
    expect(layoutsConfig.layouts).toHaveLength(1);
    const [layout] = layoutsConfig.layouts;
    expect(layout).toMatchObject({ id: FALLBACK_ID, mode: "dark", supportsLightAndDarkModes: false, file: "templates/fallback-dark.json" });
    expect(Object.keys(themes)).toEqual([FALLBACK_ID]);
    expect(themes[FALLBACK_ID]).toMatchObject({
      id: FALLBACK_ID,
      name: layout.name,
      author: layout.author,
      mode: "dark",
      supportsLightAndDarkModes: false,
    });
  });

  it("carries a complete palette, typography and header/control components", () => {
    const theme = buildFallbackLayoutsAndThemes().themes[FALLBACK_ID];
    for (const key of ["background", "primary", "secondary", "text", "textSecondary", "cardBackground", "cardBorder"]) {
      expect(theme.colors[key], key).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(theme.typography.fontFamily).toContain("Inter");
    expect(Object.keys(theme.typography.fontSize)).toEqual(["base", "heading", "small"]);
    expect(theme.components.header?.backgroundColor).toBeDefined();
    expect(theme.components.headerControls?.common?.borderRadius).toBe(theme.components.button?.borderRadius);
    expect(theme.animations).toEqual({});
  });

  it("builds fresh objects on every call", () => {
    const first = buildFallbackLayoutsAndThemes();
    const second = buildFallbackLayoutsAndThemes();
    expect(first).toEqual(second);
    expect(first.themes).not.toBe(second.themes);
    expect(first.layoutsConfig.layouts[0]).not.toBe(second.layoutsConfig.layouts[0]);
  });
});
