// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LanguageSelector } from "@/features/language-selector";
import { ThemeSelector } from "@/features/theme-selector";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});

it("selects a theme from an icon trigger without changing the option labels", () => {
  const onChange = vi.fn();
  render(<ThemeSelector
    layouts={[{ id: "aurora", name: "Aurora" }, { id: "mono", name: "Mono" }]}
    value="aurora" onChange={onChange} ariaLabel="Theme selector"
    icon={{ tag: "BsSunFill", style: {} }}
  />);
  const trigger = screen.getByRole("button", { name: "Theme selector" });
  expect(trigger.textContent).toBe("");
  expect(trigger.querySelector("svg")).not.toBeNull();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Mono" }));
  expect(onChange).toHaveBeenCalledWith("mono");
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("selects a language from an accessible icon trigger", () => {
  const onChange = vi.fn();
  render(<LanguageSelector
    languages={["en", "pt"]} value="en" getLabel={(lang) => lang === "pt" ? "Português" : "English"}
    onChange={onChange} ariaLabel="Language selector"
    icon={{ tag: "FiGlobe", style: { color: "red", fontSize: "24px" } }}
  />);
  const trigger = screen.getByRole("button", { name: "Language selector" });
  expect(trigger.textContent).toBe("");
  expect(trigger.querySelector("svg")).not.toBeNull();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Português" }));
  expect(onChange).toHaveBeenCalledWith("pt");
  expect(document.activeElement).toBe(trigger);
});
