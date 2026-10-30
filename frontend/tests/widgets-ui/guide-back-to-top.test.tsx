// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getGuideContent } from "@/page-slices/introduction-guide/content";
import { GuideMotionProvider } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import { GuideBackToTop } from "@/page-slices/introduction-guide/ui/guide-back-to-top";

describe("GuideBackToTop", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal("innerHeight", 800);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2400);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each(["en", "pt", "es"] as const)("labels the button in %s", (language) => {
    const { ui } = getGuideContent(language);
    expect(ui.backToTop).toBeTruthy();
    render(
      <GuideMotionProvider>
        <GuideBackToTop label={ui.backToTop} targetId="guide-top" />
      </GuideMotionProvider>,
    );
    expect(screen.getByRole("button", { name: ui.backToTop })).toBeTruthy();
  });

  it.each([false, true])("returns to the guide top instantly with reduced motion %s", (reducedMotion) => {
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia("(prefers-reduced-motion: reduce)"),
      matches: reducedMotion,
    });
    render(
      <>
        <header id="guide-top" tabIndex={-1}>Guide</header>
        <GuideBackToTop label="Back to top" targetId="guide-top" />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    expect(document.activeElement).toBe(screen.getByRole("banner"));
  });
});
