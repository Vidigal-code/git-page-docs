// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GuideMotionProvider } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import { GuideParallaxBackdrop } from "@/page-slices/introduction-guide/ui/motion/guide-parallax-backdrop";
import { GuideReveal } from "@/page-slices/introduction-guide/ui/motion/guide-reveal";

// Own file: Motion reads the reduced-motion preference once per module load.
function stubReducedMotionBrowser() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduce"),
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

describe("guide motion with reduced motion", () => {
  it("keeps the same reveal element as the server render and its content", () => {
    stubReducedMotionBrowser();
    render(
      <GuideMotionProvider>
        <GuideReveal>
          <p>Calm body</p>
        </GuideReveal>
      </GuideMotionProvider>,
    );
    const wrapper = screen.getByText("Calm body").parentElement as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
    expect(screen.getByText("Calm body")).toBeTruthy();
  });

  it("does not move the backdrop layers", () => {
    stubReducedMotionBrowser();
    render(
      <GuideMotionProvider>
        <GuideParallaxBackdrop />
      </GuideMotionProvider>,
    );
    for (const layer of screen.getByTestId("guide-parallax-backdrop").querySelectorAll<HTMLElement>("[data-parallax-layer]")) {
      expect(layer.style.transform === "" || layer.style.transform === "none").toBe(true);
    }
  });
});
