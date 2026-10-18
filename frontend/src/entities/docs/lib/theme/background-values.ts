import type { BackgroundRange, BackgroundVector } from "../../model/types/theme-background";

interface NumberBounds {
  min: number;
  max: number;
  fallback: number;
}

const MAX_TEXT_LENGTH = 2048;

export function backgroundRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function backgroundNumber(value: unknown, bounds: NumberBounds): number {
  const finiteValue = typeof value === "number" && Number.isFinite(value) ? value : bounds.fallback;
  return Math.min(bounds.max, Math.max(bounds.min, finiteValue));
}

export function backgroundText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, MAX_TEXT_LENGTH)
    : fallback;
}

export function backgroundRange(value: unknown, defaults: BackgroundRange, bounds: BackgroundRange): BackgroundRange {
  const record = backgroundRecord(value);
  const first = backgroundNumber(record.min, { ...bounds, fallback: defaults.min });
  const second = backgroundNumber(record.max, { ...bounds, fallback: defaults.max });
  return { min: Math.min(first, second), max: Math.max(first, second) };
}

export function backgroundVector(value: unknown, defaults: BackgroundVector, bounds: BackgroundRange): BackgroundVector {
  const record = backgroundRecord(value);
  return {
    x: backgroundNumber(record.x, { ...bounds, fallback: defaults.x }),
    y: backgroundNumber(record.y, { ...bounds, fallback: defaults.y }),
  };
}
