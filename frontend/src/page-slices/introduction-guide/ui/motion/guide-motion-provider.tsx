"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/**
 * Loads only Motion's DOM animation features for the guide and, with `strict`,
 * rejects the heavier `motion.*` components so every animated element uses the
 * lightweight `m.*` ones. `reducedMotion="user"` turns transform animations off
 * for visitors who ask their system for less motion.
 */
export function GuideMotionProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
