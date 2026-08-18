"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` during server rendering.
 *
 * Layout effects run before the browser paints, which is what lets a client
 * component correct itself without the user seeing the pre-correction frame.
 * React warns when `useLayoutEffect` runs on the server, so prerendered pages
 * fall back to `useEffect` — where there is no paint to beat anyway.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
