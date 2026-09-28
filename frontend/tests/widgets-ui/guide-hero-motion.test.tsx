// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { splitGlyphs, splitWords } from "@/page-slices/introduction-guide/model/hero-motion";
import { highlightDepth } from "@/page-slices/introduction-guide/model/story";
import { STORY_DEPTH } from "@/page-slices/introduction-guide/model/motion-config";
import { getGuideContent } from "@/page-slices/introduction-guide/content";
import { GuideMotionProvider } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import { GuideHero } from "@/page-slices/introduction-guide/ui/guide-hero";

describe("splitGlyphs", () => {
  it("splits a title into keyed glyphs, keeping emoji and accents whole", () => {
    expect(splitGlyphs("Git").map((g) => g.char)).toEqual(["G", "i", "t"]);
    expect(splitGlyphs("Olá 🚀").map((g) => g.char)).toEqual(["O", "l", "á", " ", "🚀"]);
    const keys = splitGlyphs("aa").map((g) => g.key);
    expect(new Set(keys).size).toBe(2);
  });
});

describe("splitWords", () => {
  it("keeps each word whole with unique keys and drops empty runs", () => {
    const words = splitWords("Git  Page Docs");
    expect(words.map((w) => w.glyphs.map((g) => g.char).join(""))).toEqual(["Git", "Page", "Docs"]);
    expect(new Set(words.map((w) => w.key)).size).toBe(3);
  });
});

describe("highlightDepth", () => {
  it("pushes each later highlight a little deeper than the details column", () => {
    expect(highlightDepth(0)).toBe(STORY_DEPTH.detailsPx);
    expect(highlightDepth(1)).toBeGreaterThan(highlightDepth(0));
    expect(highlightDepth(3)).toBeGreaterThan(highlightDepth(2));
  });
});

describe("GuideHero", () => {
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
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("names the heading with the whole title while its letters animate separately", () => {
    const { hero } = getGuideContent("pt");
    render(
      <GuideMotionProvider>
        <GuideHero hero={hero} projectUrl="https://example.com" backToSearchHref="/" backToSearchLabel="Back" onPrimary={vi.fn()} />
      </GuideMotionProvider>,
    );
    const heading = screen.getByRole("heading", { level: 1, name: hero.title });
    expect(heading.querySelectorAll("[data-hero-glyph]")).toHaveLength(Array.from(hero.title).length);
  });

  it("renders both calls to action with the shared button style", () => {
    const { hero } = getGuideContent("en");
    render(
      <GuideMotionProvider>
        <GuideHero hero={hero} projectUrl="https://example.com" backToSearchHref="/" backToSearchLabel="Back" onPrimary={vi.fn()} />
      </GuideMotionProvider>,
    );
    const primary = screen.getByRole("button", { name: hero.ctaPrimary });
    const secondary = screen.getByRole("link", { name: hero.ctaSecondary });
    expect(primary.dataset.heroAction).toBe("primary");
    expect(secondary.dataset.heroAction).toBe("secondary");
  });
});
