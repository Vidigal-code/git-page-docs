// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SelectionDialog } from "@/shared/ui/selection-dialog";
import { ConfirmPopup } from "@/shared/ui/confirm-popup/confirm-popup";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => cleanup());

const OPTIONS = [
  { id: "en", label: "English" },
  { id: "pt", label: "Português" },
];

describe("SelectionDialog", () => {
  it("renders a native, open dialog named by its title and focuses the current choice", () => {
    render(
      <SelectionDialog
        title="Language"
        options={OPTIONS}
        selectedId="pt"
        onSelect={vi.fn()}
        onClose={vi.fn()}
        themeVarsStyle={{ "--primary": "#123456" } as React.CSSProperties}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Language" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement?.textContent).toContain("Português");
    expect(dialog.parentElement?.parentElement?.style.getPropertyValue("--primary")).toBe("#123456");
  });

  it("selects an option, closes on Escape and on the backdrop", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { unmount } = render(
      <SelectionDialog title="Language" options={OPTIONS} selectedId="en" onSelect={onSelect} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Português" }));
    expect(onSelect).toHaveBeenCalledWith("pt");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    const dialog = screen.getByRole("dialog", { name: "Language" });
    const backdrop = dialog.previousElementSibling as HTMLButtonElement;
    expect(backdrop.tagName).toBe("BUTTON");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);

    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("ConfirmPopup", () => {
  const baseProps = {
    title: "Delete everything?",
    description: "This cannot be undone.",
    confirmText: "Delete",
    cancelText: "Keep",
  };

  it("renders nothing while closed", () => {
    render(<ConfirmPopup {...baseProps} isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a native dialog labelled by its title", () => {
    render(<ConfirmPopup {...baseProps} isOpen onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: "Delete everything?" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(screen.getByText("This cannot be undone.")).toBeTruthy();
  });

  it("confirms then closes, cancels, and closes on Escape or the backdrop", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmPopup {...baseProps} isOpen onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.invocationCallOrder[0]).toBeLessThan(onCancel.mock.invocationCallOrder[0]);

    fireEvent.click(screen.getByText("Keep"));
    expect(onCancel).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(3);

    const backdrop = screen.getAllByRole("button", { name: "Keep" }).find((button) => button.tabIndex === -1);
    expect(backdrop).toBeDefined();
    fireEvent.click(backdrop as HTMLButtonElement);
    expect(onCancel).toHaveBeenCalledTimes(4);
  });
});
