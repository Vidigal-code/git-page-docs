import { m, useTransform } from "motion/react";
import type { ResolvedThemeBackgroundLayer } from "@/entities/docs";
import type { BackgroundParticle as Particle } from "../model/particles";
import { useParticleProgress } from "../model/use-particle-progress";
import { particleStyle, particleTravel } from "../model/particle-style";
import styles from "./theme-background.module.css";

interface BackgroundParticleProps {
  particle: Particle;
  layer: ResolvedThemeBackgroundLayer;
  running: boolean;
  speed: number;
}

export function BackgroundParticle({ particle, layer, running, speed }: Readonly<BackgroundParticleProps>) {
  const progress = useParticleProgress({ phase: particle.phase, duration: particle.duration, speed, running });
  const x = useTransform(progress, (value) => `${particleTravel(value, layer.kind) * layer.travel.x}vw`);
  const y = useTransform(progress, (value) => `${particleTravel(value, layer.kind) * layer.travel.y}vh`);
  const opacity = useTransform(progress, (value) => layer.opacity * Math.sin((value % 1) * Math.PI) ** 2);
  return (
    <m.span data-background-particle={layer.kind} className={styles.particle}
      style={{ ...particleStyle(particle, layer), x, y, opacity, rotate: layer.rotation }}>
      {layer.kind === "matrix" ? particle.text : null}
    </m.span>
  );
}
