// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MdContainer } from "@/widgets/docs-shell/ui/content-type-containers/md-container";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import type { ComponentProps } from "react";
import type { ContentTypeRouteConfig } from "@/entities/docs";
import { expandVersionConfig } from "@/entities/docs/lib/expand-version-config";

afterEach(cleanup);
const breadcrumbProps: ComponentProps<typeof MdContainer> = {
  html: "<h1>Install</h1>",
  language: "en",
  breadcrumbTrail: [{ title: "Install", pathClick: "install.md", ancestorKeys: [] }],
  onBreadcrumbClick: () => undefined,
  routeGuideIconConfig: resolveRouteGuideIconConfig({}, false, ""),
  fullscreenCloseLabel: "Close",
  fullscreenExpandLabel: "Expand",
};

it("lets an individual document hide the breadcrumb when it is enabled for the site", () => {
  render(<MdContainer {...breadcrumbProps} config={{ id: 1, RouteGuide: false }} routeGuideEnabled />);
  expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Install" })).not.toBeNull();
});

it.each([
  { site: false, route: true, visible: true },
  { site: false, route: undefined, visible: false },
  { site: true, route: undefined, visible: true },
  { site: undefined, route: undefined, visible: true },
])("resolves document $route and site $site to breadcrumb visibility $visible", ({ site, route, visible }) => {
  render(<MdContainer {...breadcrumbProps} config={{ id: 1, RouteGuide: route }} routeGuideEnabled={site} />);
  expect(Boolean(screen.queryByRole("navigation", { name: "Breadcrumb" }))).toBe(visible);
});

it("applies version route defaults while preserving an individual document override", () => {
  const version = expandVersionConfig<{ routeDefaults: { RouteGuide: boolean }; "routes-md": ContentTypeRouteConfig[] }>({
    routeDefaults: { RouteGuide: false },
    "routes-md": [{ id: 1 }, { id: 2, RouteGuide: true }],
  });
  const { rerender } = render(<MdContainer {...breadcrumbProps} config={version["routes-md"][0]} routeGuideEnabled />);
  expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
  rerender(<MdContainer {...breadcrumbProps} config={version["routes-md"][1]} routeGuideEnabled={false} />);
  expect(screen.getByRole("navigation", { name: "Breadcrumb" })).not.toBeNull();
});
