// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { DocsShellSidebar } from "@/widgets/docs-shell/ui/docs-shell-sidebar";
import { useBuildNavMenuConfig } from "@/widgets/docs-shell/model/use-build-nav-menu-config";
import type { MenuNode } from "@/widgets/docs-shell/model/menu-tree";
import { makeConfig } from "../widgets-model/fixtures";

const SIDEBAR_HEIGHT = 300;
const SIDEBAR_WIDTH = 280;
const MENU_ITEM_HEIGHT = 44;
const ITEM_TOP = { Introduction: 40, Reference: 600 };
const noAction = () => undefined;
let sidebarHeight = SIDEBAR_HEIGHT;
const resizeCallbacks = new Set<() => void>();

function menuNodes(activeTitle: string): MenuNode[] {
  return Object.keys(ITEM_TOP).map((title, id) => ({
    key: title, id, title, pathClick: `docs/${title}.md`, active: title === activeTitle,
    level: 0, searchLabel: title, ancestorKeys: [], children: [],
  }));
}

interface SidebarProps { activeTitle: string; blockMenuOnNav?: boolean; sidebarOpen?: boolean }
function Sidebar({ activeTitle, blockMenuOnNav = false, sidebarOpen = true }: Readonly<SidebarProps>): React.JSX.Element {
  const navMenuConfig = useBuildNavMenuConfig(makeConfig(), "dark", "en");
  return <DocsShellSidebar
    sidebarOpen={sidebarOpen}
    siteName="Documentation"
    useReactHeaderIcon={false}
    reactHeaderIconTag={undefined}
    headerReactIconStyle={{}}
    activeLayoutMode="dark"
    iconImage={undefined}
    iconImgWidth={24}
    iconImgHeight={24}
    menuNodes={menuNodes(activeTitle)}
    menuCloseLabel="Close navigation"
    onMenuClick={noAction}
    onToggleNode={noAction}
    isNodeExpanded={() => false}
    onCollapseSidebar={noAction}
    blockMenuOnNav={blockMenuOnNav}
    setBlockMenuOnNav={noAction}
    navMenuConfig={navMenuConfig}
    onOpenAiChat={noAction}
  />;
}

beforeEach(() => {
  sidebarHeight = SIDEBAR_HEIGHT;
  resizeCallbacks.clear();
  vi.stubGlobal("ResizeObserver", class {
    constructor(private readonly callback: () => void) { resizeCallbacks.add(callback); }
    observe(): void {}
    disconnect(): void { resizeCallbacks.delete(this.callback); }
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.tagName === "ASIDE" ? sidebarHeight : 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.tagName === "ASIDE") return new DOMRect(0, 0, SIDEBAR_WIDTH, SIDEBAR_HEIGHT);
    const top = ITEM_TOP[this.textContent as keyof typeof ITEM_TOP] ?? 0;
    return new DOMRect(0, top - (this.closest("aside")?.scrollTop ?? 0), SIDEBAR_WIDTH, MENU_ITEM_HEIGHT);
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("centers the current menu item down and up when navigation is unlocked", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" />);
  const sidebar = screen.getByRole("complementary");
  expect(sidebar.scrollTop).toBe(0);
  rerender(<Sidebar activeTitle="Reference" />);
  expect(sidebar.scrollTop).toBe(472);
  rerender(<Sidebar activeTitle="Introduction" />);
  expect(sidebar.scrollTop).toBe(0);
});

it("preserves the menu position while locked and reveals the current item after unlocking", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" blockMenuOnNav />);
  const sidebar = screen.getByRole("complementary");
  rerender(<Sidebar activeTitle="Reference" blockMenuOnNav />);
  expect(sidebar.scrollTop).toBe(0);
  rerender(<Sidebar activeTitle="Reference" />);
  expect(sidebar.scrollTop).toBe(472);
});

it("keeps a visible current item in place", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" />);
  const sidebar = screen.getByRole("complementary");
  sidebar.scrollTop = 20;
  rerender(<Sidebar activeTitle="Introduction" />);
  expect(sidebar.scrollTop).toBe(20);
});

it("preserves manual scrolling on unrelated renders until the document changes", () => {
  const { rerender } = render(<Sidebar activeTitle="Reference" />);
  const sidebar = screen.getByRole("complementary");
  sidebar.scrollTop = 20;
  rerender(<Sidebar activeTitle="Reference" />);
  expect(sidebar.scrollTop).toBe(20);
  rerender(<Sidebar activeTitle="Introduction" />);
  expect(sidebar.scrollTop).toBe(0);
});

it("recenters the current item after the navigation viewport shrinks", () => {
  render(<Sidebar activeTitle="Reference" />);
  const sidebar = screen.getByRole("complementary");
  sidebarHeight = 180;
  act(() => { resizeCallbacks.forEach((callback) => callback()); });
  expect(sidebar.scrollTop).toBe(532);
});

it("keeps manual position across resize while locked", () => {
  const { rerender } = render(<Sidebar activeTitle="Reference" />);
  const sidebar = screen.getByRole("complementary");
  rerender(<Sidebar activeTitle="Reference" blockMenuOnNav />);
  sidebar.scrollTop = 80;
  sidebarHeight = 180;
  act(() => { resizeCallbacks.forEach((callback) => callback()); });
  expect(sidebar.scrollTop).toBe(80);
});

it("does not scroll a hidden desktop sidebar", () => {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(0);
  render(<Sidebar activeTitle="Reference" />);
  expect(screen.getByRole("complementary").scrollTop).toBe(0);
});

it("reveals the current item when the sidebar opens", () => {
  const { rerender } = render(<Sidebar activeTitle="Reference" sidebarOpen={false} />);
  const sidebar = screen.getByRole("complementary");
  expect(sidebar.scrollTop).toBe(0);
  rerender(<Sidebar activeTitle="Reference" />);
  expect(sidebar.scrollTop).toBe(472);
});

it("leaves the menu position unchanged when no current item exists", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" />);
  const sidebar = screen.getByRole("complementary");
  sidebar.scrollTop = 20;
  rerender(<Sidebar activeTitle="Unlisted document" />);
  expect(sidebar.scrollTop).toBe(20);
});
