"use client";

import { useSyncExternalStore } from "react";

/** The origin never changes while the page is open. */
const subscribe = (): (() => void) => () => undefined;
const readBrowserOrigin = (): string => window.location.origin;
const readServerOrigin = (): string => "";

/**
 * The page origin (`https://owner.github.io`). Empty in the static render, so
 * markup built at export time stays stable; the browser value arrives right
 * after hydration.
 */
export function usePageOrigin(): string {
  return useSyncExternalStore(subscribe, readBrowserOrigin, readServerOrigin);
}
