import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COMPACT_VIEWPORT_QUERY = "(max-width: 767px)";
const READY = 4;
const REDUCED = 1;
const HIDDEN = 2;
const COMPACT = 8;

function subscribe(onChange: () => void): () => void {
  const media = globalThis.matchMedia?.(REDUCED_MOTION_QUERY);
  const viewport = globalThis.matchMedia?.(COMPACT_VIEWPORT_QUERY);
  media?.addEventListener("change", onChange);
  viewport?.addEventListener("change", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    media?.removeEventListener("change", onChange);
    viewport?.removeEventListener("change", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getSnapshot(): number {
  const reduced = globalThis.matchMedia?.(REDUCED_MOTION_QUERY).matches ? REDUCED : 0;
  const compact = globalThis.matchMedia?.(COMPACT_VIEWPORT_QUERY).matches ? COMPACT : 0;
  return READY + reduced + compact + (document.hidden ? HIDDEN : 0);
}

function getServerSnapshot(): number {
  return 0;
}

export function useBackgroundEnvironment() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ready: (snapshot & READY) !== 0,
    reduced: (snapshot & REDUCED) !== 0,
    hidden: (snapshot & HIDDEN) !== 0,
    compact: (snapshot & COMPACT) !== 0,
  };
}
