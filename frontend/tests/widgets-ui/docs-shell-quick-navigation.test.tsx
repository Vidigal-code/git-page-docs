// @vitest-environment jsdom
import { useState } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { fireEvent, getByPlaceholderText } from "@testing-library/dom";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { DocsShellQuickNavOverlay } from "@/widgets/docs-shell/ui/docs-shell-quick-nav-overlay";
import type { MenuEntry } from "@/entities/docs";

const ENTRIES: MenuEntry[] = ["Getting Started", "Lesson 3: configuration", "Lesson 4: deployment"].map((title, index) => ({
  key: String(index), id: index, title, searchLabel: title, pathClick: `page:${index + 1}`,
  active: false, level: 0, ancestorKeys: [],
}));
const roots: Root[] = [];
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
const originalScrollTo = HTMLElement.prototype.scrollTo;
let stylesheetSequence = 0;

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.scrollTo = vi.fn();
});
afterEach(() => {
  for (const root of roots.splice(0)) root.unmount();
  document.body.replaceChildren();
  document.querySelectorAll('link[href^="/quick-navigation-test-"]').forEach((link) => link.remove());
});
afterAll(() => {
  HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  HTMLElement.prototype.scrollTo = originalScrollTo;
});

function renderSearchWithPendingStylesheet() {
  const onMenuClick = vi.fn();
  const onClose = vi.fn();
  const stylesheetPath = `/quick-navigation-test-${stylesheetSequence++}.css`;
  function SearchWithStylesheet() {
    const [loadStylesheet, setLoadStylesheet] = useState(false);
    return <div onInputCapture={() => setLoadStylesheet(true)}>
      {loadStylesheet && <link rel="stylesheet" href={stylesheetPath} precedence="quick-navigation-test" />}
      <DocsShellQuickNavOverlay entries={ENTRIES} quickNavPlaceholder="Search docs"
        menuCloseLabel="Close" navigateHintLabel="Navigate" selectHintLabel="Select"
        escHintLabel="Escape" closeHintLabel="Close" noNavigationResults="No results"
        onClose={onClose} onMenuClick={onMenuClick} />
    </div>;
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  flushSync(() => root.render(<SearchWithStylesheet />));
  return { input: getByPlaceholderText(container, "Search docs"), onMenuClick, onClose };
}

it("preserves native typing and Enter selection while a sibling stylesheet delays commit", () => {
  const { input, onMenuClick } = renderSearchWithPendingStylesheet();
  fireEvent.input(input, { target: { value: "Lesson 3: configuration" } });
  expect(input).toHaveProperty("value", "Lesson 3: configuration");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onMenuClick).toHaveBeenCalledWith("page:2", [], { origin: "quick", containerPage: undefined });
});

it("preserves rapid arrow selection before the filtered results can commit", () => {
  const { input, onMenuClick } = renderSearchWithPendingStylesheet();
  fireEvent.input(input, { target: { value: "Lesson" } });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onMenuClick).toHaveBeenCalledWith("page:3", [], { origin: "quick", containerPage: undefined });
});

it("does not select an old result for an unmatched native query and still closes on Escape", () => {
  const { input, onMenuClick, onClose } = renderSearchWithPendingStylesheet();
  fireEvent.input(input, { target: { value: "No matching document" } });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onMenuClick).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(onClose).toHaveBeenCalledOnce();
});

it("resets rapid arrow selection when the native query changes before commit", () => {
  const { input, onMenuClick } = renderSearchWithPendingStylesheet();
  fireEvent.input(input, { target: { value: "Lesson" } });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.input(input, { target: { value: "Lesson 3: configuration" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onMenuClick).toHaveBeenCalledWith("page:2", [], { origin: "quick", containerPage: undefined });
});
