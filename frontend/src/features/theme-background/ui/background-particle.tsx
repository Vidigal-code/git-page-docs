import { useEffect, useRef } from "react";
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

export function BackgroundParticle({ particle, layer, running, speed, keyframes, visible }: Readonly<BackgroundParticleProps>) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const { duration: durationSeconds, phase } = particle;
  useEffect(() => {
    const element = elementRef.current;
    if (!element?.animate) return;
    const duration = durationSeconds * MILLISECONDS_PER_SECOND;
    const animation = element.animate([], { duration, iterations: Infinity, easing: "linear" });
    animation.pause();
    animation.currentTime = phase * duration;
    animationRef.current = animation;
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [durationSeconds, phase]);

  useEffect(() => {
    const effect = animationRef.current?.effect as KeyframeEffect | undefined;
    effect?.setKeyframes(keyframes);
  }, [keyframes, durationSeconds, phase]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    animation.updatePlaybackRate(speed);
    if (running) animation.play();
    else animation.pause();
  }, [running, speed, durationSeconds, phase]);

  return (
    <span ref={elementRef} hidden={!visible} data-background-particle={layer.kind} className={styles.particle}
      style={particleStyle(particle, layer)}>
      {layer.kind === "matrix" ? particle.text : null}
    </span>
  );
}
