// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GuideMotionProvider, useGuideMotion } from "@/page-slices/introduction-guide/ui/motion/guide-motion-provider";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { GuideReveal } from "@/page-slices/introduction-guide/ui/motion/guide-reveal";

function GuideControls() {
  const { enabled, toggle } = useGuideMotion();
  return <button type="button" onClick={toggle} aria-pressed={!enabled}>Toggle guide effects</button>;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); });
});

it("keeps content static and visible when a visitor resumes effects under reduced motion", () => {
  render(<GuideMotionProvider><GuideControls /><GuideReveal><input aria-label="Reading note" defaultValue="Keep this note" /></GuideReveal></GuideMotionProvider>);
  const input = screen.getByRole("textbox", { name: "Reading note" });
  const control = screen.getByRole("button", { name: "Toggle guide effects" });
  fireEvent.click(control);
  fireEvent.click(control);
  expect(control.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("textbox", { name: "Reading note" })).toBe(input);
  expect(getComputedStyle(input.parentElement!).opacity).toBe("1");
  expect(getComputedStyle(input.parentElement!).transform).toBe("none");
});
it("hydrates the same control before applying the browser reduced-motion preference", async () => {
  const view = <GuideMotionProvider><GuideControls /></GuideMotionProvider>;
  const container = document.createElement("div");
  container.innerHTML = renderToString(view);
  document.body.append(container);
  const serverControl = container.querySelector("button");
  expect(serverControl?.getAttribute("aria-pressed")).toBe("false");
  const onRecoverableError = vi.fn();
  let root: Root | undefined;
  try {
    await act(async () => { root = hydrateRoot(container, view, { onRecoverableError }); });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("button")).toBe(serverControl);
    expect(serverControl?.getAttribute("aria-pressed")).toBe("true");
  } finally {
    await act(async () => { root?.unmount(); });
    container.remove();
  }
});
