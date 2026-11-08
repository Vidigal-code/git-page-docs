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
  density: "full" | "balanced" | "compact";
}

const COMPACT_PARTICLE_INTERVAL = 2;
const BALANCED_PARTICLE_INTERVAL = 4;

export function BackgroundLayer({ layer, parallax, running, speed, density }: Readonly<BackgroundLayerProps>) {
  const particles = useMemo(() => createParticles(layer), [layer]);
  const keyframes = useMemo(() => particleKeyframes(layer), [layer]);
  const x = useTransform(() => parallax.pointerX.get() * layer.depth);
  const y = useTransform(() => (parallax.pointerY.get() + parallax.scrollY.get()) * layer.depth);
  return (
    <m.div className={styles.layer} data-background-layer={layer.id} style={{ x, y }}>
      {particles.map((particle, index) => {
        const visible = density === "full" || (density === "compact"
          ? index % COMPACT_PARTICLE_INTERVAL === 0
          : index % BALANCED_PARTICLE_INTERVAL !== BALANCED_PARTICLE_INTERVAL - 1);
        return <BackgroundParticle key={particle.id} particle={particle} layer={layer}
          running={running && visible} visible={visible} speed={speed} keyframes={keyframes} />;
      })}
    </m.div>
  );
}
