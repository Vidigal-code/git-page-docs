// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useDocsShellState } from "@/widgets/docs-shell/model/use-docs-shell-state";
import { flushMicrotasks, makeDocsData, makeLayouts, makeSite, setWindowUrl, STORAGE_KEYS } from "./fixtures";

afterEach(cleanup);

it("keeps the configured violet theme when the selector is hidden despite the Polaris URL", async () => {
  window.localStorage.clear();
  const query = "theme=polaris-parallax-dark&modetheme=dark&menu=pt&id=10";
  const pathname = "/Vidigal-code/git-page-link-create";
  setWindowUrl(`${pathname}?${query}`);
  const data = makeDocsData();
  data.config.site = makeSite({ HideThemeSelector: true, ThemeDefault: "violet-dark", ThemeModeDefault: "dark" });
  const themeIds = { "aurora-dark": "violet-dark", "aurora-light": "violet-light", "mono-dark": "polaris-parallax-dark" };
  data.layoutsConfig.layouts = makeLayouts().map(layout => ({ ...layout, id: themeIds[layout.id as keyof typeof themeIds] }));
  const { result } = renderHook(() => useDocsShellState(data, {
    languageStorageKey: STORAGE_KEYS.language,
    themeModeStorageKey: STORAGE_KEYS.mode,
    themeLayoutStorageKey: STORAGE_KEYS.theme,
    blockMenuOnNav: false,
    searchParams: new URLSearchParams(query),
    pathname,
    getCurrentSearchParams: () => new URLSearchParams(window.location.search),
    replaceUrlWithoutNavigation: (nextPath, params) => setWindowUrl(`${nextPath}?${params}`),
  }));
  await act(async () => { await flushMicrotasks(); });
  expect(result.current.activeThemeId).toBe("violet-dark");
  expect(result.current.activeLayout?.id).toBe("violet-dark");
});
