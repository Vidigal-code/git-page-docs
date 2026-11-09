import { useEffect, useRef, type ReactElement } from "react";
import type { ResolvedThemeBackgroundLayer } from "@/entities/docs";
import type { BackgroundParticle as Particle } from "../model/particles";
import { particleStyle } from "../model/particle-style";
import styles from "./theme-background.module.css";

interface BackgroundParticleProps {
  particle: Particle;
  layer: ResolvedThemeBackgroundLayer;
  running: boolean;
  speed: number;
  keyframes: Keyframe[];
  visible: boolean;
}

const MILLISECONDS_PER_SECOND = 1000;

export function BackgroundParticle({ particle, layer, running, speed, keyframes, visible }: Readonly<BackgroundParticleProps>): ReactElement {
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const { duration: durationSeconds, phase } = particle;
  useEffect(() => () => {
    animationRef.current?.cancel();
    animationRef.current = null;
  }, [durationSeconds, phase]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element?.animate) return;
    let animation = animationRef.current;
    if (!animation) {
      if (!visible) return;
      const duration = durationSeconds * MILLISECONDS_PER_SECOND;
      animation = element.animate(keyframes, { duration, iterations: Infinity, easing: "linear" });
      animation.pause();
      animation.currentTime = phase * duration;
      animationRef.current = animation;
    } else {
      const effect = animation.effect as KeyframeEffect | null;
      effect?.setKeyframes(keyframes);
    }
    animation.updatePlaybackRate(speed);
    if (running) animation.play();
    else animation.pause();
  }, [running, speed, durationSeconds, phase, keyframes, visible]);

  return (
    <span ref={elementRef} hidden={!visible} data-background-particle={layer.kind} className={styles.particle}
      style={particleStyle(particle, layer)}>
      {layer.kind === "matrix" ? particle.text : null}
    </span>
  );
}
