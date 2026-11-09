import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import type { ResolvedThemeBackground } from "@/entities/docs";

const VIEWPORT_SCROLL_LIMIT = 0.5;

export interface BackgroundParallax {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollY: MotionValue<number>;
}

interface ParallaxOptions {
  config: ResolvedThemeBackground["parallax"];
  running: boolean;
}

export function useBackgroundParallax({ config, running }: ParallaxOptions): BackgroundParallax {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  useEffect(() => {
    if (!running || !config.enabled) return;
    let pendingFrame: number | null = null;
    let latestPointer: { x: number; y: number } | null = null;
    const updateScroll = () => {
      const limit = window.innerHeight * VIEWPORT_SCROLL_LIMIT;
      scrollY.set(Math.max(-limit, Math.min(limit, window.scrollY * config.scroll)));
    };
    const updateFrame = () => {
      pendingFrame = null;
      if (latestPointer) {
        pointerX.set((latestPointer.x / window.innerWidth * 2 - 1) * config.pointer);
        pointerY.set((latestPointer.y / window.innerHeight * 2 - 1) * config.pointer);
        latestPointer = null;
      }
      updateScroll();
    };
    const scheduleFrame = () => {
      pendingFrame ??= window.requestAnimationFrame(updateFrame);
    };
    const updatePointer = (event: PointerEvent) => {
      latestPointer = { x: event.clientX, y: event.clientY };
      scheduleFrame();
    };
    updateScroll();
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", scheduleFrame, { passive: true });
    window.addEventListener("resize", scheduleFrame, { passive: true });
    return () => {
      if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", scheduleFrame);
      window.removeEventListener("resize", scheduleFrame);
    };
  }, [config.enabled, config.pointer, config.scroll, running, pointerX, pointerY, scrollY]);

  return { pointerX, pointerY, scrollY };
}
