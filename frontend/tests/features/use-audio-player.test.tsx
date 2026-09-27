// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { useAudioPlayer } from "@/features/audio-player/model/use-audio-player";
import type { AudioTrackConfig } from "@/entities/docs";

type PlayerApi = ReturnType<typeof useAudioPlayer>;
type PlayerOptions = Parameters<typeof useAudioPlayer>[0];

const MP3: AudioTrackConfig = { url: "audio/theme.mp3", type: "mp3" };
const OUTRO: AudioTrackConfig = { url: "audio/outro.mp3", type: "mp3" };
const YOUTUBE: AudioTrackConfig = { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", type: "youtube" };
const PDF: AudioTrackConfig = { url: "docs/file.pdf", type: "pdf" };
const YOUTUBE_EMBED = "https://www.youtube.com/embed/dQw4w9WgXcQ";

function options(overrides: Partial<PlayerOptions> = {}): PlayerOptions {
  return {
    tracks: [MP3],
    language: "en",
    autoPlayOnLoad: false,
    loopEnabled: false,
    allowUserChoice: true,
    sequentialPlayback: false,
    ...overrides,
  };
}

/** Mounts the hook with a real <audio> bound to its ref, the way the shell does. */
function Harness({ options: opts, onApi }: Readonly<{ options: PlayerOptions; onApi: (api: PlayerApi) => void }>) {
  const api = useAudioPlayer(opts);
  onApi(api);
  return <audio ref={api.audioRef} data-testid="audio" onEnded={api.onNativeEnded} />;
}

function setDuration(audio: HTMLAudioElement, value: number): void {
  Object.defineProperty(audio, "duration", { configurable: true, value });
}

interface MountedPlayer {
  /** Always the API from the latest render (read it lazily, never destructure). */
  readonly api: PlayerApi;
  readonly audio: HTMLAudioElement;
  unmount(): void;
}

function mountPlayer(overrides: Partial<PlayerOptions> = {}): MountedPlayer {
  const opts = options(overrides);
  let latest!: PlayerApi;
  const utils = render(
    <Harness
      options={opts}
      onApi={(api) => {
        latest = api;
      }}
    />,
  );
  const audio = within(utils.container).getByTestId("audio") as HTMLAudioElement;
  Object.defineProperty(audio, "currentTime", { configurable: true, writable: true, value: 0 });
  setDuration(audio, Number.NaN);
  return {
    get api() {
      return latest;
    },
    audio,
    unmount: utils.unmount,
  };
}

let play: MockInstance<() => Promise<void>>;
let pause: MockInstance<() => void>;

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH;
  play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
  pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  cleanup();
});

describe("useAudioPlayer", () => {
  it("starts idle with a resolved native source", () => {
    const player = mountPlayer();
    expect(player.api.playing).toBe(false);
    expect(player.api.currentTrack).toBe(MP3);
    expect(player.api.currentIndex).toBe(0);
    expect(player.api.audioSrc).toBe("/audio/theme.mp3");
    expect(player.api.embedUrl).toBe("");
    expect(player.api.isNativeTrack).toBe(true);
    expect(player.api.needsPopoverForPlay).toBe(false);
    expect(player.api.popoverOpen).toBe(false);
    expect(player.api.loopEnabled).toBe(false);
    expect(player.api.formattedTime).toBe("0:00");
    expect(player.api.formattedDuration).toBe("0:00");
    expect(player.api.tracks).toEqual([MP3]);
    expect(player.api.language).toBe("en");
  });

  it("drives the media element through play, pause and togglePlay", async () => {
    const player = mountPlayer();

    await act(async () => {
      player.api.play();
    });
    expect(play).toHaveBeenCalledTimes(1);
    expect(player.api.playing).toBe(true);
    expect(player.audio.loop).toBe(false);

    act(() => player.api.pause());
    expect(pause).toHaveBeenCalledTimes(1);
    expect(player.api.playing).toBe(false);

    await act(async () => {
      player.api.togglePlay();
    });
    expect(player.api.playing).toBe(true);
    act(() => player.api.togglePlay());
    expect(player.api.playing).toBe(false);
  });

  it("applies the loop preference to the element on the next play", async () => {
    const player = mountPlayer();
    act(() => player.api.toggleLoop());
    expect(player.api.loopEnabled).toBe(true);
    await act(async () => {
      player.api.play();
    });
    expect(player.audio.loop).toBe(true);
    act(() => player.api.toggleLoop());
    expect(player.api.loopEnabled).toBe(false);
  });

  it("restart rewinds a native track and only resumes while playing", async () => {
    const player = mountPlayer();
    player.audio.currentTime = 42;
    act(() => player.api.restart());
    expect(player.audio.currentTime).toBe(0);
    expect(play).not.toHaveBeenCalled();

    await act(async () => {
      player.api.play();
    });
    player.audio.currentTime = 42;
    await act(async () => {
      player.api.restart();
    });
    expect(player.audio.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("opens the track chooser instead of playing when the user may choose", async () => {
    const player = mountPlayer({ tracks: [MP3, OUTRO] });
    expect(player.api.needsPopoverForPlay).toBe(true);

    act(() => player.api.togglePlay());
    expect(player.api.popoverOpen).toBe(true);
    expect(play).not.toHaveBeenCalled();
    act(() => player.api.togglePlay());
    expect(player.api.popoverOpen).toBe(false);
    act(() => player.api.togglePlay());
    act(() => player.api.closePopover());
    expect(player.api.popoverOpen).toBe(false);
    player.unmount();

    const fixed = mountPlayer({ tracks: [MP3, OUTRO], allowUserChoice: false });
    expect(fixed.api.needsPopoverForPlay).toBe(false);
    await act(async () => {
      fixed.api.togglePlay();
    });
    expect(play).toHaveBeenCalledTimes(1);
    expect(fixed.api.playing).toBe(true);
  });

  it("selecting a native track closes the chooser and plays it once the element re-mounts", async () => {
    const player = mountPlayer({ tracks: [MP3, OUTRO] });
    act(() => player.api.togglePlay());
    await act(async () => {
      player.api.selectTrack(1);
    });
    expect(player.api.popoverOpen).toBe(false);
    expect(player.api.currentIndex).toBe(1);
    expect(player.api.currentTrack).toBe(OUTRO);
    expect(player.api.audioSrc).toBe("/audio/outro.mp3");
    expect(play).toHaveBeenCalledTimes(1);
    expect(player.api.playing).toBe(true);
  });

  it("selecting an embed track starts it immediately without a media element", () => {
    const player = mountPlayer({ tracks: [MP3, YOUTUBE] });
    act(() => player.api.selectTrack(1));
    expect(player.api.currentTrack).toBe(YOUTUBE);
    expect(player.api.playing).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it("embed tracks toggle state and expose autoplay/loop playback params", () => {
    const player = mountPlayer({ tracks: [YOUTUBE], loopEnabled: true });
    expect(player.api.isNativeTrack).toBe(false);
    expect(player.api.formattedDuration).toBe("—:—");
    expect(player.api.audioSrc).toBe(YOUTUBE_EMBED);
    expect(player.api.embedUrl).toBe(`${YOUTUBE_EMBED}?loop=1&playlist=dQw4w9WgXcQ`);

    act(() => player.api.play());
    expect(player.api.playing).toBe(true);
    expect(play).not.toHaveBeenCalled();
    expect(player.api.embedUrl).toBe(`${YOUTUBE_EMBED}?autoplay=1&loop=1&playlist=dQw4w9WgXcQ`);

    act(() => player.api.restart());
    expect(player.api.restartKey).toBe(1);

    act(() => player.api.pause());
    expect(player.api.playing).toBe(false);
    expect(pause).not.toHaveBeenCalled();
    expect(player.api.embedUrl).not.toContain("autoplay=1");
  });

  it("ignores tracks that are neither native nor embeddable, and an empty list", () => {
    const player = mountPlayer({ tracks: [PDF] });
    act(() => player.api.play());
    expect(player.api.playing).toBe(false);
    expect(play).not.toHaveBeenCalled();
    act(() => player.api.restart());
    expect(player.api.restartKey).toBe(0);
    expect(player.api.audioSrc).toBe("docs/file.pdf");
    expect(player.api.isNativeTrack).toBe(false);
    player.unmount();

    const empty = mountPlayer({ tracks: [] });
    expect(empty.api.currentTrack).toBeNull();
    expect(empty.api.audioSrc).toBe("");
    act(() => empty.api.play());
    act(() => empty.api.restart());
    expect(empty.api.playing).toBe(false);
  });

  it("autoplays after the mount delay and cancels it on unmount", async () => {
    vi.useFakeTimers();
    const player = mountPlayer({ autoPlayOnLoad: true });
    expect(play).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(play).toHaveBeenCalledTimes(1);
    expect(player.api.playing).toBe(true);
    player.unmount();

    const early = mountPlayer({ tracks: [OUTRO], autoPlayOnLoad: true });
    early.unmount();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("advances to the next native track when sequential playback is enabled", async () => {
    const sequential = mountPlayer({ tracks: [MP3, OUTRO], sequentialPlayback: true });
    await act(async () => {
      fireEvent.ended(sequential.audio);
    });
    expect(sequential.api.currentIndex).toBe(1);
    expect(play).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.ended(sequential.audio);
    });
    expect(sequential.api.currentIndex).toBe(1);
    sequential.unmount();

    const single = mountPlayer({ tracks: [MP3, OUTRO], sequentialPlayback: false });
    await act(async () => {
      fireEvent.ended(single.audio);
    });
    expect(single.api.currentIndex).toBe(0);
  });

  it("tracks time and duration from the media element events", () => {
    const player = mountPlayer({ tracks: [MP3, YOUTUBE] });
    setDuration(player.audio, 190);
    fireEvent(player.audio, new Event("loadedmetadata"));
    expect(player.api.formattedDuration).toBe("3:10");
    expect(player.api.duration).toBe(190);

    player.audio.currentTime = 65;
    fireEvent(player.audio, new Event("timeupdate"));
    expect(player.api.formattedTime).toBe("1:05");
    expect(player.api.currentTime).toBe(65);

    setDuration(player.audio, 200);
    fireEvent(player.audio, new Event("durationchange"));
    expect(player.api.formattedDuration).toBe("3:20");
    setDuration(player.audio, Number.POSITIVE_INFINITY);
    fireEvent(player.audio, new Event("canplay"));
    expect(player.api.formattedDuration).toBe("0:00");

    act(() => player.api.selectTrack(1));
    expect(player.api.currentTime).toBe(0);
    expect(player.api.formattedTime).toBe("0:00");
    expect(player.api.formattedDuration).toBe("—:—");
  });

  it("pauses the other player when a second one claims playback", async () => {
    const radio = mountPlayer({ tracks: [MP3] });
    const route = mountPlayer({ tracks: [OUTRO] });

    await act(async () => {
      radio.api.play();
    });
    expect(radio.api.playing).toBe(true);

    await act(async () => {
      route.api.play();
    });
    expect(route.api.playing).toBe(true);
    expect(radio.api.playing).toBe(false);
    // Claiming pauses every other enrolled player, idle or not: radio paused the
    // (idle) route when it started, then route paused radio.
    expect(pause).toHaveBeenCalledTimes(2);
  });
});
