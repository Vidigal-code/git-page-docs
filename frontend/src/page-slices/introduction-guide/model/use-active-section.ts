"use client";

import { useEffect, useState } from "react";

/** Approx. sticky-header offset so the "active" band starts just below the header. */
const HEADER_OFFSET = 96;

export interface ActiveSection {
  activeId: string;
  /** Set the active id optimistically (e.g. on a nav click) before the observer catches up. */
  setActiveId: (id: string) => void;
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

    const getElements = () =>
      ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

    // Pick the last section whose top has scrolled above the header band — the one
    // the reader is actually looking at. Falls back to the first/last at the edges.
    const recompute = () => {
      const elements = getElements();
      if (elements.length === 0) return;
      let current = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top - HEADER_OFFSET <= 1) {
          current = element.id;
        }
      }
      setActiveId(current);
    };

    recompute();
    // IntersectionObserver wakes us on entry/exit; we then recompute from geometry,
    // which is robust to multiple sections being on screen at once.
    const observer = new IntersectionObserver(recompute, {
      rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
      threshold: [0, 1],
    });
    getElements().forEach((element) => observer.observe(element));
    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", recompute);
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
