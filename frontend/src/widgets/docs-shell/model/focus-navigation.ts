export type FocusNavigationTarget = "first" | "previous" | "next" | "last";

interface FocusNavigationPosition {
  target: FocusNavigationTarget;
  currentIndex: number;
  count: number;
}

export function resolveFocusNavigationIndex({ target, currentIndex, count }: FocusNavigationPosition): number {
  if (currentIndex < 0 || count === 0) return -1;
  const positions: Record<FocusNavigationTarget, number> = {
    first: 0,
    previous: currentIndex - 1,
    next: currentIndex + 1,
    last: count - 1,
  };
  return Math.max(0, Math.min(count - 1, positions[target]));
}
