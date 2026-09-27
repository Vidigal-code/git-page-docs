// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom parses its default stylesheet on the first getComputedStyle / role query,
// which takes seconds when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 });
import {
  getCurrentHeadingHash,
  pushHeadingHash,
  scrollToHeadingElement,
  scrollToHeadingId,
} from "@/features/route-guide/lib/scroll-to-heading";

function defineSize(element: HTMLElement, scrollHeight: number, clientHeight: number): void {
  Object.defineProperty(element, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(element, "clientHeight", { configurable: true, value: clientHeight });
}

function placeAt(element: HTMLElement, top: number): void {
  element.getBoundingClientRect = () =>
    ({ top, bottom: top + 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
}

/** A vertically scrollable box (jsdom has no layout, so sizes are declared). */
function scrollBox(overflowY = "auto"): HTMLDivElement {
  const box = document.createElement("div");
  box.style.setProperty("overflow-y", overflowY);
  defineSize(box, 2000, 400);
  box.scrollTo = vi.fn<(options?: ScrollToOptions) => void>() as unknown as HTMLDivElement["scrollTo"];
  return box;
}

function heading(id: string): HTMLHeadingElement {
  const h2 = document.createElement("h2");
  h2.id = id;
  return h2;
}

let scrollIntoView: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView as unknown as Element["scrollIntoView"];
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("scrollToHeadingId", () => {
  it("returns false when the heading does not exist", () => {
    expect(scrollToHeadingId("missing")).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls the nearest scrollable ancestor, offsetting the padding from the element position", () => {
    const container = scrollBox();
    container.scrollTop = 50;
    placeAt(container, 100);
    const wrapper = document.createElement("div");
    const target = heading("intro");
    placeAt(target, 500);
    wrapper.append(target);
    container.append(wrapper);
    document.body.append(container);

    expect(scrollToHeadingId("intro")).toBe(true);
    // 500 (element) - 100 (container) + 50 (scrollTop) - 80 (default padding)
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 370, behavior: "smooth" });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("honours a custom behavior/padding and never scrolls above the top", () => {
    const container = scrollBox("scroll");
    placeAt(container, 100);
    const target = heading("first");
    placeAt(target, 100);
    container.append(target);
    document.body.append(container);

    scrollToHeadingId("first", { behavior: "auto", scrollPadding: 10 });
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("prefers the caller's container when it holds the heading and can scroll", () => {
    const preferred = scrollBox();
    placeAt(preferred, 0);
    const inner = scrollBox();
    placeAt(inner, 0);
    const target = heading("nested");
    placeAt(target, 300);
    inner.append(target);
    preferred.append(inner);
    document.body.append(preferred);

    scrollToHeadingId("nested", { preferredContainer: preferred });
    expect(preferred.scrollTo).toHaveBeenCalledWith({ top: 220, behavior: "smooth" });
    expect(inner.scrollTo).not.toHaveBeenCalled();
  });

  it("ignores a preferred container that is unrelated or cannot scroll", () => {
    const unrelated = scrollBox();
    const notScrollable = scrollBox("visible");
    placeAt(notScrollable, 0);
    const ancestor = scrollBox();
    placeAt(ancestor, 0);
    const target = heading("deep");
    placeAt(target, 150);
    ancestor.append(target);
    notScrollable.append(ancestor);
    document.body.append(unrelated, notScrollable);

    scrollToHeadingId("deep", { preferredContainer: unrelated });
    expect(unrelated.scrollTo).not.toHaveBeenCalled();
    expect(ancestor.scrollTo).toHaveBeenCalledWith({ top: 70, behavior: "smooth" });

    vi.mocked(ancestor.scrollTo).mockClear();
    scrollToHeadingId("deep", { preferredContainer: notScrollable });
    expect(notScrollable.scrollTo).not.toHaveBeenCalled();
    expect(ancestor.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("falls back to scrollIntoView when no ancestor scrolls (overflow visible or no overflow)", () => {
    const tall = scrollBox("visible");
    const short = scrollBox();
    defineSize(short, 100, 400);
    const target = heading("plain");
    short.append(target);
    tall.append(short);
    document.body.append(tall);

    expect(scrollToHeadingId("plain")).toBe(true);
    expect(tall.scrollTo).not.toHaveBeenCalled();
    expect(short.scrollTo).not.toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start", inline: "nearest" });
  });

  it("exposes the element-level entry point with default options", () => {
    const target = heading("direct");
    document.body.append(target);
    scrollToHeadingElement(target);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start", inline: "nearest" });
  });
});

describe("getCurrentHeadingHash", () => {
  afterEach(() => window.history.replaceState(null, "", window.location.pathname));

  it("returns an empty string without a hash", () => {
    expect(getCurrentHeadingHash()).toBe("");
  });

  it("decodes the fragment", () => {
    window.history.replaceState(null, "", "#getting%20started");
    expect(getCurrentHeadingHash()).toBe("getting started");
  });

  it("returns the raw fragment when it is not valid percent-encoding", () => {
    window.history.replaceState(null, "", "#%E0%A4%A");
    expect(getCurrentHeadingHash()).toBe("%E0%A4%A");
  });
});

describe("pushHeadingHash", () => {
  it("pushes the encoded heading as the fragment, keeping path and query", () => {
    window.history.replaceState(null, "", "/docs/page?v=2");
    const pushState = vi.spyOn(window.history, "pushState");
    pushHeadingHash("intro section");
    expect(pushState).toHaveBeenCalledWith(null, "", "/docs/page?v=2#intro%20section");
    expect(window.location.hash).toBe("#intro%20section");
  });
});
