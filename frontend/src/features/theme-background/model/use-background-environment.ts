import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const READY = 4;
const REDUCED = 1;
const HIDDEN = 2;

function subscribe(onChange: () => void): () => void {
  const media = globalThis.matchMedia?.(REDUCED_MOTION_QUERY);
  media?.addEventListener("change", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    media?.removeEventListener("change", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getSnapshot(): number {
  const reduced = globalThis.matchMedia?.(REDUCED_MOTION_QUERY).matches ? REDUCED : 0;
  return READY + reduced + (document.hidden ? HIDDEN : 0);
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
  };
}
