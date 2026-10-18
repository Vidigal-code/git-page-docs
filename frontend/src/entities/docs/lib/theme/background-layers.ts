import type { ResolvedThemeBackgroundLayer, ThemeBackgroundKind } from "../../model/types/theme-background";
import { backgroundNumber, backgroundRange, backgroundRecord, backgroundText, backgroundVector } from "./background-values";

const KINDS: ReadonlySet<string> = new Set(["stars", "streaks", "matrix", "orbs", "grid", "waves"]);
const MAX_LAYERS = 8;
const MAX_ELEMENTS = 200;
const MAX_COLORS = 8;
const DEFAULT_COLORS = ["var(--primary)", "var(--secondary)"];
const DEFAULT_CHARACTERS = "01アイウエオカキクケコサシスセソ";
const SIZE_DEFAULTS = { min: 1, max: 3 };
const SIZE_BOUNDS = { min: 0.5, max: 800 };
const DURATION_DEFAULTS = { min: 10, max: 24 };
const DURATION_BOUNDS = { min: 2, max: 120 };
const TRAVEL_DEFAULTS = { x: 0, y: 110 };
const TRAVEL_BOUNDS = { min: -200, max: 200 };
const POSITION_DEFAULTS = { x: 0, y: 0 };
const POSITION_BOUNDS = { min: -100, max: 100 };
const NUMBER_BOUNDS = {
  count: { min: 0, max: 80, fallback: 24 },
  opacity: { min: 0, max: 1, fallback: 0.5 },
  blur: { min: 0, max: 80, fallback: 0 },
  glow: { min: 0, max: 80, fallback: 4 },
  rotation: { min: -360, max: 360, fallback: 0 },
  depth: { min: 0, max: 2, fallback: 1 },
  length: { min: 1, max: 500, fallback: 80 },
  rows: { min: 1, max: 48, fallback: 12 },
  seed: { min: 0, max: 2147483647, fallback: 1 },
};

function isBackgroundKind(value: unknown): value is ThemeBackgroundKind {
  return typeof value === "string" && KINDS.has(value);
}

function resolveColors(value: unknown): string[] {
  if (!Array.isArray(value)) return [...DEFAULT_COLORS];
  const colors = value.map((color) => backgroundText(color, "")).filter(Boolean).slice(0, MAX_COLORS);
  return colors.length ? colors : [...DEFAULT_COLORS];
}

function resolveLayer(value: unknown): ResolvedThemeBackgroundLayer | undefined {
  const layer = backgroundRecord(value);
  const id = backgroundText(layer.id, "");
  if (!id || !isBackgroundKind(layer.kind)) return undefined;
  return {
    id,
    kind: layer.kind,
    count: Math.floor(backgroundNumber(layer.count, NUMBER_BOUNDS.count)),
    colors: resolveColors(layer.colors),
    opacity: backgroundNumber(layer.opacity, NUMBER_BOUNDS.opacity),
    size: backgroundRange(layer.size, SIZE_DEFAULTS, SIZE_BOUNDS),
    duration: backgroundRange(layer.duration, DURATION_DEFAULTS, DURATION_BOUNDS),
    travel: backgroundVector(layer.travel, TRAVEL_DEFAULTS, TRAVEL_BOUNDS),
    blur: backgroundNumber(layer.blur, NUMBER_BOUNDS.blur),
    glow: backgroundNumber(layer.glow, NUMBER_BOUNDS.glow),
    rotation: backgroundNumber(layer.rotation, NUMBER_BOUNDS.rotation),
    depth: backgroundNumber(layer.depth, NUMBER_BOUNDS.depth),
    length: backgroundNumber(layer.length, NUMBER_BOUNDS.length),
    characters: backgroundText(layer.characters, DEFAULT_CHARACTERS),
    rows: Math.floor(backgroundNumber(layer.rows, NUMBER_BOUNDS.rows)),
    seed: Math.floor(backgroundNumber(layer.seed, NUMBER_BOUNDS.seed)),
    position: backgroundVector(layer.position, POSITION_DEFAULTS, POSITION_BOUNDS),
  };
}

export function resolveBackgroundLayers(value: unknown): ResolvedThemeBackgroundLayer[] {
  if (!Array.isArray(value)) return [];
  const layers: ResolvedThemeBackgroundLayer[] = [];
  const ids = new Set<string>();
  let remaining = MAX_ELEMENTS;
  for (const entry of value.slice(0, MAX_LAYERS)) {
    const layer = resolveLayer(entry);
    if (!layer || ids.has(layer.id) || layer.count === 0 || remaining === 0) continue;
    layer.count = Math.min(layer.count, remaining);
    remaining -= layer.count;
    ids.add(layer.id);
    layers.push(layer);
  }
  return layers;
}
