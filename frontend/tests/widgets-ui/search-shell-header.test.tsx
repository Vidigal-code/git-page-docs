// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import { SearchShellHeader } from "@/widgets/search-shell-header";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function headerProps(): ComponentProps<typeof SearchShellHeader> {
  return {
    siteName: "Documentation", basePath: "", language: "en", languages: ["en", "pt"],
    onLanguageChange: vi.fn(), activeThemeId: "dark", onThemeChange: vi.fn(),
    layouts: [
      { id: "dark", name: "Dark", mode: "dark", author: "", file: "dark.json", preview: "", supportsLightAndDarkModes: false },
      { id: "light", name: "Light", mode: "light", author: "", file: "light.json", preview: "", supportsLightAndDarkModes: false },
    ],
    nextModeIsDark: true, canToggleMode: false, onToggleMode: vi.fn(),
    getLanguageLabel: (language) => language === "pt" ? "Português" : "English",
  };
}

it("keeps language and theme choices available through configurable icon triggers", () => {
  const props = headerProps();
  render(<SearchShellHeader
    {...props}
    languageSelectorIcon={{ tag: "FiGlobe", style: { color: "red", fontSize: "24px" } }}
    themeSelectorIcon={{ tag: "BsSunFill", style: { color: "blue", fontSize: "22px" } }}
  />);

  const languageTrigger = screen.getByRole("button", { name: "Language selector" });
  expect(languageTrigger.textContent).toBe("");
  expect(languageTrigger.querySelector("svg")).not.toBeNull();
  fireEvent.click(languageTrigger);
  fireEvent.click(screen.getByRole("button", { name: "Português" }));
  expect(props.onLanguageChange).toHaveBeenCalledWith("pt");

  const themeTrigger = screen.getByRole("button", { name: "Theme selector" });
  expect(themeTrigger.textContent).toBe("");
  expect(themeTrigger.querySelector("svg")).not.toBeNull();
  fireEvent.click(themeTrigger);
  fireEvent.click(screen.getByRole("button", { name: "Light" }));
  expect(props.onThemeChange).toHaveBeenCalledWith("light");
});

it("keeps the current text presentation when icons are not configured", () => {
  render(<SearchShellHeader {...headerProps()} />);

  expect(screen.getByRole("button", { name: "Language selector" }).textContent).toBe("English");
  expect(screen.getByRole("button", { name: "Theme selector" }).textContent).toBe("Dark");
});

it("opens language choices from an icon in the mobile drawer", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const props = headerProps();
  render(<SearchShellHeader {...props} languageSelectorIcon={{ tag: "FiGlobe", style: {} }} />);

  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  const drawer = screen.getByRole("complementary");
  const languageTrigger = within(drawer).getByRole("button", { name: "Language selector" });
  expect(languageTrigger.textContent).toBe("");
  fireEvent.click(languageTrigger);
  const dialog = screen.getByRole("dialog", { name: "Language selector" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Português" }));

  expect(props.onLanguageChange).toHaveBeenCalledWith("pt");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(languageTrigger);
});
