import type { CSSProperties } from "react";
import type { ResolvedThemeBackgroundLayer } from "@/entities/docs";
import type { BackgroundParticle } from "./particles";

const KEYFRAME_SEGMENTS = 128;

export function particleStyle(particle: BackgroundParticle, layer: ResolvedThemeBackgroundLayer): CSSProperties {
  const { size, color } = particle;
  const shapes: Record<ResolvedThemeBackgroundLayer["kind"], CSSProperties> = {
    stars: { backgroundColor: color, borderRadius: "50%" },
    streaks: {
      height: layer.length, borderRadius: size,
      backgroundImage: `linear-gradient(0deg, ${color}, transparent)`,
    },
    matrix: { height: "auto", fontSize: size, lineHeight: 1.2, whiteSpace: "pre", fontFamily: "monospace" },
    orbs: { borderRadius: "50%", backgroundImage: `radial-gradient(circle, ${color}, transparent 70%)` },
    grid: {
      width: "200vw", height: "200vh", marginLeft: "-100vw", marginTop: "-100vh",
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    },
    waves: { height: size / 2, borderRadius: "50%", border: `2px solid ${color}` },
  };
  return {
    left: `${particle.x}%`, top: `${particle.y}%`, width: size, height: size, color,
    filter: `blur(${layer.blur}px) drop-shadow(0 0 ${layer.glow}px ${color})`,
    ...shapes[layer.kind],
    ...particleFrame(particle.phase, layer),
  };
}

function particleFrame(progress: number, layer: ResolvedThemeBackgroundLayer): { transform: string; opacity: number } {
  const oscillating = layer.kind === "orbs" || layer.kind === "grid" || layer.kind === "waves";
  const travel = oscillating ? Math.sin(progress * Math.PI * 2) / 2 : progress - 0.5;
  return {
    transform: `translate(${travel * layer.travel.x}vw, ${travel * layer.travel.y}vh) rotate(${layer.rotation}deg)`,
    opacity: layer.opacity * Math.sin(progress * Math.PI) ** 2,
  };
}

export function particleKeyframes(layer: ResolvedThemeBackgroundLayer): Keyframe[] {
  return Array.from({ length: KEYFRAME_SEGMENTS + 1 }, (_, index) => {
    const offset = index / KEYFRAME_SEGMENTS;
    return { offset, ...particleFrame(offset, layer) };
  });
}
