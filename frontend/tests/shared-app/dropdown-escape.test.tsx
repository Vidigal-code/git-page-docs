// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { SearchShellHeader } from "@/widgets/search-shell-header";
import { DropdownSelector } from "@/shared/ui/dropdown-selector";

const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");

beforeEach(() => {
  vi.stubGlobal("matchMedia", (media: string): MediaQueryList => ({
    matches: media === "(hover: hover)", media, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: () => true,
  }));
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

it("keeps the hovered selector closed after Escape until the pointer leaves and returns", () => {
  render(<DropdownSelector label="Theme selector" selectedId="light" onSelect={vi.fn()}
    options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }]} />);
  const trigger = screen.getByRole("button", { name: "Theme selector" });
  fireEvent.mouseOver(trigger);
  trigger.focus();
  expect(screen.getByRole("list", { name: "Theme selector" })).not.toBeNull();
  fireEvent.keyDown(trigger, { key: "Escape" });
  expect(screen.queryByRole("list", { name: "Theme selector" })).toBeNull();
  expect(document.activeElement).toBe(trigger);
  fireEvent.mouseOver(trigger, { relatedTarget: document.body });
  expect(screen.queryByRole("list", { name: "Theme selector" })).toBeNull();
  fireEvent.mouseOut(trigger, { relatedTarget: document.body });
  fireEvent.mouseOver(trigger, { relatedTarget: document.body });
  expect(screen.getByRole("list", { name: "Theme selector" })).not.toBeNull();
});

it("closes the selector before its containing drawer and keeps focus on the trigger", () => {
  render(<SearchShellHeader siteName="Documentation" basePath="" language="en" languages={["en"]}
    onLanguageChange={vi.fn()} activeThemeId="light" onThemeChange={vi.fn()}
    layouts={[
      { id: "dark", name: "Dark", mode: "dark", author: "", file: "dark.json", preview: "", supportsLightAndDarkModes: false },
      { id: "light", name: "Light", mode: "light", author: "", file: "light.json", preview: "", supportsLightAndDarkModes: false },
    ]}
    nextModeIsDark={false} canToggleMode={false} onToggleMode={vi.fn()} getLanguageLabel={() => "English"} />);
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  const drawer = screen.getByRole("complementary");
  const trigger = within(drawer).getByRole("button", { name: "Theme selector" });
  fireEvent.click(trigger);
  const option = within(drawer).getByRole("button", { name: "Dark" });
  option.focus();
  fireEvent.keyDown(option, { key: "Escape" });
  expect(screen.queryByRole("list", { name: "Theme selector" })).toBeNull();
  expect(screen.getByRole("complementary")).toBe(drawer);
  expect(document.activeElement).toBe(trigger);
  fireEvent.keyDown(trigger, { key: "Escape" });
  expect(screen.queryByRole("complementary")).toBeNull();
});
