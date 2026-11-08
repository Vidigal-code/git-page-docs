// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { IntroductionGuidePage } from "@/page-slices/introduction-guide";
import { SHELL_THEME_CACHE_KEY } from "@/entities/docs";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams("theme=guide-dark"), router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/introduction-guide",
  useRouter: () => navigation.router,
}));

const THEMES = Object.fromEntries(["guide-dark", "guide-light", "remote-theme"].map(id => [id, {
  id, name: id, author: "Tests", version: "1", mode: id.endsWith("light") ? "light" : "dark",
  supportsLightAndDarkModes: false, colors: {}, typography: {}, components: {}, animations: {},
}]));
const LAYOUTS = Object.values(THEMES).map(theme => ({
  id: theme.id, name: theme.name, author: theme.author, mode: theme.mode,
  file: `templates/${theme.id}.json`, preview: "", supportsLightAndDarkModes: false,
}));
const HEADER_CONTROLS = ["Pause guide animations", "Theme selector", "Language selector"];
const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  localStorage.setItem(SHELL_THEME_CACHE_KEY, JSON.stringify({ layoutsConfig: { layouts: LAYOUTS.slice(0, 2) }, themes: THEMES }));
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(),
  }));
  vi.stubGlobal("IntersectionObserver", class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

function expectIconControls(): void {
  for (const name of HEADER_CONTROLS) {
    const control = screen.getByRole("button", { name });
    expect(control.textContent).toBe("");
    expect(control.querySelector("svg")).not.toBeNull();
  }
}

function serveRemoteSite(siteResponse: () => Promise<Response>): void {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("gitpagedocs/config.json")) return siteResponse();
    if (url.includes("layoutsConfig.json")) return Response.json({ layouts: LAYOUTS });
    const theme = Object.values(THEMES).find(candidate => url.includes(`/${candidate.id}.json`));
    if (theme) return Response.json(theme);
    return new Response(null, { status: 404 });
  }));
}

it("shows canonical header icons while the official configuration is still pending", async () => {
  let release: () => void = () => {};
  const pending = new Promise<void>(resolve => { release = resolve; });
  vi.stubGlobal("fetch", vi.fn(async () => { await pending; return new Response(null, { status: 404 }); }));
  render(<IntroductionGuidePage />);
  try {
    expectIconControls();
  } finally {
    await act(async () => { release(); });
  }
});

it("retains canonical icons when the official site configuration fails after the catalogue loads", async () => {
  serveRemoteSite(async () => new Response(null, { status: 503 }));
  render(<IntroductionGuidePage />);
  fireEvent.click(screen.getByRole("button", { name: "Theme selector" }));
  expect(await screen.findByRole("button", { name: "remote-theme" })).not.toBeNull();
  expectIconControls();
});

it("honors explicit remote text controls and the configured brand after loading", async () => {
  serveRemoteSite(async () => Response.json({ site: {
    name: "Configured guide", languages: { en: true },
    IconLanguageSelectorReactIcones: false,
    IconThemeSelectorReactIcones: false,
    IconBackgroundAnimationPauseReactIcones: false,
    IconBackgroundAnimationResumeReactIcones: false,
  } }));
  render(<IntroductionGuidePage />);
  expect(await screen.findByRole("link", { name: "Configured guide" })).not.toBeNull();
  expect(screen.getByRole("button", { name: "Pause guide animations" }).textContent).toBe("Pause guide animations");
  expect(screen.getByRole("button", { name: "Theme selector" }).textContent).toBe("guide-dark");
  expect(screen.getByRole("button", { name: "Language selector" }).textContent).toBe("English");
});
