export const NARRATION_RATE = { min: 0.5, max: 2, step: 0.25, default: 1 } as const;
export const NARRATION_VOLUME = { min: 0, max: 1, step: 0.1, default: 1 } as const;

interface NumericRange { min: number; max: number; default: number }

export function normalizeNarrationSetting(value: unknown, range: NumericRange): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(range.max, Math.max(range.min, value))
    : range.default;
}
