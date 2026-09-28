import { describe, expect, it } from "vitest";
import { contrastForeground, resolveColorScheme, toBaseThemeCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { ThemeTemplate } from "@/entities/docs/model/types";

function theme(colors: Record<string, string>): ThemeTemplate {
  return { colors, components: {} } as unknown as ThemeTemplate;
}

describe("toBaseThemeCssVars scrollbar derivation", () => {
  it("derives scrollbar colors from the theme accent when not declared", () => {
    const vars = toBaseThemeCssVars(theme({ primary: "#7c3aed" })) as Record<string, string>;
    expect(vars["--scrollbar-track"]).toBe("transparent");
    expect(vars["--scrollbar-thumb"]).toContain("var(--primary)");
    expect(vars["--scrollbar-thumb-hover"]).toContain("var(--primary)");
  });

  it("keeps explicit theme scrollbar colors over the derived ones", () => {
    const vars = toBaseThemeCssVars(
      theme({ primary: "#7c3aed", scrollbarThumb: "#ff0000" }),
    ) as Record<string, string>;
    expect(vars["--scrollbar-thumb"]).toBe("#ff0000");
    expect(vars["--scrollbar-track"]).toBe("transparent");
    expect(vars["--scrollbar-thumb-hover"]).toContain("var(--primary)");
  });

  it("emits nothing without a theme so :root defaults stay canonical", () => {
    expect(toBaseThemeCssVars(undefined)).toEqual({});
  });
});

describe("toBaseThemeCssVars contrast and colour scheme", () => {
  const withMode = (colors: Record<string, string>, mode?: string) =>
    ({ colors, components: {}, mode }) as unknown as ThemeTemplate;

  it("picks a readable text colour for the primary surface", () => {
    expect(contrastForeground("#FFFFFF")).toBe("#0b0f15");
    expect(contrastForeground("#A3E635")).toBe("#0b0f15");
    expect(contrastForeground("#fff")).toBe("#0b0f15");
    expect(contrastForeground("#7c3aed")).toBe("#ffffff");
    expect(contrastForeground("#000000")).toBe("#ffffff");
    expect(contrastForeground("nonsense")).toBe("#ffffff");
    expect(contrastForeground(undefined)).toBe("#ffffff");
  });

  it("chooses the text colour with the higher WCAG contrast for mid-tone primaries", () => {
    // Emerald (#059669): near-black reads at ~5.5:1, white only at ~3.8:1.
    expect(contrastForeground("#059669")).toBe("#0b0f15");
    // Blue (#2563eb): white wins (~5.2:1 against ~3.8:1).
    expect(contrastForeground("#2563eb")).toBe("#ffffff");
  });

  it("emits --primary-foreground next to --primary only when the theme has a primary", () => {
    const vars = toBaseThemeCssVars(theme({ primary: "#FFFFFF" })) as Record<string, string>;
    expect(vars["--primary"]).toBe("#FFFFFF");
    expect(vars["--primary-foreground"]).toBe("#0b0f15");
    expect(toBaseThemeCssVars(theme({}))).not.toHaveProperty("--primary-foreground");
  });

  it("derives --color-scheme from the declared mode, else from the background", () => {
    expect(resolveColorScheme(withMode({}, "light"))).toBe("light");
    expect(resolveColorScheme(withMode({ background: "#ffffff" }, "dark"))).toBe("dark");
    expect(resolveColorScheme(withMode({ background: "#0b0f15" }))).toBe("dark");
    expect(resolveColorScheme(withMode({ background: "#f8fafc" }))).toBe("light");
    expect(resolveColorScheme(withMode({}))).toBe("dark");
    const vars = toBaseThemeCssVars(withMode({ background: "#ffffff" }, "light")) as Record<string, string>;
    expect(vars["--color-scheme"]).toBe("light");
  });
});
