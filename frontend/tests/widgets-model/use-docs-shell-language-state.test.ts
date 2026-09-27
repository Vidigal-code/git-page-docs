// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useDocsShellLanguageState } from "@/widgets/docs-shell/model/use-docs-shell-language-state";
import { useDocsShellState } from "@/widgets/docs-shell/model/use-docs-shell-state";
import { GUIDE, STORAGE_KEYS, flushMicrotasks, makeConfig, makeDocsData, makeSite, setWindowUrl } from "./fixtures";

type Args = Parameters<typeof useDocsShellLanguageState>[0];

function setup(search = "", overrides: Partial<Args> = {}) {
  setWindowUrl(`/docs${search}`);
  const replaceUrlWithoutNavigation = vi.fn();
  const searchParams = new URLSearchParams(search);
  const hook = renderHook(() =>
    useDocsShellLanguageState({
      defaultLanguage: "en",
      availableLanguages: ["en", "pt"],
      languageStorageKey: STORAGE_KEYS.language,
      searchParams,
      pathname: "/docs",
      getCurrentSearchParams: () => new URLSearchParams(window.location.search),
      replaceUrlWithoutNavigation,
      ...overrides,
    }),
  );
  return { ...hook, replaceUrlWithoutNavigation };
}

async function restore() {
  await act(async () => {
    await flushMicrotasks();
  });
}

afterEach(cleanup);

describe("useDocsShellLanguageState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("takes the language from the URL and persists it", async () => {
    window.localStorage.setItem(STORAGE_KEYS.language, "pt");
    const { result } = setup("?lang=en");
    expect(result.current.language).toBe("en");
    await restore();
    expect(result.current.language).toBe("en");
    expect(window.localStorage.getItem(STORAGE_KEYS.language)).toBe("en");
  });

  it("ignores a URL language that is not available and restores the saved one", async () => {
    window.localStorage.setItem(STORAGE_KEYS.language, "pt");
    const { result } = setup("?lang=fr");
    expect(result.current.language).toBe("en");
    await restore();
    expect(result.current.language).toBe("pt");
    expect(window.localStorage.getItem(STORAGE_KEYS.language)).toBe("pt");
  });

  it("keeps the default when the saved language is unknown, then persists the default", async () => {
    window.localStorage.setItem(STORAGE_KEYS.language, "fr");
    const { result } = setup();
    await restore();
    expect(result.current.language).toBe("en");
    expect(window.localStorage.getItem(STORAGE_KEYS.language)).toBe("en");
  });

  it("writes lang to the URL, drops the version param and trims the trailing slash on change", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("?version=v1&theme=aurora-dark", { pathname: "/docs/" });
    await restore();
    act(() => result.current.onLanguageChange("pt"));
    expect(result.current.language).toBe("pt");
    expect(replaceUrlWithoutNavigation).toHaveBeenCalledTimes(1);
    const [path, params] = replaceUrlWithoutNavigation.mock.calls[0] as [string, URLSearchParams];
    expect(path).toBe("/docs");
    expect(params.toString()).toBe("theme=aurora-dark&lang=pt");
    expect(window.localStorage.getItem(STORAGE_KEYS.language)).toBe("pt");

    act(() => result.current.setLanguage("en"));
    expect(result.current.language).toBe("en");
  });

  it("keeps the root pathname as-is", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("", { pathname: "/" });
    await restore();
    act(() => result.current.onLanguageChange("pt"));
    expect(replaceUrlWithoutNavigation.mock.calls[0][0]).toBe("/");
  });

  it("finishes restoring when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = setup();
    await restore();
    expect(result.current.language).toBe("en");
    act(() => result.current.onLanguageChange("pt"));
    expect(result.current.language).toBe("pt");
  });
});

describe("useDocsShellState", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setWindowUrl("/docs");
  });

  function setupState(data = makeDocsData(), opts: Partial<Parameters<typeof useDocsShellState>[1]> = {}) {
    const replaceUrlWithoutNavigation = vi.fn();
    const searchParams = new URLSearchParams();
    const hook = renderHook(() =>
      useDocsShellState(data, {
        languageStorageKey: STORAGE_KEYS.language,
        themeModeStorageKey: STORAGE_KEYS.mode,
        themeLayoutStorageKey: STORAGE_KEYS.theme,
        blockMenuOnNav: false,
        searchParams,
        pathname: "/docs",
        getCurrentSearchParams: () => new URLSearchParams(window.location.search),
        replaceUrlWithoutNavigation,
        ...opts,
      }),
    );
    return { ...hook, replaceUrlWithoutNavigation };
  }

  it("composes popups, theme, language and navigation state", async () => {
    const { result } = setupState();
    await restore();
    expect(result.current).toMatchObject({
      menuOpen: false,
      sidebarOpen: false,
      activeThemeId: "aurora-dark",
      language: "en",
      pageIndex: 0,
    });
    act(() => result.current.onMenuClick(GUIDE, ["Guide-2"]));
    expect(result.current.pageIndex).toBe(1);
    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.menuOpen).toBe(false);
  });

  it("derives the default mode and base theme from the site, falling back to the first layout", () => {
    const light = setupState(makeDocsData({ config: makeConfig({ site: makeSite({ ThemeModeDefault: "light" }) }) }));
    expect(light.result.current.activeThemeId).toBe("aurora-light");

    const noDefault = setupState(makeDocsData({ config: makeConfig({ site: makeSite({ ThemeDefault: "" }) }) }));
    expect(noDefault.result.current.activeThemeId).toBe("aurora-dark");
  });

  it("uses the root path when no pathname is known and honours blockMenuOnNav", async () => {
    const { result, replaceUrlWithoutNavigation } = setupState(makeDocsData(), { pathname: null, blockMenuOnNav: true });
    await restore();
    act(() => result.current.onLanguageChange("pt"));
    expect(replaceUrlWithoutNavigation).toHaveBeenLastCalledWith("/", expect.any(URLSearchParams));

    act(() => result.current.onMenuClick(GUIDE, [], { fromLinearNav: true }));
    expect(result.current.sidebarOpen).toBe(false);
  });
});
