import { describe, expect, it, vi } from "vitest";
import { createPlaybackArbiter } from "@/features/audio-player/model/playback-arbiter";

describe("createPlaybackArbiter", () => {
  it("pauses every registered player except the claimant", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    const routeAudioPause = vi.fn();
    arbiter.register({ id: "radio", pause: radioPause });
    arbiter.register({ id: "route-audio", pause: routeAudioPause });

    arbiter.claim("route-audio");

    expect(radioPause).toHaveBeenCalledTimes(1);
    expect(routeAudioPause).not.toHaveBeenCalled();
  });

  it("lets the other side reclaim playback afterwards", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    const routeAudioPause = vi.fn();
    arbiter.register({ id: "radio", pause: radioPause });
    arbiter.register({ id: "route-audio", pause: routeAudioPause });

    arbiter.claim("route-audio");
    arbiter.claim("radio");

    expect(radioPause).toHaveBeenCalledTimes(1);
    expect(routeAudioPause).toHaveBeenCalledTimes(1);
  });

  it("stops pausing a player once it unregisters", () => {
    const arbiter = createPlaybackArbiter();
    const radioPause = vi.fn();
    const unregister = arbiter.register({ id: "radio", pause: radioPause });

    unregister();
    arbiter.claim("route-audio");

    expect(radioPause).not.toHaveBeenCalled();
  });

  it("keeps a re-registered player when a stale unregister runs late", () => {
    const arbiter = createPlaybackArbiter();
    const stalePause = vi.fn();
    const freshPause = vi.fn();
    const unregisterStale = arbiter.register({ id: "radio", pause: stalePause });
    arbiter.register({ id: "radio", pause: freshPause });

    unregisterStale();
    arbiter.claim("route-audio");

    expect(freshPause).toHaveBeenCalledTimes(1);
    expect(stalePause).not.toHaveBeenCalled();
  });

  it("is a no-op with a single player or no players", () => {
    const arbiter = createPlaybackArbiter();
    expect(() => arbiter.claim("radio")).not.toThrow();

    const onlyPause = vi.fn();
    arbiter.register({ id: "radio", pause: onlyPause });
    arbiter.claim("radio");
    expect(onlyPause).not.toHaveBeenCalled();
  });
});
