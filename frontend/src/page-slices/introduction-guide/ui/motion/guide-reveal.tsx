"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion } from "motion/react";
import { REVEAL } from "../../model/motion-config";

const HIDDEN = { opacity: 0, y: REVEAL.risePx };
const SHOWN = { opacity: 1, y: 0 };
const EASED = { duration: REVEAL.durationS, ease: REVEAL.ease };
const INSTANT = { duration: 0 };

/**
 * Fades and lifts its content into place the first time it scrolls into view.
 *
 * The element is the same on the server and in the browser (the server cannot
 * know the visitor's motion preference, and swapping elements would leave the
 * server's hidden style behind after hydration). Reduced motion only changes the
 * transition: the content snaps to its final state instead of animating.
 */
export function GuideReveal({ children }: Readonly<{ children: ReactNode }>) {
  const reduceMotion = useReducedMotion();
  return (
    <m.div
      initial={HIDDEN}
      whileInView={SHOWN}
      viewport={{ once: true, amount: REVEAL.viewportAmount }}
      transition={reduceMotion ? INSTANT : EASED}
    >
      {children}
    </m.div>
  );
}
