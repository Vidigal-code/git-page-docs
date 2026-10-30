"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { REVEAL } from "../../model/motion-config";
import { useGuideMotion } from "./guide-motion-provider";

const HIDDEN = { opacity: 0, y: REVEAL.risePx };
const SHOWN = { opacity: 1, y: 0 };
const EASED = { duration: REVEAL.durationS, ease: REVEAL.ease };

/**
 * Fades and lifts its content into place the first time it scrolls into view.
 *
 * Pausing makes the content visible immediately without replacing its element.
 */
export function GuideReveal({ children }: Readonly<{ children: ReactNode }>) {
  const { enabled } = useGuideMotion();
  return (
    <m.div data-guide-reveal initial={enabled ? HIDDEN : false} animate={enabled ? undefined : SHOWN} whileInView={enabled ? SHOWN : undefined}
      style={enabled ? undefined : { opacity: 1, transform: "none" }}
      viewport={{ once: true, amount: REVEAL.viewportAmount }} transition={enabled ? EASED : { duration: 0 }}>
      {children}
    </m.div>
  );
}
