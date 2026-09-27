"use client";

import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { PARALLAX_LAYERS, type ParallaxLayerSpec } from "../../model/motion-config";
import styles from "./guide-motion.module.css";

interface ParallaxLayerProps {
  readonly spec: ParallaxLayerSpec;
  readonly progress: MotionValue<number>;
  /** Travel actually applied: the configured one, or 0 for reduced motion. */
  readonly travelPx: number;
}

function layerClassName(spec: ParallaxLayerSpec): string {
  const positionClass = styles["layer-" + spec.id];
  const tintClass = styles["tint-" + spec.tint];
  return [styles.layer, positionClass, tintClass].join(" ");
}

function ParallaxLayer({ spec, progress, travelPx }: Readonly<ParallaxLayerProps>) {
  const y = useTransform(progress, [0, 1], [0, travelPx]);
  return <m.div data-parallax-layer={spec.id} className={layerClassName(spec)} style={{ y }} />;
}

/**
 * Decorative depth behind the guide: soft glows tinted with the active theme's
 * primary/secondary colours, each drifting at its own speed as the page scrolls.
 * Purely visual (hidden from assistive tech, no pointer events). Reduced motion
 * maps the travel to 0, keeping the same markup as the server render.
 */
export function GuideParallaxBackdrop() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  return (
    <div className={styles.backdrop} aria-hidden="true" data-testid="guide-parallax-backdrop">
      {PARALLAX_LAYERS.map((spec) => (
        <ParallaxLayer key={spec.id} spec={spec} progress={scrollYProgress} travelPx={reduceMotion ? 0 : spec.travelPx} />
      ))}
    </div>
  );
}
