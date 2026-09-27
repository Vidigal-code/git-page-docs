import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error .mjs module without type declarations
import { expandLayout, hexToRgba, readV2, resolveRule } from "../layouts-v2.mjs";

const LAYOUTS_ROOT = path.resolve(__dirname, "../../gitpagelayouts");

describe("gitpagelayouts v2 source", () => {
  const { base, layouts } = readV2(LAYOUTS_ROOT);

  it("expands to exactly the committed templates (run `pnpm run layouts:sync` after editing v2/)", () => {
    const config = JSON.parse(fs.readFileSync(path.join(LAYOUTS_ROOT, "layoutsConfig.json"), "utf8"));
    expect(layouts.map((l: { id: string }) => l.id).sort()).toEqual(
      config.layouts.map((l: { id: string }) => l.id).sort(),
    );
    for (const layout of layouts) {
      const committed = fs.readFileSync(path.join(LAYOUTS_ROOT, "templates", `${layout.id}.json`), "utf8");
      expect(`${JSON.stringify(expandLayout(base, layout), null, 2)}\n`, layout.id).toBe(committed.replace(/\r\n/g, "\n"));
    }
  });

  it("keeps each layout file free of values the base already provides", () => {
    for (const layout of layouts) {
      expect(Object.keys(layout).sort(), layout.id).toEqual(
        expect.arrayContaining(["colors", "id", "mode", "name", "supportsLightAndDarkModes"]),
      );
      expect(layout).not.toHaveProperty("typography");
      expect(layout).not.toHaveProperty("components");
    }
    // Only the two duet layouts carry their own component design.
    expect(layouts.filter((l: { overrides?: object }) => l.overrides).map((l: { id: string }) => l.id).sort()).toEqual([
      "duet-dark",
      "duet-light",
    ]);
  });

  it("derives control colors from the palette", () => {
    const matrix = expandLayout(base, layouts.find((l: { id: string }) => l.id === "matrix-dark"));
    expect(matrix.components.select.backgroundColor).toBe(matrix.colors.cardBackground);
    expect(matrix.components.select.border).toBe(`1px solid ${matrix.colors.cardBorder}`);
    expect(matrix.components.button.hoverGlow).toBe(`0 0 0 3px ${hexToRgba(matrix.colors.primary, 0.18)}`);
    expect(matrix.components.checkbox.checkMarkColor).toBe(matrix.colors.background);
  });
});

describe("layouts v2 helpers", () => {
  it("converts hex colors to rgba", () => {
    expect(hexToRgba("#22C55E", 0.7)).toBe("rgba(34, 197, 94, 0.7)");
    expect(hexToRgba("#fff", 1)).toBe("rgba(255, 255, 255, 1)");
  });

  it("resolves palette placeholders and rejects unknown tokens", () => {
    const colors = { primary: "#000000", cardBorder: "#111111" };
    expect(resolveRule("1px solid {cardBorder}", colors)).toBe("1px solid #111111");
    expect(resolveRule("0 0 0 4px {primary|0.18}", colors)).toBe("0 0 0 4px rgba(0, 0, 0, 0.18)");
    expect(() => resolveRule("{nope}", colors)).toThrow(/Unknown palette token/);
  });

  it("rejects a layout with an unknown mode", () => {
    expect(() => expandLayout({ shared: {}, modes: {} }, { id: "x", mode: "sepia", colors: {} })).toThrow(/unknown mode/);
  });
});
