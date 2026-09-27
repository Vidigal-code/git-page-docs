// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemePreloadScript } from "@/entities/docs/ui/theme-preload-script/theme-preload-script";
import { SHELL_THEME_CACHE_KEY } from "@/entities/docs/lib/theme/theme-cache";

/** Renders the component, then runs its inline script and records every :root property it sets. */
function runPreload(): Array<[string, string]> {
  const { container, unmount } = render(<ThemePreloadScript />);
  const source = container.querySelector("script")?.textContent ?? "";
  unmount();
  expect(source).not.toBe("");

  const setProperty = vi.spyOn(document.documentElement.style, "setProperty");
  new Function(source)();
  const calls = setProperty.mock.calls.map(([name, value]): [string, string] => [name, String(value)]);
  setProperty.mockRestore();
  return calls;
}

function visit(search: string, cache?: unknown): void {
  window.history.replaceState(null, "", search ? `/?${search}` : "/");
  localStorage.clear();
  if (cache !== undefined) {
    localStorage.setItem(SHELL_THEME_CACHE_KEY, typeof cache === "string" ? cache : JSON.stringify(cache));
  }
}

const cache = {
  layoutsConfig: { layouts: [] },
  themes: {
    aurora: {
      colors: { primary: "#111111", cardBackground: "#222222", cardBorder: "#333333", unknownKey: "#444444" },
      components: { header: { backgroundColor: "#555555", borderBottom: "2px solid #666666" } },
    },
  },
};

describe("ThemePreloadScript", () => {
  it("applies the cached palette of the theme named in the url before paint", () => {
    visit("theme=aurora", cache);
    expect(runPreload()).toEqual([
      ["--primary", "#111111"],
      ["--card-background", "#222222"],
      ["--card-border", "#333333"],
      ["--header-background", "#555555"],
      ["--header-border", "2px solid #666666"],
    ]);
  });

  it("derives the header from the card colours when the theme has no header component", () => {
    visit("theme=aurora", { themes: { aurora: { colors: { cardBackground: "#222222", cardBorder: "#333333" } } } });
    expect(runPreload()).toEqual([
      ["--card-background", "#222222"],
      ["--card-border", "#333333"],
      ["--header-background", "#222222"],
      ["--header-border", "1px solid #333333"],
    ]);
  });

  it("does nothing without a theme param, a cache entry, or a matching theme with colours", () => {
    visit("", cache);
    expect(runPreload()).toEqual([]);
    visit("theme=aurora");
    expect(runPreload()).toEqual([]);
    visit("theme=missing", cache);
    expect(runPreload()).toEqual([]);
    visit("theme=aurora", { themes: { aurora: {} } });
    expect(runPreload()).toEqual([]);
  });

  it("swallows unusable cache entries instead of breaking the page", () => {
    visit("theme=aurora", "{broken");
    expect(runPreload()).toEqual([]);
    visit("theme=aurora", { themes: null });
    expect(runPreload()).toEqual([]);
  });
});
