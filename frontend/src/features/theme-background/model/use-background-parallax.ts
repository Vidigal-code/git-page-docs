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
    const updatePointer = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth * 2 - 1) * config.pointer);
      pointerY.set((event.clientY / window.innerHeight * 2 - 1) * config.pointer);
    };
    const updateScroll = () => {
      const limit = window.innerHeight * VIEWPORT_SCROLL_LIMIT;
      scrollY.set(Math.max(-limit, Math.min(limit, window.scrollY * config.scroll)));
    };
    updateScroll();
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [config.enabled, config.pointer, config.scroll, running, pointerX, pointerY, scrollY]);

  return { pointerX, pointerY, scrollY };
}
