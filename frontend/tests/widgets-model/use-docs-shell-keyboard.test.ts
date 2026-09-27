// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { useDocsShellKeyboard } from "@/widgets/docs-shell/model/use-docs-shell-keyboard";

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, cancelable: true, ...init });
  window.dispatchEvent(event);
  return event;
}

type KeyboardFlags = Pick<Parameters<typeof useDocsShellKeyboard>[0], "activeNavigation" | "quickNavOpen" | "focusModeOpen">;

function makeOptions(overrides: Partial<KeyboardFlags> = {}) {
  return {
    activeNavigation: true,
    quickNavOpen: false,
    focusModeOpen: false,
    setMenuOpen: vi.fn(),
    setFocusModeOpen: vi.fn(),
    setQuickNavOpen: vi.fn(),
    setQuickNavQuery: vi.fn(),
    ...overrides,
  };
}

afterEach(cleanup);

describe("useDocsShellKeyboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores every key while active navigation is disabled", () => {
    const options = makeOptions({ activeNavigation: false, focusModeOpen: true });
    renderHook(() => useDocsShellKeyboard(options));
    const event = press("k", { ctrlKey: true });
    press("Escape");
    expect(event.defaultPrevented).toBe(false);
    expect(options.setQuickNavOpen).not.toHaveBeenCalled();
    expect(options.setFocusModeOpen).not.toHaveBeenCalled();
  });

  it("toggles quick navigation on Ctrl+K, closing the menu and focus mode", () => {
    const options = makeOptions();
    renderHook(() => useDocsShellKeyboard(options));
    const event = press("K", { ctrlKey: true });
    expect(event.defaultPrevented).toBe(true);
    expect(options.setMenuOpen).toHaveBeenCalledWith(false);
    expect(options.setFocusModeOpen).toHaveBeenCalledWith(false);
    expect(options.setQuickNavOpen).toHaveBeenCalledTimes(1);
    const toggle = options.setQuickNavOpen.mock.calls[0][0] as (prev: boolean) => boolean;
    expect(toggle(false)).toBe(true);
    expect(toggle(true)).toBe(false);
    // Opening from a closed state clears the previous query.
    expect(options.setQuickNavQuery).toHaveBeenCalledWith("");
  });

  it("accepts Meta+K and keeps the query when quick navigation is already open", () => {
    const options = makeOptions({ quickNavOpen: true });
    renderHook(() => useDocsShellKeyboard(options));
    press("k", { metaKey: true });
    expect(options.setQuickNavOpen).toHaveBeenCalledTimes(1);
    expect(options.setQuickNavQuery).not.toHaveBeenCalled();
  });

  it("does nothing for a plain k or unrelated keys", () => {
    const options = makeOptions();
    renderHook(() => useDocsShellKeyboard(options));
    press("k");
    press("Enter", { ctrlKey: true });
    expect(options.setQuickNavOpen).not.toHaveBeenCalled();
    expect(options.setMenuOpen).not.toHaveBeenCalled();
  });

  it("closes focus mode on Escape only while it is open", () => {
    const closed = makeOptions();
    const { unmount } = renderHook(() => useDocsShellKeyboard(closed));
    const ignored = press("Escape");
    expect(ignored.defaultPrevented).toBe(false);
    expect(closed.setFocusModeOpen).not.toHaveBeenCalled();
    unmount();

    const open = makeOptions({ focusModeOpen: true });
    renderHook(() => useDocsShellKeyboard(open));
    const handled = press("Escape");
    expect(handled.defaultPrevented).toBe(true);
    expect(open.setFocusModeOpen).toHaveBeenCalledWith(false);
  });

  it("removes the listener on unmount", () => {
    const options = makeOptions();
    const { unmount } = renderHook(() => useDocsShellKeyboard(options));
    unmount();
    press("k", { ctrlKey: true });
    expect(options.setQuickNavOpen).not.toHaveBeenCalled();
  });
});
