"use client";

import type { ResolvedThemeBackground } from "@/entities/docs";
import type { ReactElement } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import { allocateParticleBudget } from "../model/particle-budget";
import { useBackgroundEnvironment } from "../model/use-background-environment";
import { useBackgroundParallax } from "../model/use-background-parallax";
import { BackgroundLayer } from "./background-layer";
import styles from "./theme-background.module.css";

interface ThemeBackgroundProps {
  config: ResolvedThemeBackground;
  paused: boolean;
}

const COMPACT_PARTICLE_BUDGET = 4;
const DESKTOP_PARTICLE_BUDGET = 8;
const COMPACT_PARTICLE_INTERVAL = 4;
const DESKTOP_PARTICLE_INTERVAL = 2;

export function ThemeBackground({ config, paused }: Readonly<ThemeBackgroundProps>): ReactElement {
  const environment = useBackgroundEnvironment();
  const running = environment.ready && !environment.reduced && !environment.hidden && !paused;
  const compact = environment.compact || !environment.ready;
  const budget = compact ? COMPACT_PARTICLE_BUDGET : DESKTOP_PARTICLE_BUDGET;
  const interval = compact ? COMPACT_PARTICLE_INTERVAL : DESKTOP_PARTICLE_INTERVAL;
  const counts = config.performance?.mode === "auto"
    ? allocateParticleBudget(config.layers.map(layer => Math.ceil(layer.count / interval)), budget)
    : config.layers.map(layer => layer.count);
  const parallax = useBackgroundParallax({ config: config.parallax, running });
  return (
    <LazyMotion features={domAnimation} strict>
    <div className={styles.background} aria-hidden="true" data-testid="theme-background"
      hidden={environment.reduced && config.accessibility.reducedMotion === "hide"}
      style={{ background: config.surface, opacity: config.opacity }}>
      {config.layers.map((layer, index) => (
        <BackgroundLayer key={layer.id} layer={layer} parallax={parallax}
          running={running && config.animation.enabled} speed={config.animation.speed} visibleCount={counts[index]} />
      ))}
    </div>
    </LazyMotion>
  );
}
