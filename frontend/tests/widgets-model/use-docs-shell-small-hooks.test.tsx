// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { useDocsPreferences } from "@/widgets/docs-shell/model/use-docs-preferences";
import { useDocsShellPopups } from "@/widgets/docs-shell/model/use-docs-shell-popups";
import { useBuildNavMenuConfig } from "@/widgets/docs-shell/model/use-build-nav-menu-config";
import {
  DocsShellProvider,
  useDocsShellContext,
  useDocsShellContextOptional,
  type DocsShellContextValue,
} from "@/widgets/docs-shell/model/docs-shell-context";
import { makeConfig, makeDocsData, makeSite, STORAGE_KEYS } from "./fixtures";

afterEach(cleanup);

describe("useDocsPreferences", () => {
  it("derives namespaced storage keys from the site name", () => {
    const { result, rerender } = renderHook(({ name }) => useDocsPreferences(name), {
      initialProps: { name: "Demo Docs" },
    });
    expect(result.current).toMatchObject({
      languageStorageKey: STORAGE_KEYS.language,
      versionStorageKey: STORAGE_KEYS.version,
      themeModeStorageKey: STORAGE_KEYS.mode,
      themeLayoutStorageKey: STORAGE_KEYS.theme,
    });
    expect(result.current.languageRestoredRef.current).toBe(false);
    expect(result.current.themeModeRestoredRef.current).toBe(false);

    rerender({ name: "My Other Site" });
    expect(result.current.languageStorageKey).toBe("git-page-docs:language:my-other-site");
  });
});

describe("useDocsShellPopups", () => {
  it("starts with everything closed and exposes independent setters", () => {
    const { result } = renderHook(() => useDocsShellPopups());
    expect(result.current).toMatchObject({
      menuOpen: false,
      sidebarOpen: false,
      versionLinksPopupOpen: false,
      infoPopupOpen: false,
    });
    act(() => {
      result.current.setMenuOpen(true);
      result.current.setSidebarOpen(true);
      result.current.setVersionLinksPopupOpen(true);
      result.current.setInfoPopupOpen(true);
    });
    expect(result.current).toMatchObject({
      menuOpen: true,
      sidebarOpen: true,
      versionLinksPopupOpen: true,
      infoPopupOpen: true,
    });
  });
});

describe("useBuildNavMenuConfig", () => {
  it("resolves every nav icon and the block-menu labels, memoised per input", () => {
    const config = makeConfig({
      site: makeSite({
        langmenu: {
          en: { blockMenuOnNavActive: "Pin menu", blockMenuOnNavInactive: "Unpin menu" },
          pt: { blockMenuOnNavActive: "Fixar menu" },
        },
      }),
    });
    const { result, rerender } = renderHook(({ mode, lang }) => useBuildNavMenuConfig(config, mode, lang), {
      initialProps: { mode: "dark" as "dark" | "light", lang: "en" },
    });
    const first = result.current;
    for (const key of [
      "navMenuOpenIcon",
      "navMenuCloseIcon",
      "navMenuMobileOpenIcon",
      "navMenuMobileCloseIcon",
      "navMenuBlockActiveIcon",
      "navMenuBlockInactiveIcon",
      "sidebarCollapseIcon",
      "sidebarExpandIcon",
    ] as const) {
      expect(first[key]).toEqual(expect.any(Object));
    }
    expect(first.blockMenuOnNavLabelActive).toBe("Pin menu");
    expect(first.blockMenuOnNavLabelInactive).toBe("Unpin menu");

    rerender({ mode: "dark", lang: "en" });
    expect(result.current).toBe(first);

    rerender({ mode: "light", lang: "pt" });
    expect(result.current).not.toBe(first);
    expect(result.current.blockMenuOnNavLabelActive).toBe("Fixar menu");
    expect(result.current.blockMenuOnNavLabelInactive).toBe("Unpin menu");
  });

  it("uses the default labels when the langmenu has none", () => {
    const { result } = renderHook(() => useBuildNavMenuConfig(makeConfig(), "dark", "en"));
    expect(result.current.blockMenuOnNavLabelActive).toBe("Block menu on navigation");
    expect(result.current.blockMenuOnNavLabelInactive).toBe("Allow menu on navigation");
  });
});

describe("DocsShellProvider", () => {
  const value: DocsShellContextValue = {
    data: makeDocsData(),
    language: "en",
    currentPage: undefined,
    labels: {
      menuOpenLabel: "Menu",
      menuCloseLabel: "Close",
      previousLabel: "Previous",
      nextLabel: "Next",
      browsePrevLabel: "Previous",
      browseNextLabel: "Next",
      fullscreenExpandLabel: "Fullscreen",
      quickNavPlaceholder: "Type",
      navigateHintLabel: "Navigate",
      selectHintLabel: "Select",
      escHintLabel: "ESC",
      closeHintLabel: "Close",
      noNavigationResults: "None",
    },
    routeGuideConfig: { enabled: true },
  };
  const wrapper = ({ children }: { children: ReactNode }) => <DocsShellProvider value={value}>{children}</DocsShellProvider>;

  it("exposes the provided value to consumers", () => {
    const required = renderHook(() => useDocsShellContext(), { wrapper });
    expect(required.result.current).toBe(value);
    const optional = renderHook(() => useDocsShellContextOptional(), { wrapper });
    expect(optional.result.current).toBe(value);
  });

  it("throws for the required hook and returns null for the optional one outside a provider", () => {
    expect(() => renderHook(() => useDocsShellContext())).toThrow(/within DocsShellProvider/);
    const { result } = renderHook(() => useDocsShellContextOptional());
    expect(result.current).toBeNull();
  });
});
