// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { resolveThemeBackground } from "@/entities/docs";
import { ThemeBackground } from "@/features/theme-background/renderer";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

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
  expect(particles.filter(particle => !particle.hidden)).toHaveLength(10);
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
