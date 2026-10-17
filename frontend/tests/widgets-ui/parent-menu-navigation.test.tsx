// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import type { HeaderMenuItem } from "@/entities/docs";
import { buildHeaderMenuTree, getCurrentPageBreadcrumbTrail } from "@/widgets/docs-shell/model/menu-tree";
import { DocsShellMenuTree } from "@/widgets/docs-shell/ui/docs-shell-menu-tree";
import { useDocsShellLinearNav } from "@/widgets/docs-shell/model/use-docs-shell-linear-nav";
import { useFocusDocuments } from "@/widgets/docs-shell/model/use-focus-documents";
import { RouteGuideBreadcrumb } from "@/features/route-guide";
import { resolveRouteGuideIconConfig } from "@/shared/lib/resolve-site-assets";
import { GUIDE, INTRO, makeDocsData } from "../widgets-model/fixtures";

const FOCUS = "docs/focus.md";
const menus: HeaderMenuItem[] = [{
  id: 1000,
  en: { title: "Guides", "path-click": INTRO },
  submenus: [{
    id: 1001,
    en: { title: "Read and explore", "path-click": GUIDE },
    submenus: [{ id: 1002, en: { title: "Focus mode", "path-click": FOCUS } }],
  }],
}];

function NavigableMenu({ menuItems = menus }: { menuItems?: HeaderMenuItem[] }): ReactElement {
  const [path, setPath] = useState(FOCUS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const tree = buildHeaderMenuTree(menuItems, { data: makeDocsData(), language: "en", pageIndex: -1 });
  return <>
    <DocsShellMenuTree nodes={tree} keyPrefix="menu" onMenuClick={setPath}
      onToggleNode={(key) => setExpanded((previous) => ({ ...previous, [key]: !previous[key] }))}
      isNodeExpanded={(key) => expanded[key] ?? false} />
    <output>{path}</output>
  </>;
}

afterEach(cleanup);

it("opens parent documents independently from expanding each recursive submenu", () => {
  render(<NavigableMenu />);
  fireEvent.click(screen.getByRole("button", { name: "Guides" }));
  expect(screen.getByRole("status").textContent).toBe(INTRO);
  expect(screen.queryByRole("button", { name: "Read and explore" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Expand submenu: Guides" }));
  expect(screen.getByRole("button", { name: "Collapse submenu: Guides" }).getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Read and explore" }));
  expect(screen.getByRole("status").textContent).toBe(GUIDE);
  expect(screen.queryByRole("button", { name: "Focus mode" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Expand submenu: Read and explore" }));
  fireEvent.click(screen.getByRole("button", { name: "Focus mode" }));
  expect(screen.getByRole("status").textContent).toBe(FOCUS);
  fireEvent.click(screen.getByRole("button", { name: "Collapse submenu: Read and explore" }));
  expect(screen.queryByRole("button", { name: "Focus mode" })).toBeNull();
  expect(screen.getByRole("status").textContent).toBe(FOCUS);
});

function NavigableBreadcrumb(): ReactElement {
  const [path, setPath] = useState(FOCUS);
  const tree = buildHeaderMenuTree(menus, { data: makeDocsData(), language: "en", pageIndex: -1 });
  return <>
    <RouteGuideBreadcrumb trail={getCurrentPageBreadcrumbTrail(tree, path)} onNavigate={setPath}
      iconConfig={resolveRouteGuideIconConfig({}, false, "")} />
    <output>{path}</output>
  </>;
}

it("opens each Markdown ancestor from the breadcrumb and updates the current trail", () => {
  render(<NavigableBreadcrumb />);
  const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(within(breadcrumb).getByText("Focus mode").getAttribute("aria-current")).toBe("page");
  fireEvent.click(within(breadcrumb).getByRole("button", { name: "Read and explore" }));
  expect(screen.getByRole("status").textContent).toBe(GUIDE);
  expect(within(breadcrumb).queryByText("Focus mode")).toBeNull();
  expect(within(breadcrumb).getByText("Read and explore").getAttribute("aria-current")).toBe("page");
  fireEvent.click(within(breadcrumb).getByRole("button", { name: "Guides" }));
  expect(screen.getByRole("status").textContent).toBe(INTRO);
  expect(within(breadcrumb).queryByText("Read and explore")).toBeNull();
  expect(within(breadcrumb).getByText("Guides").getAttribute("aria-current")).toBe("page");
});

it("includes readable parent Markdown in focus and footer order while respecting authorization", () => {
  const data = makeDocsData();
  data.config["menus-header-md"] = menus;
  data.config["menus-header-html"] = [];
  data.pages = [...(data.pages ?? []), {
    id: 3,
    md: { routeId: 3, config: { id: 3, path: { en: FOCUS } }, markdownByLanguage: { en: "<h1>Focus mode</h1>" } },
  }];
  const { result, rerender } = renderHook(({ deniedPath }) => {
    const isPathAllowed = (path: string) => path !== deniedPath;
    const navigation = useDocsShellLinearNav(data, "en", { pageIndex: 0, isPathAllowed });
    const focus = useFocusDocuments({ data, entries: navigation.headerMenuEntries, language: "en", currentPageIndex: 0, isPathAllowed });
    return { navigation, focus };
  }, { initialProps: { deniedPath: "" } });
  expect(result.current.navigation.linearNavigationEntries.map((entry) => entry.pathClick)).toEqual([INTRO, GUIDE, FOCUS]);
  expect(result.current.focus.documents.map((entry) => entry.pathClick)).toEqual([INTRO, GUIDE, FOCUS]);
  expect(result.current.focus.nextDocument?.pathClick).toBe(GUIDE);
  rerender({ deniedPath: GUIDE });
  expect(result.current.focus.documents.map((entry) => entry.pathClick)).toEqual([INTRO, FOCUS]);
  expect(result.current.navigation.linearNavigationEntries.map((entry) => entry.pathClick)).toEqual([INTRO, FOCUS]);
});

it("keeps pathless groups expandable without navigating away from the current document", () => {
  const groups: HeaderMenuItem[] = [{ id: 1, en: { title: "Guides", "path-click": "" }, submenus: menus }];
  render(<NavigableMenu menuItems={groups} />);
  const group = screen.getByRole("button", { name: "Guides" });
  expect(group.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(group);
  expect(group.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("button", { name: "Expand submenu: Guides" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe(FOCUS);
  fireEvent.click(group);
  expect(screen.queryByRole("button", { name: "Expand submenu: Guides" })).toBeNull();
  expect(screen.getByRole("status").textContent).toBe(FOCUS);
});
