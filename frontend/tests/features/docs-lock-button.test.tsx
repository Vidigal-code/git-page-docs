// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// jsdom parses its default stylesheet on the first getComputedStyle / role query,
// which takes seconds when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 });
import { DocsLockButton } from "@/features/docs-access/ui/docs-lock-button";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon";

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} data-testid="icon-image" />
  ),
}));

vi.mock("@/shared/ui/react-icon-by-tag", () => ({
  ReactIconByTag: ({ tag }: { tag?: string }) => <i data-testid="react-icon" data-tag={tag ?? ""} />,
}));

const TEXTS = {
  tooltip: "Lock documentation",
  popupTitle: "Lock the docs?",
  popupDescription: "You will need the password again.",
  confirmText: "Lock",
  cancelText: "Keep open",
};

function icon(overrides: Partial<ResolvedNavMenuIconConfig> = {}): ResolvedNavMenuIconConfig {
  return {
    iconImage: "",
    useReactIcon: false,
    reactIconTag: undefined,
    reactIconStyle: {},
    iconImgWidth: 20,
    iconImgHeight: 20,
    ...overrides,
  };
}

function renderButton(iconConfig: ResolvedNavMenuIconConfig = icon()) {
  const onConfirmBlock = vi.fn();
  render(<DocsLockButton icon={iconConfig} texts={TEXTS} onConfirmBlock={onConfirmBlock} className="lock" />);
  return { onConfirmBlock, button: screen.getByRole("button", { name: "Lock documentation" }) };
}

afterEach(() => {
  cleanup();
});

describe("DocsLockButton", () => {
  it("asks for confirmation before re-locking", () => {
    const { onConfirmBlock, button } = renderButton();
    expect(screen.queryByText("Lock the docs?")).toBeNull();

    fireEvent.click(button);
    expect(screen.getByText("Lock the docs?")).toBeTruthy();
    expect(screen.getByText("You will need the password again.")).toBeTruthy();
    expect(onConfirmBlock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Lock"));
    expect(onConfirmBlock).toHaveBeenCalledTimes(1);
  });

  it("closes the popup on cancel without locking", () => {
    const { onConfirmBlock, button } = renderButton();
    fireEvent.click(button);
    fireEvent.click(screen.getByText("Keep open"));
    expect(screen.queryByText("Lock the docs?")).toBeNull();
    expect(onConfirmBlock).not.toHaveBeenCalled();
  });

  it("renders the configured react icon, defaulting the tag to FiLock", () => {
    renderButton(icon({ useReactIcon: true, reactIconTag: "FiShield" }));
    expect(screen.getByTestId("react-icon").getAttribute("data-tag")).toBe("FiShield");
    cleanup();

    renderButton(icon({ useReactIcon: true }));
    expect(screen.getByTestId("react-icon").getAttribute("data-tag")).toBe("FiLock");
  });

  it("renders the configured image with the tooltip as alt text", () => {
    renderButton(icon({ iconImage: "/icons/lock.png" }));
    const image = screen.getByTestId("icon-image");
    expect(image.getAttribute("src")).toBe("/icons/lock.png");
    expect(image.getAttribute("alt")).toBe("Lock documentation");
  });

  it("falls back to the vendored lock glyph", () => {
    const { button } = renderButton();
    expect(button.querySelector("svg")).not.toBeNull();
    expect(screen.queryByTestId("react-icon")).toBeNull();
    expect(screen.queryByTestId("icon-image")).toBeNull();
  });
});
