import { expect, it } from "vitest";
// @ts-expect-error .mjs module without type declarations
import { LAYOUTS as layouts } from "../../data/layouts.mjs";
// @ts-expect-error .mjs module without type declarations
import { createThemeTemplate as createTemplate } from "../../builders/theme-template.mjs";

interface Layout {
  id: string;
  mode: "dark" | "light";
  supportsLightAndDarkModes: boolean;
  supportsLightAndDarkModesReference?: string;
}

interface Template {
  backgroundEffects: {
    parallax: { enabled: boolean; pointer: number; scroll: number };
  };
}

const LAYOUTS = layouts as readonly Layout[];
const createThemeTemplate = createTemplate as (layout: Layout) => Template;
const EXPECTED_CATALOG_SIZE = 124;
const FAMILIES = [
  "aurora-borealis", "firefly-grove", "ocean-depths", "forest-canopy", "silver-rain",
  "cloud-harbor", "sakura-breeze", "autumn-embers", "glacier-fjord", "desert-mirage",
  "lavender-mist", "coral-lagoon", "bamboo-dawn", "thunder-horizon", "crystal-cavern",
  "lotus-pond", "golden-savanna", "alpine-meadow", "cosmic-tide", "paper-lanterns",
] as const;

it("ships twenty additional parallax families with native dark and light variants", () => {
  expect(LAYOUTS).toHaveLength(EXPECTED_CATALOG_SIZE);
  for (const family of FAMILIES) {
    const pair = LAYOUTS.filter((layout) => layout.supportsLightAndDarkModesReference === family);
    expect(pair.map((layout) => layout.mode).sort(), family).toEqual(["dark", "light"]);
    for (const layout of pair) {
      expect(layout.supportsLightAndDarkModes, layout.id).toBe(true);
      const background = createThemeTemplate(layout).backgroundEffects;
      expect(background.parallax.enabled, layout.id).toBe(true);
      expect(background.parallax.pointer, layout.id).toBeGreaterThan(0);
      expect(background.parallax.scroll, layout.id).toBeGreaterThan(0);
    }
  }
});
