// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GuideMotionProvider } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import { GuideParallaxBackdrop } from "@/page-slices/introduction-guide/ui/motion/guide-parallax-backdrop";
import { GuideReveal } from "@/page-slices/introduction-guide/ui/motion/guide-reveal";
import { PARALLAX_LAYERS } from "@/page-slices/introduction-guide/model/motion-config";

function stubBrowser(reducedMotion: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query.includes("reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GuideParallaxBackdrop", () => {
  beforeEach(() => stubBrowser(false));

  it("renders one decorative layer per configured depth, hidden from assistive tech", () => {
    render(
      <GuideMotionProvider>
        <GuideParallaxBackdrop />
      </GuideMotionProvider>,
    );
    const backdrop = screen.getByTestId("guide-parallax-backdrop");
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.querySelectorAll("[data-parallax-layer]")).toHaveLength(PARALLAX_LAYERS.length);
  });
});

describe("GuideReveal", () => {
  it("keeps its content in the document for readers and search", () => {
    stubBrowser(false);
    render(
      <GuideMotionProvider>
        <GuideReveal>
          <p>Section body</p>
        </GuideReveal>
      </GuideMotionProvider>,
    );
    expect(screen.getByText("Section body")).toBeTruthy();
  });
});
