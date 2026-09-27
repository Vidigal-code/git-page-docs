// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import type { LayoutItem } from "@/entities/docs";
import { useStandaloneShellPreferences } from "@/widgets/search-shell-header/model/use-standalone-shell-preferences";
import { buildHomeHref } from "@/widgets/search-shell-header/model/home-href";
import { STORAGE_KEYS, makeLayouts, setWindowUrl } from "./fixtures";

const nav = vi.hoisted(() => ({ searchParams: new URLSearchParams(), pathname: "/search", replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: vi.fn() }),
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
}));

type Args = Parameters<typeof useStandaloneShellPreferences>[0];

function setup(search = "", overrides: Partial<Args> = {}, layouts: LayoutItem[] = makeLayouts()) {
  setWindowUrl(`/search${search}`);
  nav.searchParams = new URLSearchParams(search);
  return renderHook(
    ({ layouts: current }) =>
      useStandaloneShellPreferences({
        siteName: "Demo Docs",
        defaultLanguage: "en",
        availableLanguages: ["en", "pt"],
        layouts: current,
        configuredDefaultMode: "dark",
        initialThemeBaseId: "aurora-dark",
        ...overrides,
      }),
    { initialProps: { layouts } },
  );
}

afterEach(cleanup);

describe("useStandaloneShellPreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("restores the language from the URL first, then from storage, and persists it", () => {
    window.localStorage.setItem(STORAGE_KEYS.language, "pt");
    const fromUrl = setup("?lang=en");
    expect(fromUrl.result.current.language).toBe("en");
    expect(window.localStorage.getItem(STORAGE_KEYS.language)).toBe("en");

    window.localStorage.setItem(STORAGE_KEYS.language, "pt");
    const fromStorage = setup("?lang=fr");
    expect(fromStorage.result.current.language).toBe("pt");

    window.localStorage.setItem(STORAGE_KEYS.language, "de");
    const fallback = setup();
    expect(fallback.result.current.language).toBe("en");
  });

  it("keeps the internal default out of the URL and persists mode and theme", () => {
    const { result } = setup();
    expect(result.current.activeThemeId).toBe("aurora-dark");
    expect(result.current.activeLayout?.id).toBe("aurora-dark");
    expect(result.current.nextModeIsDark).toBe(true);
    expect(result.current.canToggleMode).toBe(true);
    expect(window.location.search).toBe("");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("aurora-dark");
  });

  it("waits for the layouts before restoring the theme requested in the URL", () => {
    const { result, rerender } = setup("?theme=mono-dark", {}, []);
    expect(result.current.activeThemeId).toBe("");
    expect(result.current.activeLayout).toBeUndefined();
    expect(result.current.canToggleMode).toBe(false);

    rerender({ layouts: makeLayouts() });
    expect(result.current.activeThemeId).toBe("mono-dark");
    // Already in the URL: nothing to rewrite.
    expect(window.location.search).toBe("?theme=mono-dark");
  });

  it("resolves modetheme from the URL and reflects the explicit theme back into the URL", () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
    const { result } = setup("?modetheme=light");
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(window.location.search).toBe("?modetheme=light&theme=aurora-light");
  });

  it("restores a saved theme, then a saved mode, silently", () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    const savedTheme = setup();
    expect(savedTheme.result.current.activeThemeId).toBe("mono-dark");
    expect(window.location.search).toBe("");

    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    const savedMode = setup();
    expect(savedMode.result.current.activeThemeId).toBe("aurora-light");
    expect(window.location.search).toBe("");
  });

  it("writes the language and theme choices to the URL without navigating", () => {
    const { result } = setup("?q=docs");
    act(() => result.current.onLanguageChange("pt"));
    expect(result.current.language).toBe("pt");
    expect(window.location.pathname).toBe("/search");
    expect(window.location.search).toBe("?q=docs&lang=pt");
    expect(nav.replace).not.toHaveBeenCalled();

    act(() => result.current.onThemeChange("mono-dark"));
    expect(result.current.activeThemeId).toBe("mono-dark");
    expect(result.current.canToggleMode).toBe(false);
    expect(window.location.search).toBe("?q=docs&lang=pt&theme=mono-dark&modetheme=dark");

    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("mono-dark");

    act(() => result.current.onThemeChange("aurora-dark"));
    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(result.current.nextModeIsDark).toBe(false);
    expect(window.location.search).toBe("?q=docs&lang=pt&theme=aurora-light&modetheme=light");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
  });

  it("omits modetheme for an unknown theme id", () => {
    const { result } = setup();
    act(() => result.current.onThemeChange("ghost"));
    expect(window.location.search).toBe("?theme=ghost");
    expect(result.current.activeLayout?.id).toBe("aurora-dark");
  });

  it("strips the base path from the window pathname before rewriting the URL", () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
    setWindowUrl("/git-page-docs/search");
    const { result } = setup();
    setWindowUrl("/git-page-docs/search");
    act(() => result.current.onLanguageChange("pt"));
    expect(window.location.pathname).toBe("/git-page-docs/search");
    expect(window.location.search).toBe("?lang=pt");

    setWindowUrl("/git-page-docs");
    act(() => result.current.onLanguageChange("en"));
    expect(window.location.pathname).toBe("/git-page-docs/");
    expect(window.location.search).toBe("?lang=en");
  });

  it("keeps working when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = setup("?modetheme=light");
    expect(result.current.language).toBe("en");
    // The mode lookup reads storage inside the same guarded block, so a blocked
    // storage aborts the URL-mode resolution as well and the default stays.
    expect(result.current.activeThemeId).toBe("aurora-dark");
    expect(window.location.search).toBe("?modetheme=light");
    act(() => result.current.onLanguageChange("pt"));
    expect(result.current.language).toBe("pt");
    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("aurora-light");
  });
});

describe("buildHomeHref", () => {
  it("returns the site root carrying the active theme and its mode", () => {
    expect(buildHomeHref({ themeId: "skyline-dark", mode: "dark" })).toBe("/?theme=skyline-dark&modetheme=dark");
    expect(buildHomeHref({ themeId: "aurora-light", mode: "light" })).toBe("/?theme=aurora-light&modetheme=light");
  });

  it("carries whichever of theme or mode is known and encodes the id", () => {
    expect(buildHomeHref({ themeId: "skyline-dark" })).toBe("/?theme=skyline-dark");
    expect(buildHomeHref({ mode: "dark" })).toBe("/?modetheme=dark");
    expect(buildHomeHref({ themeId: "my theme/x", mode: "dark" })).toBe("/?theme=my+theme%2Fx&modetheme=dark");
  });

  it("returns the bare root when nothing is known", () => {
    expect(buildHomeHref()).toBe("/");
    expect(buildHomeHref({ themeId: "" })).toBe("/");
  });
});
