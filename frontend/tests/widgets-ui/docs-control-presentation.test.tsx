// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { withConfigDefaults } from "@/entities/docs/lib/with-config-defaults";
import { DocsShellControls } from "@/widgets/docs-shell/ui/docs-shell-controls";
import { useBuildDocsControlsConfig } from "@/widgets/docs-shell/model/use-build-docs-controls-config";
import { makeConfig, makeDocsData, makeSite } from "../widgets-model/fixtures";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

interface ControlsOptions {
  site?: Record<string, unknown>;
  mode?: "dark" | "light";
  pageHasMarkdown?: boolean;
}

function renderControls({ site = {}, mode = "dark", pageHasMarkdown = true }: ControlsOptions = {}) {
  const onFocus = vi.fn();
  const onLanguageChange = vi.fn();
  const onThemeChange = vi.fn();
  const onQuickNavigation = vi.fn();
  const config = withConfigDefaults({
    ...makeConfig(),
    site: { ...makeSite({ FocusMode: true, audioPlayerEnabled: false }), ...site },
  });
  function ConfiguredControls() {
    const controls = useBuildDocsControlsConfig({
      data: makeDocsData({ config }), activeLayout: { mode }, language: "en",
      selectedVersionValue: "v1", activeThemeId: "aurora-dark", canToggleMode: false,
      nextModeIsDark: false, currentPage: undefined, pageHasMarkdown,
    });
    return <DocsShellControls {...controls}
      onOpenFocusMode={onFocus} onLanguageChange={onLanguageChange} onThemeChange={onThemeChange}
      onOpenVersionLinksPopup={vi.fn()} onOpenInfoPopup={vi.fn()} onOpenQuickNavigation={onQuickNavigation}
      onVersionChange={vi.fn()} onToggleMode={vi.fn()}
    />;
  }
  render(<ConfiguredControls />);
  return { onFocus, onLanguageChange, onThemeChange, onQuickNavigation };
}

it("opens focus mode from an icon configured in the compact site settings", () => {
  const { onFocus } = renderControls({ site: {
    icons: { FocusMode: { reactIcon: true, tag: "MdFullscreen", size: "24px", colorDark: "red" } },
  } });
  const button = screen.getByRole("button", { name: "Focus mode" });
  expect(button.textContent).toBe("");
  expect(button.querySelector("svg")).not.toBeNull();
  fireEvent.click(button);
  expect(onFocus).toHaveBeenCalledOnce();
});

it("opens quick navigation from its configured icon while preserving the shortcut label", () => {
  const { onQuickNavigation } = renderControls({ site: {
    ActiveNavigation: true,
    icons: { QuickNavigation: { reactIcon: true, tag: "FiSearch", size: "24px" } },
  } });
  const button = screen.getByRole("button", { name: "Ctrl+K" });
  expect(button.textContent).toBe("");
  expect(button.querySelector("svg")).not.toBeNull();
  expect(button.getAttribute("title")).toBe("Ctrl+K");
  fireEvent.click(button);
  expect(onQuickNavigation).toHaveBeenCalledOnce();
});

it("configures language and theme icons independently through site.icons", () => {
  const { onLanguageChange } = renderControls({ site: {
    icons: { LanguageSelector: { reactIcon: true, tag: "FiGlobe" }, ThemeSelector: { reactIcon: false } },
  } });
  const language = screen.getByRole("button", { name: "Language selector" });
  expect(language.textContent).toBe("");
  expect(screen.getByRole("button", { name: "Theme selector" }).textContent).toBe("aurora-dark");
  fireEvent.click(language);
  fireEvent.click(screen.getByRole("button", { name: "Portuguese" }));
  expect(onLanguageChange).toHaveBeenCalledWith("pt");
});

it("inherits icon defaults when the compact control flags are omitted", () => {
  renderControls({ site: { ActiveNavigation: true, icons: {
    FocusMode: {}, QuickNavigation: {}, LanguageSelector: {}, ThemeSelector: {},
  } } });
  for (const name of ["Focus mode", "Ctrl+K", "Language selector", "Theme selector"]) {
    const button = screen.getByRole("button", { name });
    expect(button.textContent).toBe("");
    expect(button.querySelector("svg")).not.toBeNull();
  }
});

it.each([false, "true", 1])("keeps text controls when reactIcon is overridden without a boolean true (%s)", (reactIcon) => {
  renderControls({ site: { ActiveNavigation: true, icons: {
    FocusMode: { reactIcon }, QuickNavigation: { reactIcon }, LanguageSelector: { reactIcon }, ThemeSelector: { reactIcon },
  } } });
  expect(screen.getByRole("button", { name: "Focus mode" }).textContent).toBe("Focus mode");
  expect(screen.getByRole("button", { name: "Ctrl+K" }).textContent).toBe("Ctrl+K");
  expect(screen.getByRole("button", { name: "Language selector" }).textContent).toBe("English");
  expect(screen.getByRole("button", { name: "Theme selector" }).textContent).toBe("aurora-dark");
});

it("uses the active mode color and a usable fallback for an invalid icon tag", () => {
  renderControls({ mode: "light", site: { icons: {
    FocusMode: { reactIcon: true, tag: "InvalidIconName", size: "28px", colorDark: "red", colorLight: "blue" },
  } } });
  const button = screen.getByRole("button", { name: "Focus mode" });
  const icon = button.querySelector("span");
  expect(icon?.style.color).toBe("blue");
  expect(icon?.style.fontSize).toBe("28px");
  expect(button.querySelector("svg")).not.toBeNull();
});

it("keeps focus unavailable on pages without Markdown regardless of icon settings", () => {
  renderControls({ pageHasMarkdown: false, site: { icons: { FocusMode: { reactIcon: true } } } });
  expect(screen.queryByRole("button", { name: "Focus mode" })).toBeNull();
});
