// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { buildStoryChapters, chapterAt, chapterTimeline, chapterWindow } from "@/page-slices/introduction-guide/model/story";
import { getGuideContent } from "@/page-slices/introduction-guide/content";
import { GuideMotionProvider } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import { GuideStory } from "@/page-slices/introduction-guide/ui/story/guide-story";
import type { GuideSection } from "@/page-slices/introduction-guide/model/types";

const section = (overrides: Partial<GuideSection>): GuideSection => ({
  id: "s",
  icon: "FiBox",
  title: "Title",
  lead: "Lead",
  keywords: [],
  blocks: [],
  ...overrides,
});

describe("buildStoryChapters", () => {
  it("keeps title, lead, the first paragraph and up to four highlights per section", () => {
    const [chapter] = buildStoryChapters([
      section({
        id: "overview",
        blocks: [
          { type: "paragraph", text: "First paragraph." },
          { type: "paragraph", text: "Second paragraph." },
          { type: "table", headers: ["Package", "Role"], rows: [["cli", "a"], ["mcp", "b"], ["tools", "c"], ["x", "d"], ["y", "e"]] },
        ],
      }),
    ]);
    expect(chapter).toEqual({
      id: "overview",
      icon: "FiBox",
      number: "01",
      title: "Title",
      lead: "Lead",
      body: "First paragraph.",
      highlights: ["cli", "mcp", "tools", "x"],
    });
  });

  it("takes highlights from lists, then tables, then code, skipping comments and blanks", () => {
    const [fromList, fromCode, empty] = buildStoryChapters([
      section({ blocks: [{ type: "list", items: ["one", "two"] }, { type: "table", rows: [["t"]] }] }),
      section({ blocks: [{ type: "code", code: "# comment\nnpx a\n\nnpx b" }] }),
      section({ blocks: [] }),
    ]);
    expect(fromList.highlights).toEqual(["one", "two"]);
    expect(fromCode.highlights).toEqual(["npx a", "npx b"]);
    expect(empty).toMatchObject({ number: "03", body: undefined, highlights: [] });
  });

  it("builds a chapter for every section of the real guide", () => {
    const content = getGuideContent("pt");
    const chapters = buildStoryChapters(content.sections);
    expect(chapters).toHaveLength(content.sections.length);
    expect(chapters.every((c) => c.title && c.lead)).toBe(true);
  });
});

describe("chapterWindow", () => {
  it("splits the scroll into equal chapter slices that fade in, hold and fade out", () => {
    expect(chapterWindow(1, 4)).toEqual({ start: 0.25, enter: 0.3, exit: 0.45, end: 0.5 });
  });

  it("keeps the first chapter visible at the top and the last one at the bottom", () => {
    const first = chapterWindow(0, 4);
    const last = chapterWindow(3, 4);
    expect(first.start).toBe(0);
    expect(first.enter).toBe(0);
    expect(last.exit).toBe(1);
    expect(last.end).toBe(1);
  });
});

describe("chapterTimeline", () => {
  it("fades a middle chapter in, holds it and fades it out while its layers drift", () => {
    expect(chapterTimeline(1, 4)).toEqual({
      input: [0.25, 0.3, 0.45, 0.5],
      opacity: [0, 1, 1, 0],
      shift: [1, 0, 0, -1],
    });
  });

  it("starts the first chapter fully shown and ends the last one fully shown", () => {
    expect(chapterTimeline(0, 4)).toEqual({ input: [0, 0.2, 0.25], opacity: [1, 1, 0], shift: [0, 0, -1] });
    expect(chapterTimeline(3, 4)).toEqual({ input: [0.75, 0.8, 1], opacity: [0, 1, 1], shift: [1, 0, 0] });
  });

  it("keeps strictly increasing keyframes for a single chapter", () => {
    expect(chapterTimeline(0, 1)).toEqual({ input: [0, 1], opacity: [1, 1], shift: [0, 0] });
  });
});

describe("chapterAt", () => {
  it("maps scroll progress to the chapter whose slice contains it, clamped to the ends", () => {
    expect(chapterAt(-0.2, 4)).toBe(0);
    expect(chapterAt(0.49, 4)).toBe(1);
    expect(chapterAt(0.5, 4)).toBe(2);
    expect(chapterAt(1, 4)).toBe(3);
  });
});

describe("GuideStory", () => {
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

  it("renders every chapter title for readers, a counter and a skip link to the full guide", () => {
    const content = getGuideContent("en");
    render(
      <GuideMotionProvider>
        <GuideStory sections={content.sections} ui={content.ui} skipTargetId="guide-body" />
      </GuideMotionProvider>,
    );
    const story = screen.getByTestId("guide-story");
    expect(story.querySelectorAll("[data-story-chapter]")).toHaveLength(content.sections.length);
    for (const s of content.sections) expect(screen.getByRole("heading", { name: s.title })).toBeTruthy();
    expect(screen.getByTestId("guide-story-counter").textContent).toBe(`01 / ${String(content.sections.length).padStart(2, "0")}`);
    const skip = screen.getByRole("link", { name: content.ui.storySkip });
    expect(skip.getAttribute("href")).toBe("#guide-body");
  });
});
