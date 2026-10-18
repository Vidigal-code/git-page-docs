import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error .mjs module without type declarations
import * as layoutsData from "../../data/layouts.mjs";
// @ts-expect-error .mjs module without type declarations
import * as themeBuilder from "../../builders/theme-template.mjs";

interface Layout {
  id: string;
  file: string;
  mode: "dark" | "light";
}

interface BackgroundLayer {
  id: string;
  kind: string;
  count: number;
  colors: string[];
  size: { min: number; max: number };
  duration: { min: number; max: number };
}

interface Background {
  enabled: boolean;
  animation: { enabled: boolean; speed: number };
  accessibility: { reducedMotion: string; showPauseButton: boolean };
  layers: BackgroundLayer[];
}

interface Template {
  id: string;
  colors: Record<string, string>;
  backgroundEffects?: Background;
}

const { LAYOUTS } = layoutsData as { LAYOUTS: Layout[] };
const { createThemeTemplate } = themeBuilder as { createThemeTemplate(layout: Layout): Template };
const EXPECTED_LEGACY_COUNT = 64;
const EXPECTED_ANIMATED_COUNT = 60;
const LAYOUTS_ROOT = path.resolve(__dirname, "../../../gitpagelayouts");

describe("animated theme catalog", () => {
  it("ships sixty animated themes while leaving all sixty-four legacy themes static", () => {
    const templates = LAYOUTS.map((layout) => createThemeTemplate(layout));
    const animated = templates.filter((template) => template.backgroundEffects);
    const legacy = templates.filter((template) => !template.backgroundEffects);
    expect(LAYOUTS).toHaveLength(EXPECTED_LEGACY_COUNT + EXPECTED_ANIMATED_COUNT);
    expect(animated).toHaveLength(EXPECTED_ANIMATED_COUNT);
    expect(legacy).toHaveLength(EXPECTED_LEGACY_COUNT);
    expect(legacy.some(({ id }) => id === "matrix-dark")).toBe(true);
    expect(animated.find(({ id }) => id === "astral-drift-dark")?.backgroundEffects?.layers)
      .toEqual(expect.arrayContaining([expect.objectContaining({ kind: "stars" })]));
  });

  it("ships the same palettes and editable background presets through official and local CLI themes", () => {
    const kinds = new Set<string>();
    for (const layout of LAYOUTS) {
      const template = createThemeTemplate(layout);
      const background = template.backgroundEffects;
      if (!background) continue;
      const official: Template = JSON.parse(readFileSync(path.join(LAYOUTS_ROOT, layout.file), "utf8"));
      expect(template.colors, layout.id).toEqual(official.colors);
      expect(background, layout.id).toEqual(official.backgroundEffects);
      expect(background.enabled).toBe(true);
      expect(background.accessibility).toEqual({ reducedMotion: "static", showPauseButton: true });
      expect(new Set(background.layers.map(({ id }) => id)).size).toBe(background.layers.length);
      for (const layer of background.layers) {
        kinds.add(layer.kind);
        expect(layer.count).toBeGreaterThanOrEqual(1);
        expect(layer.count).toBeLessThanOrEqual(80);
        expect(layer.size.min).toBeLessThanOrEqual(layer.size.max);
        expect(layer.duration.min).toBeLessThanOrEqual(layer.duration.max);
      }
    }
    expect([...kinds].sort()).toEqual(["grid", "matrix", "orbs", "stars", "streaks", "waves"]);
  });

  it("keeps generated background objects independent when callers customize a theme", () => {
    const layout = LAYOUTS.find(({ id }) => id === "matrix-rain-dark");
    expect(layout).toBeDefined();
    if (!layout) throw new Error("Matrix Rain is missing from the catalog");
    const customized = createThemeTemplate(layout);
    const background = customized.backgroundEffects;
    expect(background).toBeDefined();
    if (!background) throw new Error("Matrix Rain is missing its background");
    background.layers[0].count = 1;
    background.layers[0].colors.push("#FFFFFF");
    expect(createThemeTemplate(layout).backgroundEffects).not.toEqual(background);
  });
});
