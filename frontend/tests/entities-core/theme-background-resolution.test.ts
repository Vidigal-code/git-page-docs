import { expect, it } from "vitest";
import { resolveThemeBackground } from "@/entities/docs/lib/theme/resolve-theme-background";

it("keeps an existing theme unchanged when no background is configured", () => {
  expect(resolveThemeBackground({ theme: { id: "aurora-dark" } })).toBeUndefined();
});
it("loads a theme's explicitly configured animated background", () => {
  const result = resolveThemeBackground({ theme: {
    id: "test-space-dark",
    backgroundEffects: { enabled: true, surface: "#01051a", animation: { speed: 0.5 }, layers: [
      { id: "falling-stars", kind: "streaks", count: 7, colors: ["#c2eeff"], travel: { x: -30, y: 110 } },
    ] },
  } });
  expect(result).toMatchObject({
    enabled: true, surface: "#01051a", animation: { enabled: true, speed: 0.5 },
    layers: [{ id: "falling-stars", kind: "streaks", count: 7, colors: ["#c2eeff"], travel: { x: -30, y: 110 } }],
  });
});
it("applies global settings and then the selected theme's JSON overrides", () => {
  const result = resolveThemeBackground({
    theme: { id: "space", backgroundEffects: { enabled: true, layers: [{ id: "stars", kind: "stars" }] } },
    settings: {
      overrides: { opacity: 0.2, animation: { enabled: false, speed: 0.5 } },
      themes: { space: { opacity: 0.7, animation: { speed: 2 }, layers: [{ id: "code", kind: "matrix", count: 10 }] } },
    },
  });
  expect(result).toMatchObject({ opacity: 0.7, animation: { enabled: false, speed: 2 }, layers: [{ id: "code", kind: "matrix", count: 10 }] });
});
it("honors the global off switch even when a theme override is enabled", () => {
  expect(resolveThemeBackground({
    theme: { id: "space", backgroundEffects: { enabled: true, layers: [{ id: "stars", kind: "stars" }] } },
    settings: { enabled: false, themes: { space: { enabled: true } } },
  })).toBeUndefined();
});

it("can opt an old theme into effects entirely through site JSON", () => {
  const result = resolveThemeBackground({ theme: { id: "aurora-dark" }, settings: {
    themes: { "aurora-dark": { enabled: true, layers: [{ id: "rain", kind: "matrix", count: 4 }] } },
  } });
  expect(result?.layers).toMatchObject([{ id: "rain", kind: "matrix", count: 4 }]);
});

it("does not apply an override intended for another theme", () => {
  expect(resolveThemeBackground({ theme: { id: "aurora-light" }, settings: {
    themes: { "aurora-dark": { enabled: true, layers: [{ id: "rain", kind: "matrix" }] } },
  } })).toBeUndefined();
});

it("bounds malformed numeric input and keeps the original JSON unchanged", () => {
  const backgroundEffects = { enabled: true, opacity: 3, animation: { speed: -10 }, layers: [
    { id: "rain", kind: "matrix" as const, count: 900, duration: { min: 30, max: 2 }, rows: 100, colors: [], size: { min: -1, max: 9999 } },
  ] };
  const original = JSON.stringify(backgroundEffects);
  const result = resolveThemeBackground({ theme: { id: "matrix", backgroundEffects } });
  expect(result).toMatchObject({ opacity: 1, animation: { speed: 0.05 }, layers: [
    { count: 80, rows: 48, duration: { min: 2, max: 30 }, size: { min: 0.5, max: 800 }, colors: ["var(--primary)", "var(--secondary)"] },
  ] });
  expect(JSON.stringify(backgroundEffects)).toBe(original);
});

it("limits total work and skips duplicate, disabled and unknown layers", () => {
  const result = resolveThemeBackground({ theme: { id: "custom" }, settings: { overrides: {
    enabled: true, layers: [
      { id: "off", kind: "stars", count: 0 }, { id: "bad", kind: "unknown" },
      { id: "first", kind: "stars", count: 80 }, { id: "first", kind: "matrix", count: 80 },
      { id: "second", kind: "orbs", count: 80 }, { id: "third", kind: "waves", count: 80 },
      { id: "over-budget", kind: "grid", count: 10 },
    ],
  } } });
  expect(result?.layers.map(({ id, count }) => ({ id, count }))).toEqual([
    { id: "first", count: 80 }, { id: "second", count: 80 }, { id: "third", count: 40 },
  ]);
});

it.each([null, [], "invalid", { enabled: true, layers: [] }, { enabled: true, layers: [null] }])(
  "ignores malformed or empty background settings without breaking the theme", (overrides) => {
    expect(resolveThemeBackground({ theme: { id: "old" }, settings: { overrides } })).toBeUndefined();
  },
);