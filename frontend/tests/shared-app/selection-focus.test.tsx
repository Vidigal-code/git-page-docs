// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SelectionDialog } from "@/shared/ui/selection-dialog";

afterEach(cleanup);
it("keeps Tab navigation inside the selection dialog in both directions", () => {
  Element.prototype.scrollIntoView = vi.fn();
  render(<SelectionDialog title="Language" options={[{ id: "en", label: "English" }, { id: "pt", label: "Português" }]} selectedId="pt" onSelect={vi.fn()} onClose={vi.fn()} />);
  const first = screen.getByRole("button", { name: "English" });
  const last = screen.getByRole("button", { name: "Português" });
  last.focus();
  fireEvent.keyDown(last, { key: "Tab" });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(last);
});
