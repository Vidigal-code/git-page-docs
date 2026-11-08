// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useActiveSection } from "@/page-slices/introduction-guide/model/use-active-section";

const SECTION_IDS = ["overview", "quickstart", "cli"];
const SECTION_HEIGHT = 600;
const SCROLL_STEP = 20;
const measure = vi.fn();
let resize: ResizeObserverCallback;
const disconnect = vi.fn();

function mountGuide() {
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const tops = new Map<string, number>();
  SECTION_IDS.forEach((id, index) => {
    tops.set(id, index * SECTION_HEIGHT);
    const section = document.createElement("section");
    section.id = id;
    section.getBoundingClientRect = () => {
      measure();
      return { top: (tops.get(id) ?? 0) - window.scrollY } as DOMRect;
    };
    Object.defineProperty(section, "offsetTop", { get: () => {
      measure();
      return tops.get(id) ?? 0;
    } });
    document.body.append(section);
  });
  return { ...renderHook(() => useActiveSection(SECTION_IDS)), tops };
}

function scrollTo(position: number) {
  vi.stubGlobal("scrollY", position);
  window.dispatchEvent(new Event("scroll"));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

it("follows scrolling in both directions without repeatedly measuring unchanged sections", () => {
  const { result } = mountGuide();
  measure.mockClear();
  act(() => {
    for (let position = 0; position <= SECTION_HEIGHT * 2; position += SCROLL_STEP) scrollTo(position);
  });
  expect(result.current.activeId).toBe("cli");
  act(() => scrollTo(SECTION_HEIGHT));
  expect(result.current.activeId).toBe("quickstart");
  expect(measure).not.toHaveBeenCalled();
});

it("refreshes positions when content changes height without a window resize", () => {
  const { result, tops } = mountGuide();
  act(() => scrollTo(SECTION_HEIGHT));
  expect(result.current.activeId).toBe("quickstart");
  tops.set("quickstart", SECTION_HEIGHT * 2);
  tops.set("cli", SECTION_HEIGHT * 3);
  act(() => resize([], {} as ResizeObserver));
  expect(result.current.activeId).toBe("overview");
  act(() => scrollTo(SECTION_HEIGHT * 2));
  expect(result.current.activeId).toBe("quickstart");
});

it("restores the actual section after an optimistic selection and disconnects on unmount", () => {
  const { result, unmount } = mountGuide();
  act(() => result.current.setActiveId("cli"));
  act(() => scrollTo(0));
  expect(result.current.activeId).toBe("overview");
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
