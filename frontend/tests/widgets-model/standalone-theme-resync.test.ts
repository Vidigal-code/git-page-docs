// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStandaloneShellPreferences } from "@/widgets/search-shell-header/model/use-standalone-shell-preferences";
import type { LayoutItem } from "@/entities/docs";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => "/owner/repository",
  useSearchParams: () => navigation.params,
}));

const layouts: LayoutItem[] = [
  { id: "aurora-dark", name: "Aurora Dark", author: "tests", file: "aurora-dark.json", preview: "", mode: "dark", supportsLightAndDarkModes: false },
  { id: "cosmic-tide-light", name: "Cosmic Tide Light", author: "tests", file: "cosmic-tide-light.json", preview: "", mode: "light", supportsLightAndDarkModes: false },
];
const languages = ["en", "pt", "es"];

function updateLocation(query: string): void {
  navigation.params = new URLSearchParams(query);
  window.history.replaceState({}, "", `/owner/repository?${query}`);
}

beforeEach(() => {
  localStorage.clear();
  navigation.replace.mockClear();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("follows the theme chosen by another mounted shell when its language changes", () => {
  updateLocation("lang=pt&theme=aurora-dark&modetheme=dark&menu=pt&id=1");
  const { result, rerender } = renderHook(() => useStandaloneShellPreferences({
    siteName: "Demo Docs", defaultLanguage: "en", availableLanguages: languages,
    layouts, configuredDefaultMode: "dark", initialThemeBaseId: "aurora-dark",
  }));
  expect(result.current.activeThemeId).toBe("aurora-dark");

  updateLocation("lang=en&theme=cosmic-tide-light&modetheme=light&menu=en&id=1");
  rerender();

  expect(result.current.language).toBe("en");
  expect(result.current.activeThemeId).toBe("cosmic-tide-light");
  expect(result.current.activeLayout?.mode).toBe("light");
  expect(new URLSearchParams(window.location.search).get("theme")).toBe("cosmic-tide-light");
});
it("preserves an explicit theme missing from the cached catalogue until the refreshed catalogue arrives", () => {
  updateLocation("lang=en&theme=cosmic-tide-light&modetheme=light&id=1");
  const { result, rerender } = renderHook(({ availableLayouts }) => useStandaloneShellPreferences({
    siteName: "Demo Docs", defaultLanguage: "en", availableLanguages: languages,
    layouts: availableLayouts, configuredDefaultMode: "dark", initialThemeBaseId: "aurora-dark",
  }), { initialProps: { availableLayouts: layouts.slice(0, 1) } });

  expect(new URLSearchParams(window.location.search).get("theme")).toBe("cosmic-tide-light");
  expect(new URLSearchParams(window.location.search).get("modetheme")).toBe("light");

  rerender({ availableLayouts: layouts });

  expect(result.current.activeThemeId).toBe("cosmic-tide-light");
  expect(result.current.activeLayout?.mode).toBe("light");
  expect(new URLSearchParams(window.location.search).get("theme")).toBe("cosmic-tide-light");
});