// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { useBackgroundParallax } from "@/features/theme-background/model/use-background-parallax";

const POINTER_DISTANCE = 16;
const EVENT_BURST = 20;
const config = { enabled: true, pointer: POINTER_DISTANCE, scroll: 0.08 };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("coalesces rapid pointer events into one update per frame using the latest position", () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useBackgroundParallax({ config, running: true }));
  const onChange = vi.fn();
  const unsubscribe = result.current.pointerX.on("change", onChange);
  for (let index = 1; index <= EVENT_BURST; index += 1) {
    fireEvent(window, new MouseEvent("pointermove", { clientX: window.innerWidth * index / EVENT_BURST }));
  }
  expect(onChange).not.toHaveBeenCalled();
  act(() => vi.advanceTimersToNextFrame());
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(result.current.pointerX.get()).toBe(POINTER_DISTANCE);
  unsubscribe();
});

it("cancels a pending frame when playback pauses", () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ running }) => useBackgroundParallax({ config, running }), {
    initialProps: { running: true },
  });
  fireEvent(window, new MouseEvent("pointermove", { clientX: window.innerWidth }));
  rerender({ running: false });
  act(() => vi.advanceTimersToNextFrame());
  expect(result.current.pointerX.get()).toBe(0);
  rerender({ running: true });
  fireEvent(window, new MouseEvent("pointermove", { clientX: window.innerWidth }));
  act(() => vi.advanceTimersToNextFrame());
  expect(result.current.pointerX.get()).toBe(POINTER_DISTANCE);
});

it("coalesces scroll and resize bursts and cancels pending work on unmount", () => {
  vi.useFakeTimers();
  const scroll = vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
  const { result, unmount } = renderHook(() => useBackgroundParallax({ config, running: true }));
  const onChange = vi.fn();
  const unsubscribe = result.current.scrollY.on("change", onChange);
  const scrollDistance = 100;
  scroll.mockReturnValue(scrollDistance);
  for (let index = 0; index < EVENT_BURST; index += 1) {
    fireEvent.scroll(window);
    fireEvent.resize(window);
  }
  expect(onChange).not.toHaveBeenCalled();
  act(() => vi.advanceTimersToNextFrame());
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(result.current.scrollY.get()).toBe(8);
  scroll.mockReturnValue(scrollDistance * 2);
  fireEvent.scroll(window);
  unmount();
  act(() => vi.advanceTimersToNextFrame());
  expect(onChange).toHaveBeenCalledTimes(1);
  unsubscribe();
});
