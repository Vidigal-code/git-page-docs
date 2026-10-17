// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { buildHeaderMenuTree, getMenuDisplayNodes, type MenuNode } from "@/widgets/docs-shell/model/menu-tree";
import { makeDocsData, GUIDE, INTRO } from "../widgets-model/fixtures";

function menuNode(title: string, overrides: Partial<MenuNode> = {}): MenuNode {
  return { key: title, id: 1, title, pathClick: "", active: false, level: 0, searchLabel: title, ancestorKeys: [], children: [], ...overrides };
}

afterEach(cleanup);

describe("menu presentation", () => {
  it("retains nesting by default and handles an empty menu", () => {
    const tree = [menuNode("Guide", { children: [menuNode("Install", { pathClick: INTRO })] })];
    expect(getMenuDisplayNodes(tree, {})).toBe(tree);
    expect(getMenuDisplayNodes(tree, { nestedMenusEnabled: true })).toBe(tree);
    expect(getMenuDisplayNodes([], { nestedMenusEnabled: false })).toEqual([]);
  });

  it("keeps section headings and drops empty categories in flat mode", () => {
    const section = menuNode("Docs", { isSectionHeader: true });
    const tree = [section, menuNode("Empty"), menuNode("Intro", { pathClick: INTRO })];
    expect(getMenuDisplayNodes(tree, { nestedMenusEnabled: false }).map((node) => node.title)).toEqual(["Docs", "Intro"]);
  });

  it("keeps authorized children accessible without making a denied parent a flat destination", () => {
    const menus = [{ id: 1, en: { title: "Restricted", "path-click": GUIDE }, submenus: [{ id: 2, en: { title: "Allowed", "path-click": INTRO } }] }];
    const tree = buildHeaderMenuTree(menus, { data: makeDocsData(), language: "en", pageIndex: 1, isPathAllowed: (path) => path !== GUIDE });
    expect(getMenuDisplayNodes(tree, { nestedMenusEnabled: false }).map((node) => node.pathClick)).toEqual([INTRO]);
    expect(tree[0]).toMatchObject({ pathClick: "", active: false });
  });
  it("shows every nested destination in order when nesting is disabled without changing the source tree", () => {
    const install = menuNode("Install", { pathClick: "docs/install.md", level: 1, ancestorKeys: ["Guide"], searchLabel: "Guide / Install" });
    const tree = [menuNode("Guide", { children: [install] }), menuNode("Reference", { pathClick: "docs/reference.md" })];
    const displayed = getMenuDisplayNodes(tree, { nestedMenusEnabled: false });
    expect(displayed.map(({ title, pathClick, level, children }) => ({ title, pathClick, level, children }))).toEqual([
      { title: "Install", pathClick: "docs/install.md", level: 0, children: [] },
      { title: "Reference", pathClick: "docs/reference.md", level: 0, children: [] },
    ]);
    expect(displayed[0]).toMatchObject({ ancestorKeys: ["Guide"], searchLabel: "Guide / Install" });
    expect(tree[0].children).toEqual([install]);
  });
});
