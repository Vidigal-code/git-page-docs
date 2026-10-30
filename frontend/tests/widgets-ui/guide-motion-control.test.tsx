// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { IntroductionGuidePage } from "@/page-slices/introduction-guide/ui/introduction-guide-page";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams("theme=motion-test"), router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/introduction-guide",
  useRouter: () => navigation.router,
}));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); });

it("pauses and resumes all guide effects from one header control without replacing the current content", async () => {
  const theme = {
    id: "motion-test", name: "Test theme", author: "Project", version: "1", mode: "dark",
    supportsLightAndDarkModes: false, colors: {}, typography: {}, components: {}, animations: {},
  };
  const layout = { id: theme.id, name: theme.name, author: theme.author, mode: theme.mode, file: "templates/test.json", preview: "", supportsLightAndDarkModes: false };
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("layoutsConfig.json")) return Response.json({ layouts: [layout] });
    if (url.includes("/templates/")) return Response.json(theme);
    if (url.includes("gitpagedocs/config.json")) return Response.json({ site: { name: "Test docs", languages: { en: true } } });
    return new Response(null, { status: 404 });
  }));
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); });
  render(<IntroductionGuidePage />);
  await screen.findByRole("link", { name: "Test docs" });
  const title = screen.getByRole("heading", { level: 1 });
  const currentChapter = screen.getByTestId("guide-story-counter");
  const chapterLabel = currentChapter.textContent;

  fireEvent.click(screen.getByRole("button", { name: "Pause guide animations" }));
  expect(screen.getByRole("button", { name: "Resume guide animations" }).getAttribute("aria-pressed")).toBe("true");
  expect(document.querySelector('[data-guide-motion="disabled"]')).not.toBeNull();
  const eyebrowRow = title.closest("header")!.querySelector<HTMLElement>('[data-hero-row="eyebrow"]')!;
  expect(getComputedStyle(eyebrowRow).opacity).toBe("1");
  expect(eyebrowRow.style.filter || "none").toBe("none");
  expect(screen.getByRole("heading", { level: 1 })).toBe(title);
  expect(screen.getByTestId("guide-story-counter")).toBe(currentChapter);
  expect(currentChapter.textContent).toBe(chapterLabel);

  fireEvent.click(screen.getByRole("button", { name: "Resume guide animations" }));
  expect(screen.getByRole("button", { name: "Pause guide animations" }).getAttribute("aria-pressed")).toBe("false");
  expect(document.querySelector('[data-guide-motion="enabled"]')).not.toBeNull();
});
