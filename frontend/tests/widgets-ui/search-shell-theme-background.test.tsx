// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { SearchShellLayout } from "@/widgets/search-shell-layout";
import { SearchShellHeader } from "@/widgets/search-shell-header";
import type { ThemeTemplate } from "@/entities/docs";
import type { ReactNode } from "react";

const theme: ThemeTemplate = {
  id: "motion", name: "Motion", author: "Project", version: "1", mode: "dark",
  supportsLightAndDarkModes: false, colors: {}, typography: { fontFamily: "sans-serif", fontSize: {} },
  components: {}, animations: {},
  backgroundEffects: { enabled: true, layers: [{ id: "stars", kind: "stars", count: 1 }] },
};

function renderHeader(control: ReactNode) {
  return <SearchShellHeader siteName="Docs" basePath="" language="en" languages={["en"]}
    onLanguageChange={vi.fn()} activeThemeId="motion" layouts={[]} onThemeChange={vi.fn()}
    nextModeIsDark canToggleMode={false} onToggleMode={vi.fn()} getLanguageLabel={(language) => language}
    additionalControls={control} />;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it.each([
  ["pt", "Pausar animação de fundo"],
  ["es", "Pausar animación de fondo"],
  ["unknown", "Pause background animation"],
])("provides localized fallback controls for %s", async (language, label) => {
  render(<SearchShellLayout header={renderHeader} theme={theme} projectFooterUrl="https://example.com" language={language}>
    Content
  </SearchShellLayout>);
  expect(await screen.findByRole("button", { name: label })).toBeTruthy();
});

it("shares background playback between the standalone header and its mobile drawer", async () => {
  render(<SearchShellLayout header={renderHeader} theme={theme} projectFooterUrl="https://example.com" language="en">
    <p>Content</p>
  </SearchShellLayout>);
  const pause = await screen.findByRole("button", { name: "Pause background animation" });
  expect(pause.closest("header")).not.toBeNull();
  fireEvent.click(pause);
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  let drawer = screen.getByRole("complementary");
  expect(within(drawer).getByRole("button", { name: "Resume background animation" }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(within(drawer).getByRole("button", { name: "Close menu" }));
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  drawer = screen.getByRole("complementary");
  fireEvent.click(within(drawer).getByRole("button", { name: "Resume background animation" }));
  expect(within(drawer).getByRole("button", { name: "Pause background animation" }).getAttribute("aria-pressed")).toBe("false");
});

it("uses configured labels and icon styling, and can hide the control without disabling the background", async () => {
  const siteConfig = {
    langmenu: { en: { backgroundAnimationPause: "Freeze stars", backgroundAnimationResume: "Move stars" } },
    IconBackgroundAnimationPauseReactIcones: true,
    IconBackgroundAnimationPauseReactIconesTag: "FiPause",
    IconBackgroundAnimationPauseReactIconesTagColorDark: "red",
    IconBackgroundAnimationPauseReactIconesTagSize: "24px",
  };
  const { rerender } = render(<SearchShellLayout header={renderHeader} theme={theme} siteConfig={siteConfig}
    projectFooterUrl="https://example.com" language="en">Content</SearchShellLayout>);
  const control = await screen.findByRole("button", { name: "Freeze stars" });
  expect(control.textContent).toBe("");
  expect(control.querySelector("span")?.style.color).toBe("red");
  fireEvent.click(control);
  expect(screen.getByRole("button", { name: "Move stars" }).textContent).toBe("Move stars");
  rerender(<SearchShellLayout header={renderHeader} theme={theme} siteConfig={siteConfig}
    backgroundEffects={{ overrides: { accessibility: { showPauseButton: false } } }}
    projectFooterUrl="https://example.com" language="en">Content</SearchShellLayout>);
  expect(screen.queryByRole("button", { name: "Move stars" })).toBeNull();
  expect(document.querySelector('[data-background-effects="true"]')).not.toBeNull();
});

it("preserves manual pause when leaving an animated theme and returning to it", async () => {
  const { rerender } = render(<SearchShellLayout header={renderHeader} theme={theme}
    projectFooterUrl="https://example.com" language="en">Content</SearchShellLayout>);
  fireEvent.click(await screen.findByRole("button", { name: "Pause background animation" }));
  rerender(<SearchShellLayout header={renderHeader} projectFooterUrl="https://example.com" language="en">Content</SearchShellLayout>);
  expect(screen.queryByRole("button", { name: "Resume background animation" })).toBeNull();
  rerender(<SearchShellLayout header={renderHeader} theme={theme}
    projectFooterUrl="https://example.com" language="en">Content</SearchShellLayout>);
  expect((await screen.findByRole("button", { name: "Resume background animation" })).getAttribute("aria-pressed")).toBe("true");
});
