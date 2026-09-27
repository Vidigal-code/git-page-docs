// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollToSection, useActiveSection } from "@/page-slices/introduction-guide/model/use-active-section";
import { useGuideSearch } from "@/page-slices/introduction-guide/model/use-guide-search";
import type { GuideSection } from "@/page-slices/introduction-guide/model/types";

const HEADER_OFFSET = 96;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed: Element[] = [];
  readonly disconnect = vi.fn();

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  unobserve() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  fire() {
    this.callback([], this as unknown as IntersectionObserver);
  }
}

const tops = new Map<string, number>();

function mountSections(entries: Array<[id: string, top: number]>) {
  document.body.innerHTML = "";
  tops.clear();
  for (const [id, top] of entries) {
    const element = document.createElement("section");
    element.id = id;
    element.getBoundingClientRect = () => ({ top: tops.get(id) ?? 0 }) as DOMRect;
    document.body.appendChild(element);
    tops.set(id, top);
  }
}

function scrollTo(next: Array<[id: string, top: number]>) {
  act(() => {
    for (const [id, top] of next) tops.set(id, top);
    window.dispatchEvent(new Event("scroll"));
  });
}

const IDS = ["overview", "quickstart", "cli"];

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("useActiveSection", () => {
  it("starts on the first id and follows the last section scrolled under the header band", () => {
    mountSections([
      ["overview", 0],
      ["quickstart", 600],
      ["cli", 1200],
    ]);
    const { result } = renderHook(() => useActiveSection(IDS));
    expect(result.current.activeId).toBe("overview");

    scrollTo([
      ["overview", -500],
      ["quickstart", HEADER_OFFSET + 1],
      ["cli", 700],
    ]);
    expect(result.current.activeId).toBe("quickstart");

    scrollTo([["cli", HEADER_OFFSET - 10]]);
    expect(result.current.activeId).toBe("cli");

    act(() => {
      tops.set("cli", 900);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.activeId).toBe("quickstart");
  });

  it("keeps the first section while nothing has crossed the band", () => {
    mountSections([
      ["overview", 300],
      ["quickstart", 900],
      ["cli", 1500],
    ]);
    const { result } = renderHook(() => useActiveSection(IDS));
    expect(result.current.activeId).toBe("overview");
  });

  it("observes every mounted section with the header/viewport margins and recomputes on intersection", () => {
    mountSections([
      ["overview", 0],
      ["quickstart", 600],
      ["cli", 1200],
    ]);
    const { result } = renderHook(() => useActiveSection(IDS));
    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.options).toEqual({ rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`, threshold: [0, 1] });
    expect(observer.observed.map((element) => element.id)).toEqual(IDS);

    tops.set("quickstart", 10);
    act(() => observer.fire());
    expect(result.current.activeId).toBe("quickstart");
  });

  it("ignores ids without a matching element", () => {
    mountSections([["overview", 0]]);
    const { result } = renderHook(() => useActiveSection(["overview", "missing"]));
    expect(FakeIntersectionObserver.instances[0].observed.map((element) => element.id)).toEqual(["overview"]);
    expect(result.current.activeId).toBe("overview");
  });

  it("does nothing for an empty id list or when no element exists yet", () => {
    const empty = renderHook(() => useActiveSection([]));
    expect(empty.result.current.activeId).toBe("");
    expect(FakeIntersectionObserver.instances).toHaveLength(0);

    document.body.innerHTML = "";
    const detached = renderHook(() => useActiveSection(["ghost"]));
    expect(detached.result.current.activeId).toBe("ghost");
    expect(FakeIntersectionObserver.instances[0].observed).toHaveLength(0);
  });

  it("accepts an optimistic active id from navigation clicks", () => {
    mountSections([
      ["overview", 0],
      ["quickstart", 600],
      ["cli", 1200],
    ]);
    const { result } = renderHook(() => useActiveSection(IDS));
    act(() => result.current.setActiveId("cli"));
    expect(result.current.activeId).toBe("cli");
  });

  it("disconnects the observer and stops listening on unmount", () => {
    mountSections([
      ["overview", 0],
      ["quickstart", 600],
    ]);
    const { result, unmount } = renderHook(() => useActiveSection(["overview", "quickstart"]));
    const [observer] = FakeIntersectionObserver.instances;
    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    scrollTo([["quickstart", 0]]);
    expect(result.current.activeId).toBe("overview");
  });
});

describe("scrollToSection", () => {
  it("smooth-scrolls the section into view and records the hash", () => {
    mountSections([["overview", 0]]);
    const element = document.getElementById("overview") as HTMLElement;
    element.scrollIntoView = vi.fn();
    const replaceState = vi.spyOn(window.history, "replaceState");

    scrollToSection("overview");
    expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(replaceState).toHaveBeenCalledWith(null, "", "#overview");
    replaceState.mockRestore();
  });

  it("is a no-op for an unknown id", () => {
    document.body.innerHTML = "";
    const replaceState = vi.spyOn(window.history, "replaceState");
    scrollToSection("missing");
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

describe("useGuideSearch", () => {
  const sections: GuideSection[] = [
    { id: "cli", icon: "FiTerminal", title: "CLI", lead: "Command line usage.", keywords: ["terminal", "commands"], blocks: [] },
    { id: "config", icon: "FiSettings", title: "Configuration", lead: "The config file.", keywords: ["json"], blocks: [] },
  ];

  it("filters sections as the query changes", () => {
    const { result } = renderHook(() => useGuideSearch(sections));
    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual(sections);

    act(() => result.current.setQuery("terminal"));
    expect(result.current.results.map((section) => section.id)).toEqual(["cli"]);

    act(() => result.current.setQuery("config json"));
    expect(result.current.results.map((section) => section.id)).toEqual(["config"]);

    act(() => result.current.setQuery("nothing-here"));
    expect(result.current.results).toEqual([]);
  });
});
