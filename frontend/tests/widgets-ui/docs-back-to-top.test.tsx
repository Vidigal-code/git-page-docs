// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import type { SiteConfig } from "@/entities/docs";
import { makeConfig, makeDocsData, makeSite } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2400);
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function renderDocumentation(site: Partial<SiteConfig> = {}): void {
  const data = makeDocsData({ config: makeConfig({ site: makeSite({ AiChatEnabled: false, ...site }) }) });
  render(<DocsShell data={data} />);
}

it("offers a return-to-top arrow at the end of a long documentation page", () => {
  renderDocumentation();
  const button = screen.getByRole("button", { name: "Back to top" });
  const main = screen.getByRole("main");
  expect(main.contains(button)).toBe(true);
  fireEvent.click(button);
  expect(document.activeElement).toBe(main);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
});

it("does not offer the arrow for a short documentation page", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2399);
  renderDocumentation();
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
});

it.each([{ enabled: false }, { minPageHeightViewports: 4 }])("respects the documentation return-to-top settings %j", (backToTop) => {
  renderDocumentation({ backToTop });
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
});

it("uses the configured lower threshold on documentation pages", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);
  renderDocumentation({ backToTop: { minPageHeightViewports: 2.5 } });
  expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
});

it("uses the site's localized return-to-top label", () => {
  renderDocumentation({ langmenu: { en: { backToTop: "Return to the beginning" } } });
  expect(screen.getByRole("button", { name: "Return to the beginning" })).toBeTruthy();
});

it("respects the current reduced-motion preference when returning focus to the beginning", () => {
  renderDocumentation();
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" }));
  fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  expect(document.activeElement).toBe(screen.getByRole("main"));
});

it("keeps the page return-to-top control outside the focus dialog", async () => {
  renderDocumentation({ FocusMode: true });
  fireEvent.click(await screen.findByRole("button", { name: "Focus mode" }));
  const dialog = await screen.findByRole("dialog", { name: "Focus mode" });
  expect(within(dialog).queryByRole("button", { name: "Back to top" })).toBeNull();
});
