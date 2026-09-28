"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { REVEAL } from "../../model/motion-config";

const HIDDEN = { opacity: 0, y: REVEAL.risePx };
const SHOWN = { opacity: 1, y: 0 };
const EASED = { duration: REVEAL.durationS, ease: REVEAL.ease };

/**
 * Fades and lifts its content into place the first time it scrolls into view.
 *
 * The element and its props are the same for every visitor, so the static
 * render always matches the browser. Under reduced motion the provider's
 * `MotionConfig reducedMotion="user"` skips the lift and keeps the fade.
 */
export function GuideReveal({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <m.div initial={HIDDEN} whileInView={SHOWN} viewport={{ once: true, amount: REVEAL.viewportAmount }} transition={EASED}>
      {children}
    </m.div>
  );
}
