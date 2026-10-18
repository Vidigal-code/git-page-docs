import { useEffect, useRef } from "react";
import { animate, useMotionValue, type AnimationPlaybackControlsWithThen } from "motion/react";

interface ProgressOptions {
  phase: number;
  duration: number;
  speed: number;
  running: boolean;
}

export function useParticleProgress({ phase, duration, speed, running }: ProgressOptions) {
  const progress = useMotionValue(phase);
  const playback = useRef<AnimationPlaybackControlsWithThen | null>(null);

  useEffect(() => {
    const controls = animate(progress, [phase, phase + 1], {
      duration: duration / speed, repeat: Infinity, ease: "linear", autoplay: false,
    });
    playback.current = controls;
    return () => {
      controls.stop();
      playback.current = null;
    };
  }, [progress, phase, duration, speed]);

  useEffect(() => {
    if (running) playback.current?.play();
    else playback.current?.pause();
  }, [running, phase, duration, speed]);

  return progress;
}
