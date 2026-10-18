// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { DocsShell } from "@/widgets/docs-shell";
import { withConfigDefaults } from "@/entities/docs/lib/with-config-defaults";
import { makeConfig, makeDocsData, makeSite } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params, usePathname: () => "/", useRouter: () => navigation.router,
}));
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  navigation.params = new URLSearchParams();
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function animatedData() {
  return makeDocsData({
    config: makeConfig({ site: makeSite({ AiChatEnabled: false, audioPlayerEnabled: false }) }),
    themes: { "aurora-dark": {
      id: "aurora-dark", name: "Aurora", author: "Project", version: "1", mode: "dark",
      supportsLightAndDarkModes: true, colors: {}, typography: { fontFamily: "sans-serif", fontSize: {} },
      components: {}, animations: {}, backgroundEffects: {
      enabled: true, layers: [{ id: "stars", kind: "stars", count: 1 }],
    } } },
  });
}

it("pauses background movement beside the menu lock and preserves it when the menu collapses", async () => {
  render(<DocsShell data={animatedData()} />);
  const sidebar = within(screen.getByRole("complementary"));
  const pause = await sidebar.findByRole("button", { name: "Pause background animation" });
  const lock = sidebar.getByRole("button", { name: "Allow menu on navigation" });
  expect(pause.previousElementSibling).toBe(lock);
  fireEvent.click(pause);
  expect(sidebar.getByRole("button", { name: "Resume background animation" }).getAttribute("aria-pressed")).toBe("true");
  expect(sidebar.getByRole("button", { name: "Allow menu on navigation" })).toBe(lock);
  fireEvent.click(sidebar.getByRole("button", { name: "Close" }));
  const rail = within(screen.getByTestId("sidebar-expand").parentElement!);
  const resume = rail.getByRole("button", { name: "Resume background animation" });
  expect(resume.previousElementSibling).toBe(rail.getByRole("button", { name: "Allow menu on navigation" }));
  fireEvent.click(resume);
  expect(sidebar.getByRole("button", { name: "Pause background animation" }).getAttribute("aria-pressed")).toBe("false");
});

it("shares the pause and menu-lock controls with the mobile drawer without closing it", async () => {
  render(<DocsShell data={animatedData()} />);
  const sidebarElement = screen.getByRole("complementary");
  fireEvent.click(await within(sidebarElement).findByRole("button", { name: "Pause background animation" }));
  fireEvent.click(within(screen.getByRole("banner")).getByRole("button", { name: "Menu" }));
  const drawerElement = screen.getAllByRole("complementary").find((element) => element !== sidebarElement)!;
  const drawer = within(drawerElement);
  const resume = drawer.getByRole("button", { name: "Resume background animation" });
  const lock = drawer.getByRole("button", { name: "Allow menu on navigation" });
  expect(resume.previousElementSibling).toBe(lock);
  fireEvent.click(resume);
  expect(drawer.getByRole("button", { name: "Pause background animation" }).getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(lock);
  expect(drawer.getByRole("button", { name: "Block menu on navigation" })).toBeTruthy();
  fireEvent.click(drawer.getByRole("button", { name: "Close" }));
  expect(screen.getAllByRole("complementary")).toHaveLength(1);
  fireEvent.click(within(screen.getByRole("banner")).getByRole("button", { name: "Menu" }));
  const reopenedDrawer = screen.getAllByRole("complementary").find((element) => element !== sidebarElement)!;
  expect(within(reopenedDrawer).getByRole("button", { name: "Pause background animation" }).getAttribute("aria-pressed")).toBe("false");
});

it("uses localized icon configuration and keeps pause across a theme change", async () => {
  const data = animatedData();
  data.themes["aurora-light"] = { ...data.themes["aurora-dark"], id: "aurora-light", mode: "light" };
  const site = { ...data.config.site, icons: {
    BackgroundAnimationPause: { reactIcon: true, tag: "FiPause", colorDark: "red", colorLight: "blue", size: "26px" },
    BackgroundAnimationResume: { reactIcon: false },
  } };
  data.config = withConfigDefaults({ ...data.config, site });
  data.config.site.langmenu.en.backgroundAnimationPause = "Freeze landscape";
  data.config.site.langmenu.en.backgroundAnimationResume = "Continue landscape";
  render(<DocsShell data={data} />);
  const sidebar = within(screen.getByRole("complementary"));
  const pause = await sidebar.findByRole("button", { name: "Freeze landscape" });
  expect(pause.textContent).toBe("");
  expect(pause.querySelector<HTMLElement>("span")?.style.color).toBe("red");
  expect(pause.querySelector<HTMLElement>("span")?.style.fontSize).toBe("26px");
  fireEvent.click(pause);
  expect(sidebar.getByRole("button", { name: "Continue landscape" }).textContent).toBe("Continue landscape");
  fireEvent.click(within(screen.getByRole("banner")).getByRole("button", { name: "Theme selector" }));
  fireEvent.click(screen.getByRole("button", { name: "aurora-light" }));
  const resume = sidebar.getByRole("button", { name: "Continue landscape" });
  expect(resume.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(resume);
  expect(sidebar.getByRole("button", { name: "Freeze landscape" }).querySelector<HTMLElement>("span")?.style.color).toBe("blue");
});

it("hides the configured control while preserving the enabled background", () => {
  const data = animatedData();
  data.config.site.backgroundEffects = { overrides: { accessibility: { showPauseButton: false } } };
  const { container } = render(<DocsShell data={data} />);
  expect(screen.queryByRole("button", { name: /background animation/ })).toBeNull();
  expect(container.querySelector('[data-background-effects="true"]')).not.toBeNull();
  expect(within(screen.getByRole("complementary")).getByRole("button", { name: "Allow menu on navigation" })).toBeTruthy();
});
