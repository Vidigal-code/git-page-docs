import type { ResolvedThemeBackgroundLayer } from "@/entities/docs";

const RANDOM_MODULUS = 2147483647;
const RANDOM_MULTIPLIER = 48271;

export interface BackgroundParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  phase: number;
  text: string;
}

export function createParticles(layer: ResolvedThemeBackgroundLayer): BackgroundParticle[] {
  let seed = Math.abs(Math.trunc(layer.seed)) % RANDOM_MODULUS || 1;
  const random = () => {
    seed = (seed * RANDOM_MULTIPLIER) % RANDOM_MODULUS;
    return seed / RANDOM_MODULUS;
  };
  const characters: string[] = Array.from(layer.characters);
  return Array.from({ length: layer.count }, (_, index) => ({
    id: `${layer.id}-${index}`,
    x: random() * 100 + layer.position.x,
    y: random() * 100 + layer.position.y,
    size: layer.size.min + random() * (layer.size.max - layer.size.min),
    color: layer.colors[Math.floor(random() * layer.colors.length)],
    duration: layer.duration.min + random() * (layer.duration.max - layer.duration.min),
    phase: random(),
    text: Array.from({ length: layer.rows }, () => characters[Math.floor(random() * characters.length)]).join("\n"),
  }));
}
