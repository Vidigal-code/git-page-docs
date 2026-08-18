"use client";

import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query, re-rendering when it flips. Starts as `false`
 * until mounted so server and first client render stay consistent.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const sync = () => setMatches(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
