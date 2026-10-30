"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

export interface GuideMotionState {
  readonly enabled: boolean;
  readonly paused: boolean;
  readonly reducedMotion: boolean;
  readonly toggle: () => void;
}

const GuideMotionContext = createContext<GuideMotionState | null>(null);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
  const preference = window.matchMedia(REDUCED_MOTION_QUERY);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

export function useGuideMotion(): GuideMotionState {
  const state = useContext(GuideMotionContext);
  if (!state) throw new Error("Guide motion controls require GuideMotionProvider.");
  return state;
}

/**
 * Loads only Motion's DOM animation features for the guide and, with `strict`,
 * rejects the heavier `motion.*` components so every animated element uses the
 * lightweight `m.*` ones. The shared state respects both the guide's pause
 * control and the visitor's reduced-motion preference.
 */
export function GuideMotionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getServerReducedMotionSnapshot);
  const enabled = !paused && !reducedMotion;
  const toggle = useCallback(() => setPaused((previous) => !previous), []);
  const state = useMemo(() => ({ enabled, paused, reducedMotion, toggle }), [enabled, paused, reducedMotion, toggle]);
  return (
    <GuideMotionContext.Provider value={state}>
      <MotionConfig reducedMotion={enabled ? "user" : "always"}>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </GuideMotionContext.Provider>
  );
}
