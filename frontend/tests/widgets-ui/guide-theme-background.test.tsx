// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { IntroductionGuidePage } from "@/page-slices/introduction-guide/ui/introduction-guide-page";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams("theme=motion-test"), router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/introduction-guide",
  useRouter: () => navigation.router,
}));

function serveTheme(backgroundEffects?: unknown) {
  const theme = {
    id: "motion-test", name: "Test theme", author: "Project", version: "1", mode: "dark",
    supportsLightAndDarkModes: false, colors: {}, typography: {}, components: {}, animations: {}, backgroundEffects,
  };
  const layout = { id: theme.id, name: theme.name, author: theme.author, mode: theme.mode, file: "templates/test.json", preview: "", supportsLightAndDarkModes: false };
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("layoutsConfig.json")) return Response.json({ layouts: [layout] });
    if (url.includes("/templates/")) return Response.json(theme);
    if (url.includes("gitpagedocs/config.json")) return Response.json({ site: { name: "Test docs", languages: { en: true } } });
    return new Response(null, { status: 404 });
  }));
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); });
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

it("does not leave the guide parallax moving outside an animated theme's pause control", async () => {
  serveTheme({ enabled: true, layers: [{ id: "stars", kind: "stars", count: 1 }] });
  render(<IntroductionGuidePage />);
  await waitFor(() => expect(document.querySelector('[data-background-effects="true"]')).not.toBeNull());
  await waitFor(() => expect(screen.queryByTestId("guide-parallax-backdrop")).toBeNull());
});

it("preserves the original guide backdrop for a legacy theme", async () => {
  serveTheme();
  render(<IntroductionGuidePage />);
  await screen.findByRole("link", { name: "Test docs" });
  expect(screen.getByTestId("guide-parallax-backdrop")).toBeTruthy();
  expect(document.querySelector('[data-background-effects="true"]')).toBeNull();
});

it("explains when the system controls guide animations", async () => {
  serveTheme();
  render(<IntroductionGuidePage />);
  await screen.findByRole("link", { name: "Test docs" });
  const control = screen.getByRole("button", { name: "Animations reduced by your system" });
  expect(control.hasAttribute("disabled")).toBe(true);
  expect(control.getAttribute("aria-pressed")).toBe("true");
});
