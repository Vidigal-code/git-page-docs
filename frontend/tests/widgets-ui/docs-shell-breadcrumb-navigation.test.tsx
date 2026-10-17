// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { DocsShell } from "@/widgets/docs-shell";
import { GUIDE, INTRO, makeConfig, makeDocsData, makeSite } from "../widgets-model/fixtures";

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => "/",
  useRouter: () => navigation.router,
}));
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("follows consecutive breadcrumb parents while keeping the sidebar collapsed", async () => {
  const child = "docs/configuration.md";
  const data = makeDocsData({
    config: makeConfig({
      site: makeSite({ RouteGuide: true, AiChatEnabled: false }),
      "menus-header-html": [],
      "menus-header-md": [{ id: 10, en: { title: "Guides", "path-click": INTRO }, submenus: [
        { id: 11, en: { title: "Configure your site", "path-click": GUIDE }, submenus: [
          { id: 12, en: { title: "Configuration", "path-click": child } },
        ] },
      ] }],
    }),
    pages: [
      { id: 1, md: { routeId: 1, config: { id: 1, path: { en: INTRO } }, markdownByLanguage: { en: "<h1>Guides overview</h1>" } } },
      { id: 2, md: { routeId: 2, config: { id: 2, path: { en: GUIDE } }, markdownByLanguage: { en: "<h1>Site overview</h1>" } } },
      { id: 3, md: { routeId: 3, config: { id: 3, path: { en: child } }, markdownByLanguage: { en: "<h1>Configuration details</h1>" } } },
    ],
    pathToPageMap: {
      [INTRO]: { pageIndex: 0, contentType: "md" },
      [GUIDE]: { pageIndex: 1, contentType: "md" },
      [child]: { pageIndex: 2, contentType: "md" },
    },
  });
  render(<DocsShell data={data} />);
  const sidebar = within(screen.getByRole("complementary"));
  fireEvent.click(sidebar.getByRole("button", { name: "Configuration" }));
  await screen.findByRole("heading", { name: "Configuration details" });
  fireEvent.click(sidebar.getByRole("button", { name: "Close" }));
  const breadcrumb = within(screen.getByRole("main")).getByRole("navigation", { name: "Breadcrumb" });
  expect(screen.getByTestId("sidebar-expand")).toBeTruthy();
  fireEvent.click(within(breadcrumb).getByRole("button", { name: "Configure your site" }));
  await screen.findByRole("heading", { name: "Site overview" });
  expect(screen.queryByTestId("sidebar-expand")).not.toBeNull();
  fireEvent.click(within(breadcrumb).getByRole("button", { name: "Guides" }));
  await waitFor(() => expect(within(breadcrumb).getByText("Guides").getAttribute("aria-current")).toBe("page"));
  expect(screen.queryByTestId("sidebar-expand")).not.toBeNull();
});
