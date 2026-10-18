// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GuideBackToTop } from "@/page-slices/introduction-guide/ui/guide-back-to-top";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  vi.stubGlobal("innerHeight", 800);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("hides the return-to-top arrow when the guide is shorter than three viewports", () => {
  render(<GuideBackToTop label="Back to top" targetId="guide-top" />);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
});

it("allows configuration to disable the arrow even on a long guide", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(3000);
  const { rerender } = render(<GuideBackToTop label="Back to top" targetId="guide-top" settings={{ enabled: false }} />);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
  rerender(<GuideBackToTop label="Back to top" targetId="guide-top" settings={{ enabled: true }} />);
  expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
});

it("shows the arrow at the configured viewport threshold and hides it below that threshold", () => {
  const { rerender } = render(<GuideBackToTop label="Back to top" targetId="guide-top" settings={{ minPageHeightViewports: 2.5 }} />);
  expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
  rerender(<GuideBackToTop label="Back to top" targetId="guide-top" settings={{ minPageHeightViewports: 2.51 }} />);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
});

it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 0, 1])("uses the default threshold for invalid minimum %s", (minimum) => {
  const height = vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2399);
  render(<GuideBackToTop label="Back to top" targetId="guide-top" settings={{ minPageHeightViewports: minimum }} />);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
  height.mockReturnValue(2400);
  fireEvent(window, new Event("resize"));
  expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
});

it("updates visibility when the viewport changes, including when the page no longer overflows", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2400);
  render(<GuideBackToTop label="Back to top" targetId="guide-top" />);
  expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
  vi.stubGlobal("innerHeight", 2400);
  fireEvent(window, new Event("resize"));
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
  vi.stubGlobal("innerHeight", 0);
  fireEvent(window, new Event("resize"));
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
});

it("updates visibility as asynchronous guide content grows and shrinks", () => {
  let notifyResize: VoidFunction = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: VoidFunction) { notifyResize = callback; }
    observe = vi.fn();
    disconnect = disconnect;
  });
  const bodyHeight = vi.spyOn(document.body, "scrollHeight", "get").mockReturnValue(2000);
  const { unmount } = render(<GuideBackToTop label="Back to top" targetId="guide-top" />);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
  bodyHeight.mockReturnValue(3200);
  act(notifyResize);
  expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
  bodyHeight.mockReturnValue(2000);
  act(notifyResize);
  expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
