// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// jsdom parses its default stylesheet on the first getComputedStyle / role query,
// which takes seconds when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 });
import { DocsAccessGate } from "@/features/docs-access/ui/docs-access-gate";

const TEXTS = {
  title: "Private docs",
  description: "Enter the password to continue",
  placeholder: "Password",
  unlockBtn: "Unlock",
  wrongCredential: "Wrong password",
};

afterEach(() => {
  cleanup();
});

function form(): HTMLFormElement {
  const element = screen.getByRole("dialog").querySelector("form");
  if (!element) throw new Error("form not rendered");
  return element;
}

describe("DocsAccessGate", () => {
  it("renders as an open native dialog labelled by the title", () => {
    render(<DocsAccessGate texts={TEXTS} onUnlock={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: "Private docs" });
    expect(dialog.tagName).toBe("DIALOG");
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Private docs");
    expect(screen.getByText("Enter the password to continue")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("does not submit while the input is empty", () => {
    const onUnlock = vi.fn();
    render(<DocsAccessGate texts={TEXTS} onUnlock={onUnlock} />);
    fireEvent.submit(form());
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("shows the error after a rejected credential and clears it on the next keystroke", async () => {
    const onUnlock = vi.fn(async () => false);
    render(<DocsAccessGate texts={TEXTS} onUnlock={onUnlock} />);
    const input = screen.getByPlaceholderText("Password");

    fireEvent.change(input, { target: { value: "nope" } });
    expect((screen.getByRole("button", { name: "Unlock" }) as HTMLButtonElement).disabled).toBe(false);
    await act(async () => {
      fireEvent.submit(form());
    });

    expect(onUnlock).toHaveBeenCalledWith("nope");
    await waitFor(() => expect(screen.getByText("Wrong password")).toBeTruthy());

    fireEvent.change(input, { target: { value: "nope2" } });
    expect(screen.queryByText("Wrong password")).toBeNull();
  });

  it("keeps the gate error-free after a successful unlock", async () => {
    const onUnlock = vi.fn(async () => true);
    render(<DocsAccessGate texts={TEXTS} onUnlock={onUnlock} />);
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "secret" } });
    await act(async () => {
      fireEvent.submit(form());
    });
    expect(onUnlock).toHaveBeenCalledWith("secret");
    expect(screen.queryByText("Wrong password")).toBeNull();
  });
});
