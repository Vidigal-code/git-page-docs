// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DocsShellMenuTree } from "@/widgets/docs-shell/ui/docs-shell-menu-tree";
import type { MenuNode } from "@/widgets/docs-shell/model/menu-tree";

afterEach(cleanup);
const nodes: MenuNode[] = [{ key: "guide", id: 1, title: "Guide", pathClick: "", active: false, level: 0, searchLabel: "Guide", ancestorKeys: [], children: [{ key: "install", id: 2, title: "Install", pathClick: "docs/install.md", active: true, level: 1, searchLabel: "Guide / Install", ancestorKeys: ["guide"], children: [] }] }];
function MenuExample({ menuNodes = nodes }: Readonly<{ menuNodes?: MenuNode[] }>): React.JSX.Element {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState("None");
  return <><DocsShellMenuTree nodes={menuNodes} keyPrefix="test" isNodeExpanded={(key) => expanded[key] ?? false} onToggleNode={(key) => setExpanded((state) => ({ ...state, [key]: !state[key] }))} onMenuClick={setCurrent} /><output>{current}</output></>;
}
it("expands a category without navigating and exposes the active leaf without text chevrons", () => {
  render(<MenuExample />);
  const category = screen.getByRole("button", { name: "Guide" });
  expect(category.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(category);
  expect(category.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("status").textContent).toBe("None");
  const leaf = screen.getByRole("button", { name: "Install" });
  expect(leaf.getAttribute("aria-current")).toBe("page");
  fireEvent.click(leaf);
  expect(screen.getByRole("status").textContent).toBe("docs/install.md");
  fireEvent.click(category);
  expect(screen.queryByRole("button", { name: "Install" })).toBeNull();
});

it("toggles a parent with a destination separately from navigating to that destination", () => {
  render(<MenuExample menuNodes={[{ ...nodes[0], pathClick: "docs/guide.md" }]} />);
  fireEvent.click(screen.getByRole("button", { name: "Expand submenu: Guide" }));
  expect(screen.getByRole("button", { name: "Collapse submenu: Guide" }).getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("status").textContent).toBe("None");
  fireEvent.click(screen.getByRole("button", { name: "Guide" }));
  expect(screen.getByRole("status").textContent).toBe("docs/guide.md");
  fireEvent.click(screen.getByRole("button", { name: "Collapse submenu: Guide" }));
  expect(screen.queryByRole("button", { name: "Install" })).toBeNull();
});

it("opens five levels and navigates to the deepest destination", () => {
  const deepNodes = ["One", "Two", "Three", "Four"].reduceRight<MenuNode[]>(
    (children, title) => [{ ...nodes[0], key: title, title, children }],
    [nodes[0].children[0]],
  );
  render(<MenuExample menuNodes={deepNodes} />);
  for (const title of ["One", "Two", "Three", "Four"]) fireEvent.click(screen.getByRole("button", { name: title }));
  fireEvent.click(screen.getByRole("button", { name: "Install" }));
  expect(screen.getByRole("status").textContent).toBe("docs/install.md");
});

it("renders empty categories as text without a broken navigation action", () => {
  render(<MenuExample menuNodes={[{ ...nodes[0], children: [] }]} />);
  expect(screen.getByText("Guide")).not.toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
});
