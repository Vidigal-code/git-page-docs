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
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    cleanup();
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

  it("scrolls to the top smoothly and moves focus to the top of the page", () => {
    const target = document.createElement("header");
    target.id = "guide-top";
    target.tabIndex = -1;
    document.body.append(target);
    render(
      <GuideMotionProvider>
        <GuideBackToTop label="Back to top" targetId="guide-top" />
      </GuideMotionProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(document.activeElement).toBe(target);
    target.remove();
  });
});
