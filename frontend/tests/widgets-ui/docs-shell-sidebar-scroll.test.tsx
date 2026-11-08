// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DocsShellSidebar } from "@/widgets/docs-shell/ui/docs-shell-sidebar";
import { useBuildNavMenuConfig } from "@/widgets/docs-shell/model/use-build-nav-menu-config";
import type { MenuNode } from "@/widgets/docs-shell/model/menu-tree";
import { makeConfig } from "../widgets-model/fixtures";

const SIDEBAR_HEIGHT = 300;
const SIDEBAR_WIDTH = 280;
const MENU_ITEM_HEIGHT = 44;
const ITEM_TOP = { Introduction: 40, Reference: 600 };
const noAction = () => undefined;

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
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.tagName === "ASIDE" ? SIDEBAR_HEIGHT : 0;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.tagName === "ASIDE") return new DOMRect(0, 0, SIDEBAR_WIDTH, SIDEBAR_HEIGHT);
    const top = ITEM_TOP[this.textContent as keyof typeof ITEM_TOP] ?? 0;
    return new DOMRect(0, top - (this.closest("aside")?.scrollTop ?? 0), SIDEBAR_WIDTH, MENU_ITEM_HEIGHT);
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("follows the current menu item down and up when navigation is unlocked", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" />);
  const sidebar = screen.getByRole("complementary");
  expect(sidebar.scrollTop).toBe(0);
  rerender(<Sidebar activeTitle="Reference" />);
  expect(sidebar.scrollTop).toBe(344);
  rerender(<Sidebar activeTitle="Introduction" />);
  expect(sidebar.scrollTop).toBe(40);
});

it("preserves the menu position while locked and reveals the current item after unlocking", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" blockMenuOnNav />);
  const sidebar = screen.getByRole("complementary");
  rerender(<Sidebar activeTitle="Reference" blockMenuOnNav />);
  expect(sidebar.scrollTop).toBe(0);
  rerender(<Sidebar activeTitle="Reference" />);
  expect(sidebar.scrollTop).toBe(344);
});

it("keeps a visible current item in place", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" />);
  const sidebar = screen.getByRole("complementary");
  sidebar.scrollTop = 20;
  rerender(<Sidebar activeTitle="Introduction" />);
  expect(sidebar.scrollTop).toBe(20);
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
  expect(sidebar.scrollTop).toBe(344);
});

it("leaves the menu position unchanged when no current item exists", () => {
  const { rerender } = render(<Sidebar activeTitle="Introduction" />);
  const sidebar = screen.getByRole("complementary");
  sidebar.scrollTop = 20;
  rerender(<Sidebar activeTitle="Unlisted document" />);
  expect(sidebar.scrollTop).toBe(20);
});
