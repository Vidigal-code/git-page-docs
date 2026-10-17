// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import { DocsShellFocusOverlay } from "@/widgets/docs-shell/ui/docs-shell-focus-overlay";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function overlayProps(): ComponentProps<typeof DocsShellFocusOverlay> {
  return {
    isOpen: true, focusModeLabel: "Focus mode", menuCloseLabel: "Close", previousLabel: "Previous section", nextLabel: "Next section", firstLabel: "First section", lastLabel: "Last section",
    focusModeCurrentHtml: "<h2>Introduction</h2><p>First section.</p>",
    onClose: vi.fn(), onNavigate: vi.fn(), sectionIndex: 0, sectionCount: 2, sectionsLabel: "Sections", documentsLabel: "Documents",
    document: { id: "intro", title: "Introduction", source: "# Introduction", fileName: "intro.md", index: 0, count: 2 },
    documentNavigation: { firstLabel: "First document", lastLabel: "Last document", previousLabel: "Previous document", nextLabel: "Next document", nextTitle: "Installation", onNavigate: vi.fn() },
    sourceActionLabels: { copy: "Copy Markdown", copied: "Copied", copyError: "Copy failed", download: "Download Markdown" },
  };
}

it("offers separate section and document navigation while keeping focus open", () => {
  const props = overlayProps();
  render(<DocsShellFocusOverlay {...props} />);

  expect(screen.getByRole("dialog", { name: "Focus mode" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Previous document" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Next section" }));
  expect(props.onNavigate).toHaveBeenCalledWith("next");
  fireEvent.click(screen.getByRole("button", { name: "Next document" }));
  expect(props.documentNavigation.onNavigate).toHaveBeenCalledWith("next");
  expect(props.onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog", { name: "Focus mode" })).toBeTruthy();
});

it("copies the complete source of the document currently shown in focus", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  const props = overlayProps();
  const { rerender } = render(<DocsShellFocusOverlay {...props} />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy Markdown" })));
  expect(writeText).toHaveBeenLastCalledWith("# Introduction");

  rerender(<DocsShellFocusOverlay {...props} document={{ ...props.document, id: "install", source: "# Installation\n\n## Configure", fileName: "install.md" }} />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy Markdown" })));
  expect(writeText).toHaveBeenLastCalledWith("# Installation\n\n## Configure");
});

it("lets each focus toolbar feature be disabled without hiding the reading surface", () => {
  render(<DocsShellFocusOverlay {...overlayProps()} options={{ copyEnabled: false, downloadEnabled: false, sectionNavigationEnabled: false, documentNavigationEnabled: false }} />);
  expect(screen.queryByRole("button", { name: "Copy Markdown" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Download Markdown" })).toBeNull();
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(screen.getByText("First section.")).toBeTruthy();
});
