// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { resolveThemeBackground } from "@/entities/docs";
import { ThemeBackground } from "@/features/theme-background/renderer";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); Reflect.deleteProperty(Element.prototype, "animate"); });

it("keeps automatic desktop effects within eight visible particles across all layers", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const config = resolveThemeBackground({ theme: {
    id: "solar", backgroundEffects: { enabled: true, layers: [
      { id: "streaks", kind: "streaks", count: 6 },
      { id: "orbs", kind: "orbs", count: 4 },
      { id: "stars", kind: "stars", count: 40 },
    ] },
  } });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  const background = screen.getByTestId("theme-background");
  expect(background.querySelectorAll("[data-background-particle]:not([hidden])")).toHaveLength(8);
  for (const layer of background.querySelectorAll("[data-background-layer]")) {
    expect(layer.querySelectorAll("[data-background-particle]:not([hidden])").length).toBeGreaterThanOrEqual(1);
  }
});

it.each([
  { width: 1280, budget: 8 },
  { width: 344, budget: 4 },
])("allocates native animations only for visible automatic particles at $width px", ({ width, budget }) => {
  const animate = vi.fn(() => ({
    currentTime: 0,
    pause: vi.fn(), play: vi.fn(), cancel: vi.fn(), updatePlaybackRate: vi.fn(),
    effect: { setKeyframes: vi.fn() },
  }));
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width") && width === 344, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const config = resolveThemeBackground({ theme: { id: "stars", backgroundEffects: {
    enabled: true, layers: [{ id: "stars", kind: "stars", count: 50 }],
  } } });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  expect(animate).toHaveBeenCalledTimes(budget);
});

it("keeps every layer visible with a lighter particle budget on narrow screens", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const config = resolveThemeBackground({ theme: {
    id: "comet", backgroundEffects: { enabled: true, layers: [
      { id: "streaks", kind: "streaks", count: 6 },
      { id: "stars", kind: "stars", count: 28 },
      { id: "grid", kind: "grid", count: 1 },
    ] },
  } });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  const particles = [...screen.getByTestId("theme-background").querySelectorAll<HTMLElement>("[data-background-particle]")];
  expect(particles).toHaveLength(35);
  expect(particles.filter(particle => !particle.hidden)).toHaveLength(4);
  expect(particles.find(particle => particle.dataset.backgroundParticle === "grid")?.hidden).toBe(false);
});

it("keeps particle nodes and restores the desktop budget when a foldable opens", () => {
  let compact = true;
  const viewport = new EventTarget();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return query.includes("max-width") && compact; },
    addEventListener: viewport.addEventListener.bind(viewport),
    removeEventListener: viewport.removeEventListener.bind(viewport),
  }));
  const config = resolveThemeBackground({ theme: { id: "stars", backgroundEffects: {
    enabled: true, layers: [{ id: "stars", kind: "stars", count: 8 }],
  } } });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  const particles = [...screen.getByTestId("theme-background").querySelectorAll<HTMLElement>("[data-background-particle]")];
  expect(particles.filter(particle => !particle.hidden)).toHaveLength(2);
  act(() => { compact = false; viewport.dispatchEvent(new Event("change")); });
  expect(particles.filter(particle => !particle.hidden)).toHaveLength(4);
  expect([...screen.getByTestId("theme-background").querySelectorAll("[data-background-particle]")]).toEqual(particles);
});

it.each([
  { width: 1280, visible: 4 },
  { width: 344, visible: 2 },
])("does not increase the density of an already sparse background at $width px", ({ width, visible }) => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width") && width === 344, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const config = resolveThemeBackground({ theme: { id: "reef", backgroundEffects: {
    enabled: true, layers: [
      { id: "waves", kind: "waves", count: 3 },
      { id: "orbs", kind: "orbs", count: 4 },
    ],
  } } });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  expect(screen.getByTestId("theme-background").querySelectorAll("[data-background-particle]:not([hidden])")).toHaveLength(visible);
});

it("retains one particle per layer when a compact background has more layers than its budget", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"), addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const kinds = ["stars", "streaks", "matrix", "orbs", "grid", "waves"] as const;
  const config = resolveThemeBackground({ theme: { id: "layers", backgroundEffects: {
    enabled: true, layers: kinds.map(kind => ({ id: kind, kind, count: 2 })),
  } } });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  const visible = screen.getByTestId("theme-background").querySelectorAll<HTMLElement>("[data-background-particle]:not([hidden])");
  expect([...visible].map(particle => particle.dataset.backgroundParticle)).toEqual(kinds);
});

it.each([
  { overrides: { performance: { mode: "full" } } },
  { overrides: { layers: [{ id: "custom", kind: "stars", count: 8 }] } },
  { themes: { stars: { layers: [{ id: "custom", kind: "stars", count: 8 }] } } },
])("preserves complete density for an explicit configuration: %j", settings => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"), addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  const config = resolveThemeBackground({ theme: { id: "stars", backgroundEffects: {
    enabled: true, layers: [{ id: "stars", kind: "stars", count: 8 }],
  } }, settings });
  if (!config) throw new Error("Expected background configuration");
  render(<ThemeBackground config={config} paused={false} />);
  expect(screen.getByTestId("theme-background").querySelectorAll("[data-background-particle]:not([hidden])")).toHaveLength(8);
});

it("lets a theme opt custom layers into auto over a shared full setting", () => {
  const config = resolveThemeBackground({
    theme: { id: "stars", backgroundEffects: { enabled: true, layers: [{ id: "stars", kind: "stars", count: 8 }] } },
    settings: {
      overrides: { performance: { mode: "full" }, layers: [{ id: "custom", kind: "stars", count: 8 }] },
      themes: { stars: { performance: { mode: "auto" } } },
    },
  });
  expect(config?.performance?.mode).toBe("auto");
});

it("preserves explicit layer counts even when the template selects auto", () => {
  const config = resolveThemeBackground({
    theme: { id: "stars", backgroundEffects: {
      enabled: true, performance: { mode: "auto" }, layers: [{ id: "stars", kind: "stars", count: 8 }],
    } },
    settings: { overrides: { layers: [{ id: "custom", kind: "stars", count: 8 }] } },
  });
  expect(config?.performance?.mode).toBe("full");
});
