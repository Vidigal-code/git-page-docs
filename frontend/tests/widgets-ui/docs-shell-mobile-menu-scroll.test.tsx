// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import { makeConfig, makeDocsData } from "../widgets-model/fixtures";

const PANEL_HEIGHT = 300;
const PANEL_WIDTH = 280;
const ITEM_HEIGHT = 44;
const ITEM_TOP: Record<string, number> = { Intro: 40, Install: 600 };
const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.tagName === "ASIDE" ? PANEL_HEIGHT : 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.tagName === "ASIDE") return new DOMRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
    const top = ITEM_TOP[this.textContent ?? ""] ?? 0;
    return new DOMRect(0, top - (this.closest("aside")?.scrollTop ?? 0), PANEL_WIDTH, ITEM_HEIGHT);
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("reveals the current document when mobile navigation opens after Next", async () => {
  render(<DocsShell data={makeDocsData({ config: makeConfig({ "menus-header-html": [] }) })} />);
  fireEvent.click(await screen.findByRole("button", { name: "Next" }));
  await waitFor(() => expect(screen.getByRole("complementary").querySelector('[aria-current="page"]')?.textContent).toBe("Install"));
  fireEvent.click(within(screen.getByRole("banner")).getByRole("button", { name: "Menu" }));
  const drawer = screen.getAllByRole("complementary")[1];
  await waitFor(() => expect(drawer.querySelector('[aria-current="page"]')?.textContent).toBe("Install"));
  const active = drawer.querySelector<HTMLElement>('[aria-current="page"]');
  if (!active) throw new Error("The current document must appear in the menu");
  expect(active.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  expect(active.getBoundingClientRect().bottom).toBeLessThanOrEqual(PANEL_HEIGHT);
});
