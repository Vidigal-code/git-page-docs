// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPlaybackArbiter, sharedPlaybackArbiter } from "@/shared/lib/media-playback/playback-arbiter";
import { useExclusivePlayback } from "@/shared/lib/media-playback/use-exclusive-playback";

afterEach(cleanup);

describe("useExclusivePlayback", () => {
  it("pauses every other enrolled player when one claims playback", () => {
    const arbiter = createPlaybackArbiter();
    const pauseRadio = vi.fn();
    const pauseRoute = vi.fn();
    const radio = renderHook(() => useExclusivePlayback(pauseRadio, arbiter));
    const route = renderHook(() => useExclusivePlayback(pauseRoute, arbiter));

    act(() => route.result.current());
    expect(pauseRadio).toHaveBeenCalledTimes(1);
    expect(pauseRoute).not.toHaveBeenCalled();

    act(() => radio.result.current());
    expect(pauseRoute).toHaveBeenCalledTimes(1);
    expect(pauseRadio).toHaveBeenCalledTimes(1);
  });

  it("always invokes the latest pause callback after re-renders", () => {
    const arbiter = createPlaybackArbiter();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ pause }) => useExclusivePlayback(pause, arbiter), {
      initialProps: { pause: first },
    });
    const other = renderHook(() => useExclusivePlayback(vi.fn(), arbiter));

    rerender({ pause: second });
    act(() => other.result.current());

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("unenrolls on unmount and keeps a stable claim function", () => {
    const arbiter = createPlaybackArbiter();
    const pause = vi.fn();
    const { result, rerender, unmount } = renderHook(() => useExclusivePlayback(pause, arbiter));
    const claim = result.current;
    rerender();
    expect(result.current).toBe(claim);

    const other = renderHook(() => useExclusivePlayback(vi.fn(), arbiter));
    unmount();
    act(() => other.result.current());
    expect(pause).not.toHaveBeenCalled();
  });

  it("enrolls in the page-wide arbiter by default", () => {
    const pause = vi.fn();
    const { unmount } = renderHook(() => useExclusivePlayback(pause));
    sharedPlaybackArbiter.claim("someone-else");
    expect(pause).toHaveBeenCalledTimes(1);
    unmount();
    sharedPlaybackArbiter.claim("someone-else");
    expect(pause).toHaveBeenCalledTimes(1);
  });
});
