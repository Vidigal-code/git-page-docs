"use client";

import { useEffect, useState } from "react";

/** Approx. sticky-header offset so the "active" band starts just below the header. */
const HEADER_OFFSET = 96;
const HEADER_TOLERANCE = 1;

interface SectionPosition {
  readonly id: string;
  readonly top: number;
}

export interface ActiveSection {
  activeId: string;
  /** Set the active id optimistically (e.g. on a nav click) before the observer catches up. */
  setActiveId: (id: string) => void;
}

function documentLayoutTop(element: HTMLElement): number {
  let top = element.offsetTop;
  for (let parent = element.offsetParent; parent instanceof HTMLElement; parent = parent.offsetParent) {
    top += parent.offsetTop + parent.clientTop;
  }
  return top;
}

/**
 * Scrollspy: tracks which section id is currently in view. Generic over any set of
 * element ids so it can be reused by any in-page navigation. The whole window scrolls
 * (the layout has no inner scroll container), so the observer root is the viewport.
 */
export function useActiveSection(ids: string[]): ActiveSection {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0 || typeof window === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    let positions: SectionPosition[] = [];

    const updateActive = () => {
      if (positions.length === 0) return;
      const boundary = window.scrollY + HEADER_OFFSET + HEADER_TOLERANCE;
      let nextId = positions[0].id;
      for (const position of positions) {
        if (position.top <= boundary) nextId = position.id;
      }
      setActiveId(nextId);
    };

    // Layout offsets exclude temporary reveal transforms and stay stable during scrolling.
    const recompute = () => {
      positions = elements.map((element) => ({
        id: element.id,
        top: documentLayoutTop(element),
      }));
      updateActive();
    };

    recompute();
    // IntersectionObserver wakes us on entry/exit; we then recompute from geometry,
    // which is robust to multiple sections being on screen at once.
    const observer = new IntersectionObserver(recompute, {
      rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
      threshold: [0, 1],
    });
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(recompute);
    elements.forEach((element) => {
      observer.observe(element);
      resizeObserver?.observe(element);
    });
    resizeObserver?.observe(document.body);
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", recompute);
    };
  }, [ids]);

  return { activeId, setActiveId };
}

/** Smoothly scroll a section into view and reflect it in the URL hash. */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof history !== "undefined") {
    history.replaceState(null, "", `#${id}`);
  }
}
