// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BackgroundAnimationControl, useThemeBackgroundPlayback } from "@/features/theme-background";
import { ThemeBackground as BackgroundRenderer } from "@/features/theme-background/renderer";
import type { ResolvedThemeBackground } from "@/entities/docs";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";

const config: ResolvedThemeBackground = {
  enabled: true, surface: "#101020", opacity: 0.8,
  animation: { enabled: false, speed: 1 },
  parallax: { enabled: false, pointer: 16, scroll: 0.08 },
  accessibility: { reducedMotion: "static", showPauseButton: true },
  layers: [{
    id: "stars", kind: "stars", count: 3, colors: ["#ffffff"], opacity: 0.5,
    size: { min: 1, max: 3 }, duration: { min: 10, max: 24 }, travel: { x: 0, y: 110 },
    blur: 0, glow: 4, rotation: 0, depth: 1, length: 80, characters: "01", rows: 12,
    seed: 1, position: { x: 0, y: 0 },
  }],
};

function ThemeBackground({ config: backgroundConfig }: Readonly<{ config: ResolvedThemeBackground }>) {
  const playback = useThemeBackgroundPlayback(backgroundConfig);
  return <>
    <BackgroundRenderer config={backgroundConfig} paused={playback.paused} />
    {playback.showControl && <BackgroundAnimationControl paused={playback.paused} onToggle={playback.toggle}
      label={playback.paused ? "Resume background animation" : "Pause background animation"} />}
  </>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("renders the configured decorative particles without exposing them to assistive technology", () => {
  render(<ThemeBackground config={config} />);
  const background = screen.getByTestId("theme-background");
  expect(background.getAttribute("aria-hidden")).toBe("true");
  expect(background.style.backgroundColor).toBe("rgb(16, 16, 32)");
  expect(background.querySelectorAll("[data-background-particle]")).toHaveLength(3);
  expect(screen.queryByRole("button")).toBeNull();
});

it("toggles playback from the accessible control", () => {
  render(<ThemeBackground config={{ ...config, animation: { enabled: true, speed: 1 } }} />);
  fireEvent.click(screen.getByRole("button", { name: "Pause background animation" }));
  const resume = screen.getByRole("button", { name: "Resume background animation" });
  expect(resume.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(resume);
  expect(screen.getByRole("button", { name: "Pause background animation" }).getAttribute("aria-pressed")).toBe("false");
});

it("renders each primitive with deterministic positions and configured matrix text", () => {
  const kinds = ["stars", "streaks", "matrix", "orbs", "grid", "waves"] as const;
  const layered = { ...config, layers: kinds.map((kind) => ({ ...config.layers[0], id: kind, kind, count: 1, characters: "A", rows: 4 })) };
  const { unmount } = render(<ThemeBackground config={layered} />);
  const background = screen.getByTestId("theme-background");
  expect(background.querySelector('[data-background-particle="matrix"]')?.textContent).toBe("A\nA\nA\nA");
  const markup = background.innerHTML;
  unmount();
  render(<ThemeBackground config={layered} />);
  expect(screen.getByTestId("theme-background").innerHTML).toBe(markup);
  expect(screen.getByTestId("theme-background").querySelectorAll("[data-background-particle]")).toHaveLength(kinds.length);
});

it("applies pointer parallax and freezes it while paused", async () => {
  render(<ThemeBackground config={{ ...config, parallax: { ...config.parallax, enabled: true } }} />);
  const layer = screen.getByTestId("theme-background").firstElementChild as HTMLElement;
  const initialTransform = layer.style.transform;
  fireEvent(window, new MouseEvent("pointermove", { clientX: window.innerWidth, clientY: window.innerHeight }));
  await waitFor(() => expect(layer.style.transform).not.toBe(initialTransform));
  fireEvent.click(screen.getByRole("button", { name: "Pause background animation" }));
  const pausedTransform = layer.style.transform;
  fireEvent(window, new MouseEvent("pointermove", { clientX: 0, clientY: 0 }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(layer.style.transform).toBe(pausedTransform);
});

it("honors the reduced-motion control and visibility settings", () => {
  let reduced = false;
  const media = new EventTarget();
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return reduced; },
    addEventListener: media.addEventListener.bind(media),
    removeEventListener: media.removeEventListener.bind(media),
  }));
  const animated = { ...config, animation: { enabled: true, speed: 1 } };
  const { rerender } = render(<ThemeBackground config={animated} />);
  const background = screen.getByTestId("theme-background");
  act(() => { reduced = true; media.dispatchEvent(new Event("change")); });
  expect(screen.queryByRole("button")).toBeNull();
  expect(background.hidden).toBe(false);
  rerender(<ThemeBackground config={{ ...animated, accessibility: { ...config.accessibility, reducedMotion: "hide" } }} />);
  expect(background.hidden).toBe(true);
});

it("cleans up browser subscriptions and clamps long-document scroll parallax", async () => {
  const removeWindowListener = vi.spyOn(window, "removeEventListener");
  const removeDocumentListener = vi.spyOn(document, "removeEventListener");
  vi.spyOn(window, "scrollY", "get").mockReturnValue(100000);
  const { unmount } = render(<ThemeBackground config={{ ...config, animation: { enabled: true, speed: 1 }, parallax: { ...config.parallax, enabled: true } }} />);
  const layer = screen.getByTestId("theme-background").firstElementChild as HTMLElement;
  await waitFor(() => expect(layer.style.transform).toContain(`translateY(${window.innerHeight / 2}px)`));
  const particle = layer.querySelector<HTMLElement>("[data-background-particle]")!;
  unmount();
  expect(removeWindowListener.mock.calls.map(([event]) => event)).toEqual(expect.arrayContaining(["pointermove", "scroll", "resize"]));
  expect(removeDocumentListener.mock.calls.map(([event]) => event)).toContain("visibilitychange");
  const finalStyle = particle.getAttribute("style");
  fireEvent(window, new MouseEvent("pointermove", { clientX: 0, clientY: 0 }));
  await new Promise((resolve) => setTimeout(resolve, 70));
  expect(particle.getAttribute("style")).toBe(finalStyle);
});

it("hydrates deterministic server markup without a mismatch under reduced motion", async () => {
  const animated = { ...config, animation: { enabled: true, speed: 1 } };
  const markup = renderToString(<ThemeBackground config={animated} />);
  expect(renderToString(<ThemeBackground config={animated} />)).toBe(markup);
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const container = document.createElement("div");
  container.innerHTML = markup;
  document.body.append(container);
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(() => { root = hydrateRoot(container, <ThemeBackground config={animated} />, { onRecoverableError }); });
  expect(onRecoverableError).not.toHaveBeenCalled();
  expect(container.querySelector("button")).toBeNull();
  act(() => root.unmount());
  container.remove();
});

it("can hide the control while preserving the configured background surface", () => {
  const themed = { ...config, surface: "linear-gradient(red, blue)", animation: { enabled: true, speed: 1 } };
  const { rerender } = render(<ThemeBackground config={themed} />);
  expect(screen.getByTestId("theme-background").style.backgroundImage).toContain("linear-gradient");
  rerender(<ThemeBackground config={{ ...themed, accessibility: { ...themed.accessibility, showPauseButton: false } }} />);
  expect(screen.queryByRole("button")).toBeNull();
});

it("renders a controlled paused background without its own control", () => {
  render(<BackgroundRenderer config={{ ...config, animation: { enabled: true, speed: 1 } }} paused />);
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByTestId("theme-background").querySelectorAll("[data-background-particle]")).toHaveLength(3);
});

it("preserves the manual pause control while switching themes", () => {
  const animated = { ...config, animation: { enabled: true, speed: 1 } };
  const { rerender } = render(<ThemeBackground config={animated} />);
  fireEvent.click(screen.getByRole("button", { name: "Pause background animation" }));
  rerender(<ThemeBackground config={{ ...animated, surface: "#000000" }} />);
  const resume = screen.getByRole("button", { name: "Resume background animation" });
  expect(resume.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(resume);
  expect(screen.getByRole("button", { name: "Pause background animation" }).getAttribute("aria-pressed")).toBe("false");
});
