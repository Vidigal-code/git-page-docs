import { useMemo } from "react";
import { m, useTransform } from "motion/react";
import type { ResolvedThemeBackgroundLayer } from "@/entities/docs";
import { createParticles } from "../model/particles";
import { particleKeyframes } from "../model/particle-style";
import type { BackgroundParallax } from "../model/use-background-parallax";
import { BackgroundParticle } from "./background-particle";
import styles from "./theme-background.module.css";

interface BackgroundLayerProps {
  layer: ResolvedThemeBackgroundLayer;
  parallax: BackgroundParallax;
  running: boolean;
  speed: number;
}

export function BackgroundLayer({ layer, parallax, running, speed }: Readonly<BackgroundLayerProps>) {
  const particles = useMemo(() => createParticles(layer), [layer]);
  const keyframes = useMemo(() => particleKeyframes(layer), [layer]);
  const x = useTransform(() => parallax.pointerX.get() * layer.depth);
  const y = useTransform(() => (parallax.pointerY.get() + parallax.scrollY.get()) * layer.depth);
  return (
    <m.div className={styles.layer} data-background-layer={layer.id} style={{ x, y }}>
      {particles.map((particle) => (
        <BackgroundParticle key={particle.id} particle={particle} layer={layer} running={running} speed={speed} keyframes={keyframes} />
      ))}
    </m.div>
  );
}
