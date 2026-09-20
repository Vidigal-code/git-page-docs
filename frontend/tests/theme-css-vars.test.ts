import { describe, expect, it } from "vitest";
import { toBaseThemeCssVars } from "@/entities/docs/lib/theme/to-css-vars";
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
