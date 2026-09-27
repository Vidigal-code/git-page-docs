// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import { useDocsShellThemeState } from "@/widgets/docs-shell/model/use-docs-shell-theme-state";
import { STORAGE_KEYS, flushMicrotasks, makeLayouts, setWindowUrl } from "./fixtures";

type Args = Parameters<typeof useDocsShellThemeState>[0];

function setup(search = "", overrides: Partial<Args> = {}) {
  setWindowUrl(`/docs${search}`);
  // Mirrors the real implementation: the rewritten query becomes the live window query.
  const replaceUrlWithoutNavigation = vi.fn((path: string, params: URLSearchParams) => {
    const qs = params.toString();
    setWindowUrl(qs ? `${path}?${qs}` : path);
  });
  const getCurrentSearchParams = vi.fn(() => new URLSearchParams(window.location.search));
  const searchParams = new URLSearchParams(search);
  const hook = renderHook(() =>
    useDocsShellThemeState({
      layouts: makeLayouts(),
      configuredDefaultMode: "dark",
      initialThemeBaseId: "aurora-dark",
      searchParams,
      themeModeStorageKey: STORAGE_KEYS.mode,
      themeLayoutStorageKey: STORAGE_KEYS.theme,
      pathname: "/docs",
      getCurrentSearchParams,
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

function lastUrlSync(replace: ReturnType<typeof vi.fn>): string | undefined {
  const call = replace.mock.calls.at(-1);
  return call ? (call[1] as URLSearchParams).toString() : undefined;
}

afterEach(cleanup);

describe("useDocsShellThemeState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts on the configured base theme resolved for the default mode", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("", { configuredDefaultMode: "light" });
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(result.current.nextMode).toBe("dark");
    expect(result.current.canToggleMode).toBe(true);

    await restore();
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("aurora-light");
    expect(replaceUrlWithoutNavigation).toHaveBeenCalledWith("/docs", expect.any(URLSearchParams));
    expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("theme=aurora-light&modetheme=light");
  });

  it("lets an explicit theme in the URL win and leaves the URL alone", async () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "aurora-light");
    const { result, replaceUrlWithoutNavigation } = setup("?theme=mono-dark");
    await restore();
    expect(result.current.activeThemeId).toBe("mono-dark");
    expect(result.current.canToggleMode).toBe(false);
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();
  });

  it("resolves modetheme from the URL over a saved theme and writes the theme back", async () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
    const { result, replaceUrlWithoutNavigation } = setup("?modetheme=light&x=1");
    await restore();
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("modetheme=light&x=1&theme=aurora-light");
  });

  it("restores a saved theme id before a saved mode when the URL has none", async () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    const { result } = setup();
    await restore();
    expect(result.current.activeThemeId).toBe("mono-dark");
  });

  it("falls back to the saved mode, then to the configured default", async () => {
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    const saved = setup();
    await restore();
    expect(saved.result.current.activeThemeId).toBe("aurora-light");

    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEYS.theme, "unknown-theme");
    window.localStorage.setItem(STORAGE_KEYS.mode, "sideways");
    const fallback = setup("?theme=nope");
    await restore();
    expect(fallback.result.current.activeThemeId).toBe("aurora-dark");
  });

  it("changes theme and toggles mode, syncing the URL each time", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("?theme=aurora-dark&modetheme=dark");
    await restore();
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();

    act(() => result.current.onThemeChange("mono-dark"));
    expect(result.current.activeThemeId).toBe("mono-dark");
    expect(result.current.activeLayout?.id).toBe("mono-dark");
    expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("theme=mono-dark&modetheme=dark");

    act(() => result.current.onThemeChange("aurora-dark"));
    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(result.current.nextMode).toBe("dark");
    expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("theme=aurora-light&modetheme=light");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("aurora-light");
  });

  it("omits modetheme when the chosen theme is unknown", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("?theme=aurora-dark");
    await restore();
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();
    act(() => result.current.onThemeChange("ghost"));
    expect(replaceUrlWithoutNavigation).toHaveBeenCalledTimes(1);
    expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("theme=ghost");
    // The unknown id falls back to the first layout for display purposes.
    expect(result.current.activeLayout?.id).toBe("aurora-dark");
  });

  it("is inert without layouts", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("", { layouts: [], initialThemeBaseId: undefined });
    expect(result.current.activeThemeId).toBe("");
    await restore();
    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("");
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();
  });

  it("follows the saved mode when another tab changes it or the page regains focus", async () => {
    const { result } = setup();
    await restore();
    expect(result.current.activeThemeId).toBe("aurora-dark");

    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    });
    expect(result.current.activeThemeId).toBe("aurora-dark");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.mode }));
    });
    expect(result.current.activeThemeId).toBe("aurora-light");

    window.localStorage.setItem(STORAGE_KEYS.mode, "dark");
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.activeThemeId).toBe("aurora-dark");

    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.activeThemeId).toBe("aurora-dark");
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.activeThemeId).toBe("aurora-light");
  });

  it("still completes the restore when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result, replaceUrlWithoutNavigation } = setup();
    await restore();
    expect(result.current.activeThemeId).toBe("aurora-dark");
    expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("theme=aurora-dark&modetheme=dark");
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.activeThemeId).toBe("aurora-dark");
  });
});
