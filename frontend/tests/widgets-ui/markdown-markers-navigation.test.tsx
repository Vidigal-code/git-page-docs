// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MdContainer } from "@/widgets/docs-shell/ui/content-type-containers/md-container";

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe(): void { /* Browser observer is unavailable in jsdom. */ }
    disconnect(): void { /* No browser observer to disconnect. */ }
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("shows a marker-only index and scrolls to the highlighted text when its link is clicked", () => {
  const scroll = vi.fn<(this: HTMLElement) => void>();
  HTMLElement.prototype.scrollIntoView = scroll;
  render(<MdContainer language="en" html="<p>Read this important detail.</p>"
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: false, markdownMarkers: { items: [
      { id: "detail", text: "important detail", label: "Read the detail" },
    ] } }} />);
  const link = screen.getByRole("link", { name: "Read the detail" });
  fireEvent.click(link);
  expect(scroll.mock.contexts[0]).toBe(document.getElementById("markdown-marker-detail"));
  expect(scroll.mock.contexts[0]?.textContent).toBe("important detail");
  expect(window.location.hash).toBe("#markdown-marker-detail");
});
