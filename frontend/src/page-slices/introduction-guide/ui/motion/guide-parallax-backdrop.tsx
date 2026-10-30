"use client";

import { m, useScroll, useTransform, type MotionValue } from "motion/react";
import { PARALLAX_LAYERS, type ParallaxLayerSpec } from "../../model/motion-config";
import { useGuideMotion } from "./guide-motion-provider";
import styles from "./guide-motion.module.css";

interface ParallaxLayerProps {
  readonly spec: ParallaxLayerSpec;
  readonly progress: MotionValue<number>;
}

function layerClassName(spec: ParallaxLayerSpec): string {
  const positionClass = styles["layer-" + spec.id];
  const tintClass = styles["tint-" + spec.tint];
  return [styles.layer, positionClass, tintClass].join(" ");
}

function ParallaxLayer({ spec, progress }: Readonly<ParallaxLayerProps>) {
  const { enabled } = useGuideMotion();
  const y = useTransform(progress, [0, 1], [0, spec.travelPx]);
  return <m.div data-parallax-layer={spec.id} className={layerClassName(spec)} style={{ y: enabled ? y : 0 }} />;
}

/**
 * Decorative depth behind the guide: soft glows tinted with the active theme's
 * primary/secondary colours, each drifting at its own speed as the page scrolls.
 * Purely visual (hidden from assistive tech, no pointer events). Reduced motion
 * maps the travel to 0, keeping the same markup as the server render.
 */
export function GuideParallaxBackdrop() {
  const { scrollYProgress } = useScroll();
  const { enabled } = useGuideMotion();
  return (
    <div className={styles.backdrop} aria-hidden="true" data-testid="guide-parallax-backdrop" data-motion={enabled ? "enabled" : "disabled"}>
      {PARALLAX_LAYERS.map((spec) => (
        <ParallaxLayer key={spec.id} spec={spec} progress={scrollYProgress} />
      ))}
    </div>
  );
}
