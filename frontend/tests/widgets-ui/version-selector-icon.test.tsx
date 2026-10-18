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

interface VersionControlsOptions {
  site?: Record<string, unknown>;
  mode?: "dark" | "light";
  versions?: Array<{ id: string; path: string }>;
}

function renderVersionControls({ site = {}, mode = "light", versions }: VersionControlsOptions = {}) {
  const onVersionChange = vi.fn();
  const config = withConfigDefaults({ ...makeConfig(), site: { ...makeSite({ audioPlayerEnabled: false }), ...site } });
  function ConfiguredControls() {
    const controls = useBuildDocsControlsConfig({
      data: makeDocsData({ config, ...(versions && { availableVersions: versions }) }), activeLayout: { mode }, language: "en",
      selectedVersionValue: "v1", activeThemeId: "aurora-dark", canToggleMode: false,
      nextModeIsDark: false, currentPage: undefined, pageHasMarkdown: true,
    });
    return <DocsShellControls {...controls} onVersionChange={onVersionChange}
      onOpenFocusMode={vi.fn()} onLanguageChange={vi.fn()} onThemeChange={vi.fn()}
      onOpenVersionLinksPopup={vi.fn()} onOpenInfoPopup={vi.fn()} onOpenQuickNavigation={vi.fn()} onToggleMode={vi.fn()}
    />;
  }
  render(<ConfiguredControls />);
  return onVersionChange;
}

it("selects a version from the configured icon and preserves its accessible name and current version", () => {
  const onVersionChange = renderVersionControls({ site: {
    icons: { VersionSelector: { reactIcon: true, tag: "InvalidIcon", colorDark: "red", colorLight: "blue", size: "26px" } },
  } });
  const trigger = screen.getByRole("button", { name: "Version" });
  expect(trigger.textContent).toBe("");
  expect(trigger.getAttribute("title")).toBe("Version: v1");
  expect(trigger.querySelector("svg")).not.toBeNull();
  expect(trigger.querySelector("span")?.style.color).toBe("blue");
  expect(trigger.querySelector("span")?.style.fontSize).toBe("26px");
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "v2" }));
  expect(onVersionChange).toHaveBeenCalledWith("v2");
  expect(document.activeElement).toBe(trigger);
});

it("inherits the version icon default when no presentation override is supplied", () => {
  renderVersionControls();
  const trigger = screen.getByRole("button", { name: "Version" });
  expect(trigger.textContent).toBe("");
  expect(trigger.querySelector("svg")).not.toBeNull();
});

it.each([false, "true", 1])("keeps the selected version as text unless reactIcon is boolean true (%s)", (reactIcon) => {
  const onVersionChange = renderVersionControls({ site: { icons: { VersionSelector: { reactIcon } } } });
  const trigger = screen.getByRole("button", { name: "Version" });
  expect(trigger.textContent).toBe("v1");
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "v2" }));
  expect(onVersionChange).toHaveBeenCalledWith("v2");
});

it.each([
  { mode: "dark" as const, color: "red" },
  { mode: "light" as const, color: "blue" },
])("supports legacy flat fields and the $mode icon color", ({ mode, color }) => {
  renderVersionControls({ mode, site: {
    IconVersionSelectorReactIcones: true,
    IconVersionSelectorReactIconesTag: "FiTag",
    IconVersionSelectorReactIconesTagColorDark: "red",
    IconVersionSelectorReactIconesTagColorLight: "blue",
    IconVersionSelectorReactIconesTagSize: "24px",
  } });
  const trigger = screen.getByRole("button", { name: "Version" });
  expect(trigger.textContent).toBe("");
  expect(trigger.querySelector("span")?.style.color).toBe(color);
  expect(trigger.querySelector("span")?.style.fontSize).toBe("24px");
});

it.each([{ versions: [] }, { versions: [{ id: "v1", path: "v1" }] }])("hides the version selector when fewer than two versions are available (%j)", ({ versions }) => {
  renderVersionControls({ versions });
  expect(screen.queryByRole("button", { name: "Version" })).toBeNull();
});

it("selects a version through the accessible small-screen dialog", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const onVersionChange = renderVersionControls();
  const trigger = screen.getByRole("button", { name: "Version" });
  fireEvent.click(trigger);
  expect(screen.getByRole("dialog", { name: "Version" })).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "v2" }));
  expect(onVersionChange).toHaveBeenCalledWith("v2");
  expect(screen.queryByRole("dialog", { name: "Version" })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
