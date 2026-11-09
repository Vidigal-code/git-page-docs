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

  it("lets a fixed family switch to its light counterpart", async () => {
    const { result } = setup("?theme=mono-dark&modetheme=dark", { themeSelectionMode: "fixed" });
    await restore();
    expect(result.current.canToggleMode).toBe(true);
    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(result.current.nextMode).toBe("dark");
  });

  it("uses the URL mode while keeping the configured family independent from saved themes", async () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    const { result, replaceUrlWithoutNavigation } = setup("?theme=mono-dark&modetheme=light", {
      themeSelectionMode: "fixed",
    });
    await restore();

    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("mono-dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();
  });

  it("restores the chosen mode on a new visit without replacing the saved theme family", async () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
    const firstVisit = setup("", { themeSelectionMode: "fixed" });
    await restore();
    act(() => firstVisit.result.current.onToggleMode());
    firstVisit.unmount();
    const nextVisit = setup("", { themeSelectionMode: "fixed" });
    await restore();
    expect(nextVisit.result.current.activeThemeId).toBe("aurora-light");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("mono-dark");
  });

  it("does not offer a mode whose matching template disables paired modes", async () => {
    const layouts = makeLayouts().map(layout => layout.id === "aurora-light"
      ? { ...layout, supportsLightAndDarkModes: false } : layout);
    const { result } = setup("", { layouts, themeSelectionMode: "fixed" });
    await restore();
    expect(result.current.canToggleMode).toBe(false);
    act(() => result.current.onToggleMode());
    expect(result.current.activeThemeId).toBe("aurora-dark");
  });

  it("keeps a saved light preference until its catalogue arrives", async () => {
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");
    const options: Partial<Args> = { themeSelectionMode: "fixed", layouts: [] };
    const { result, rerender } = setup("?theme=mono-dark", options);
    await restore();
    expect(result.current.canToggleMode).toBe(false);
    options.layouts = makeLayouts();
    rerender();
    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
  });

  it("follows saved mode changes without allowing another theme family", async () => {
    const { result, replaceUrlWithoutNavigation } = setup("?theme=mono-dark&modetheme=dark", {
      themeSelectionMode: "fixed",
      configuredDefaultMode: "light",
    });
    await restore();
    window.localStorage.setItem(STORAGE_KEYS.mode, "light");

    act(() => {
      result.current.onThemeChange("mono-dark");
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.mode }));
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.activeThemeId).toBe("aurora-light");
    expect(result.current.activeLayout?.mode).toBe("light");
    expect(result.current.canToggleMode).toBe(true);
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(STORAGE_KEYS.mode)).toBe("light");
  });

  it("applies a newly fixed family while retaining the previously selected mode", async () => {
    const options: Partial<Args> = { themeSelectionMode: "selectable" };
    const { result, rerender, replaceUrlWithoutNavigation } = setup("?theme=mono-dark", options);
    await restore();
    expect(result.current.activeThemeId).toBe("mono-dark");

    options.themeSelectionMode = "fixed";
    options.configuredDefaultMode = "light";
    rerender();

    expect(result.current.activeThemeId).toBe("aurora-dark");
    expect(result.current.canToggleMode).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("mono-dark");
    expect(replaceUrlWithoutNavigation).not.toHaveBeenCalled();
  });

  it.each([
    { initialThemeBaseId: "missing", expected: "aurora-light", canToggle: true },
    { initialThemeBaseId: "mono-dark", expected: "mono-dark", canToggle: false },
  ])("preserves catalogue fallbacks for a fixed $initialThemeBaseId theme", async ({ initialThemeBaseId, expected, canToggle }) => {
    const { result } = setup("?theme=aurora-dark", {
      themeSelectionMode: "fixed", configuredDefaultMode: "light", initialThemeBaseId,
    });
    await restore();
    expect(result.current.activeThemeId).toBe(expected);
    expect(result.current.canToggleMode).toBe(canToggle);
  });

  it.each(["?theme=vscode-dark&modetheme=dark", "?theme=vscode-dark"])(
    "uses the destination default when the requested theme is unavailable (%s)",
    async (search) => {
      window.localStorage.setItem(STORAGE_KEYS.theme, "mono-dark");
      window.localStorage.setItem(STORAGE_KEYS.mode, "dark");
      const { result, replaceUrlWithoutNavigation } = setup(search, { configuredDefaultMode: "light" });
      await restore();
      expect(result.current.activeThemeId).toBe("aurora-light");
      expect(lastUrlSync(replaceUrlWithoutNavigation)).toBe("theme=aurora-light&modetheme=light");
    },
  );

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
