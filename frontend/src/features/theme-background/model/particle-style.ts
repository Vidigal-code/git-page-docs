import type { CSSProperties } from "react";
import type { ResolvedThemeBackgroundLayer } from "@/entities/docs";
import type { BackgroundParticle } from "./particles";

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
  };
}

export function particleTravel(value: number, kind: ResolvedThemeBackgroundLayer["kind"]): number {
  if (kind === "orbs" || kind === "grid" || kind === "waves") return Math.sin(value * Math.PI * 2) / 2;
  return (value % 1) - 0.5;
}
