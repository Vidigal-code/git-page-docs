// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { SHELL_THEME_CACHE_KEY, fetchOfficialSiteConfig, loadStandaloneLayoutsAndThemes } from "@/entities/docs";
import type { OfficialSiteConfig, ThemeTemplate } from "@/entities/docs";
import { useStandaloneShellConfig } from "@/widgets/search-shell-header/model/use-standalone-shell-config";
import { makeLayouts } from "./fixtures";

vi.mock("@/entities/docs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/docs")>();
  return { ...actual, loadStandaloneLayoutsAndThemes: vi.fn(), fetchOfficialSiteConfig: vi.fn() };
});

const loadMock = vi.mocked(loadStandaloneLayoutsAndThemes);
const siteMock = vi.mocked(fetchOfficialSiteConfig);

function theme(id: string): ThemeTemplate {
  return {
    id,
    name: id,
    author: "tests",
    version: "1",
    mode: "dark",
    supportsLightAndDarkModes: false,
    colors: {},
    typography: { fontFamily: "monospace", fontSize: {} },
    components: {},
    animations: {},
  };
}

const CACHED = { layoutsConfig: { layouts: makeLayouts().slice(0, 1) }, themes: { "aurora-dark": theme("aurora-dark") } };
const REMOTE = { layoutsConfig: { layouts: makeLayouts() }, themes: { "mono-dark": theme("mono-dark") } };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

afterEach(cleanup);

describe("useStandaloneShellConfig", () => {
  beforeEach(() => {
    window.localStorage.clear();
    loadMock.mockReset();
    siteMock.mockReset();
  });

  it("adopts the cached catalogue immediately and swaps in the remote result", async () => {
    window.localStorage.setItem(SHELL_THEME_CACHE_KEY, JSON.stringify(CACHED));
    const remote = deferred<typeof REMOTE>();
    loadMock.mockReturnValue(remote.promise);
    siteMock.mockResolvedValue({ name: "Official" } as OfficialSiteConfig);

    const { result } = renderHook(() => useStandaloneShellConfig());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.config?.layoutsConfig.layouts.map((l) => l.id)).toEqual(["aurora-dark"]);
    expect(result.current.config?.siteConfig).toBeUndefined();

    await act(async () => {
      remote.resolve(REMOTE);
      await remote.promise;
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config?.layoutsConfig.layouts.map((l) => l.id)).toEqual(["aurora-dark", "aurora-light", "mono-dark"]);
    expect(result.current.config?.siteConfig).toEqual({ name: "Official" });
    expect(JSON.parse(window.localStorage.getItem(SHELL_THEME_CACHE_KEY) ?? "{}")).toEqual(REMOTE);
  });

  it("starts empty without a cache and stores a null site config as undefined", async () => {
    loadMock.mockResolvedValue(REMOTE);
    siteMock.mockResolvedValue(null);
    const { result } = renderHook(() => useStandaloneShellConfig());
    expect(result.current.config).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config?.themes).toEqual(REMOTE.themes);
    expect(result.current.config?.siteConfig).toBeUndefined();
  });

  it("keeps the cached catalogue when the remote fetch fails", async () => {
    window.localStorage.setItem(SHELL_THEME_CACHE_KEY, JSON.stringify(CACHED));
    loadMock.mockRejectedValue(new Error("offline"));
    siteMock.mockResolvedValue(null);
    const { result } = renderHook(() => useStandaloneShellConfig());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config?.layoutsConfig.layouts.map((l) => l.id)).toEqual(["aurora-dark"]);
    expect(window.localStorage.getItem(SHELL_THEME_CACHE_KEY)).toBe(JSON.stringify(CACHED));
  });

  it("ignores results that arrive after unmount", async () => {
    const remote = deferred<typeof REMOTE>();
    loadMock.mockReturnValue(remote.promise);
    siteMock.mockResolvedValue(null);
    const { result, unmount } = renderHook(() => useStandaloneShellConfig());
    unmount();
    await act(async () => {
      remote.resolve(REMOTE);
      await remote.promise;
    });
    expect(result.current.config).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(window.localStorage.getItem(SHELL_THEME_CACHE_KEY)).toBeNull();
  });
});
