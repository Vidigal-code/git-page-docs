export function allocateParticleBudget(maximums: readonly number[], budget: number): number[] {
  const counts = maximums.map(maximum => Math.min(1, maximum));
  let remaining = budget - counts.reduce((total, count) => total + count, 0);
  while (remaining > 0) {
    let selected = -1;
    let priority = 0;
    maximums.forEach((maximum, index) => {
      if (counts[index] >= maximum) return;
      const candidate = maximum / (counts[index] + 1);
      if (candidate > priority) {
        selected = index;
        priority = candidate;
      }
    });
    if (selected < 0) break;
    counts[selected]++;
    remaining--;
  }
  return counts;
}
