// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DocsShell } from "@/widgets/docs-shell";
import { INTRO, PAGE_INDEX, makeDocsData } from "../widgets-model/fixtures";

const searchParams = vi.hoisted(() => new URLSearchParams());
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  usePathname: () => "/docs",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/docs");
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it.each(["document", "fullscreen"] as const)("uses the active mode for custom %s title and description colors", async (surface) => {
  const data = makeDocsData();
  data.config.site.HideThemeSelector = true;
  const contentData = surface === "fullscreen" ? data.pages?.[PAGE_INDEX.audio].audio : data.pages?.[PAGE_INDEX.intro].md;
  if (!contentData) throw new Error("The documentation fixture requires the requested content");
  contentData.config = {
    ...contentData.config,
    title: { en: "Mode-specific title" }, titleIsVisible: true,
    description: { en: "Mode-specific description" }, descriptionIsVisible: true,
    titleDarkCss: "color: rgb(210, 20, 40)", titleLightCss: "color: rgb(10, 80, 190)",
    descriptionDarkCss: "color: rgb(20, 120, 50)", descriptionLightCss: "color: rgb(120, 30, 160)",
  };
  if (surface === "fullscreen") window.history.replaceState({}, "", "/docs?audiofull=en&id=40");
  render(<DocsShell data={data} />);
  const content = surface === "fullscreen" ? within(await screen.findByRole("dialog", { name: "Close" })) : screen;
  const title = content.getByRole("heading", { name: "Mode-specific title" });
  const description = content.getByText("Mode-specific description");

  await waitFor(() => expect(getComputedStyle(title).color).toBe("rgb(210, 20, 40)"));
  expect(getComputedStyle(description).color).toBe("rgb(20, 120, 50)");
  fireEvent.click(screen.getByRole("button", { name: "Light mode" }));
  await waitFor(() => expect(getComputedStyle(title).color).toBe("rgb(10, 80, 190)"));
  expect(getComputedStyle(description).color).toBe("rgb(120, 30, 160)");
});

it("uses the active mode for the breadcrumb image", async () => {
  const data = makeDocsData();
  Object.assign(data.config.site, {
    HideThemeSelector: true, IconRouteGuideReactIcones: false,
    IconRouteGuideDarkImg: "https://assets.example.test/guide-dark.svg",
    IconRouteGuideLightImg: "https://assets.example.test/guide-light.svg",
  });
  render(<DocsShell data={data} />);
  const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
  await waitFor(() => expect(breadcrumb.querySelector("img")?.getAttribute("src")).toBe("https://assets.example.test/guide-dark.svg"));
  fireEvent.click(screen.getByRole("button", { name: "Light mode" }));
  await waitFor(() => expect(breadcrumb.querySelector("img")?.getAttribute("src")).toBe("https://assets.example.test/guide-light.svg"));
});

it("uses the active mode for the documentation lock image", async () => {
  const data = makeDocsData();
  const publicKey = "public-test-fingerprint";
  localStorage.setItem("git-page-docs:docs-access:demo-docs", publicKey);
  Object.assign(data.config.site, {
    HideThemeSelector: true, docsAccess: { enabled: true, publicKey },
    IconDocsLockReactIcones: false,
    IconDocsLockDarkImg: "https://assets.example.test/lock-dark.svg",
    IconDocsLockLightImg: "https://assets.example.test/lock-light.svg",
  });
  render(<DocsShell data={data} />);
  const lock = await screen.findByRole("button", { name: "Lock documentation" });
  expect(lock.querySelector("img")?.getAttribute("src")).toBe("https://assets.example.test/lock-dark.svg");
  fireEvent.click(screen.getByRole("button", { name: "Light mode" }));
  await waitFor(() => expect(lock.querySelector("img")?.getAttribute("src")).toBe("https://assets.example.test/lock-light.svg"));
});

it("opens a Markdown fullscreen URL and closes it without reopening the overlay", async () => {
  const data = makeDocsData();
  const markdown = data.pages?.[PAGE_INDEX.intro].md;
  if (!markdown) throw new Error("The documentation fixture requires a Markdown page");
  markdown.markdownByLanguage.en = "<h1>Fullscreen document</h1>";
  window.history.replaceState({}, "", `/docs?mdfull=en&file=${INTRO}`);
  render(<DocsShell data={data} />);
  const dialog = await screen.findByRole("dialog", { name: "Close" });
  expect(within(dialog).getByRole("heading", { name: "Fullscreen document" })).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Close" })).toBeNull());
  expect(new URL(window.location.href).searchParams.has("mdfull")).toBe(false);
});
