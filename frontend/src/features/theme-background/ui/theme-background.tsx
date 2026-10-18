"use client";

import type { ResolvedThemeBackground } from "@/entities/docs";
import { LazyMotion, domAnimation } from "motion/react";
import { useBackgroundEnvironment } from "../model/use-background-environment";
import { useBackgroundParallax } from "../model/use-background-parallax";
import { BackgroundLayer } from "./background-layer";
import styles from "./theme-background.module.css";

interface ThemeBackgroundProps {
  config: ResolvedThemeBackground;
  paused: boolean;
}

export function ThemeBackground({ config, paused }: Readonly<ThemeBackgroundProps>) {
  const environment = useBackgroundEnvironment();
  const running = environment.ready && !environment.reduced && !environment.hidden && !paused;
  const parallax = useBackgroundParallax({ config: config.parallax, running });
  return (
    <LazyMotion features={domAnimation} strict>
    <div className={styles.background} aria-hidden="true" data-testid="theme-background"
      hidden={environment.reduced && config.accessibility.reducedMotion === "hide"}
      style={{ background: config.surface, opacity: config.opacity }}>
      {config.layers.map((layer) => (
        <BackgroundLayer key={layer.id} layer={layer} parallax={parallax}
          running={running && config.animation.enabled} speed={config.animation.speed} />
      ))}
    </div>
    </LazyMotion>
  );
}
