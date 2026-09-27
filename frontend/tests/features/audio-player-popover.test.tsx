// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// jsdom parses its default stylesheet on the first getComputedStyle / role query,
// which takes seconds when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 });
import { AudioPlayerPopover } from "@/features/audio-player/ui/audio-player-popover";
import type { AudioTrackConfig } from "@/entities/docs";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="icon-image" />,
}));

vi.mock("@/shared/ui/react-icon-by-tag", () => ({
  ReactIconByTag: ({ tag }: { tag?: string }) => <i data-testid="react-icon" data-tag={tag ?? ""} />,
}));

const THEME: AudioTrackConfig = {
  url: "https://cdn.example.com/audio/theme.mp3?v=2",
  type: "mp3",
  title: { en: "Theme", pt: "Tema" } as AudioTrackConfig["title"],
};
const OUTRO: AudioTrackConfig = { url: "audio/outro.mp3", type: "mp3" };

type Props = Parameters<typeof AudioPlayerPopover>[0];

function renderPopover(overrides: Partial<Props> = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onClose: vi.fn(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onRestart: vi.fn(),
    onToggleLoop: vi.fn(),
  };
  const utils = render(
    <AudioPlayerPopover
      isOpen
      tracks={[THEME, OUTRO]}
      language="pt"
      currentTrack={THEME}
      playing={false}
      loopEnabled={false}
      title="Background audio"
      description="Pick a track"
      closeLabel="Close"
      nowPlayingLabel="Now playing"
      restartLabel="Restart"
      loopOnLabel="Loop on"
      loopOffLabel="Loop off"
      sourceLabel="Source"
      playLabel="Play"
      pauseLabel="Pause"
      formattedTime="0:42"
      formattedDuration="3:10"
      isNativeTrack
      cardClassName="card"
      {...handlers}
      {...overrides}
    />,
  );
  return { ...utils, ...handlers };
}

afterEach(() => {
  cleanup();
});

describe("AudioPlayerPopover", () => {
  it("renders nothing when closed or without tracks", () => {
    const closed = renderPopover({ isOpen: false });
    expect(closed.container.innerHTML).toBe("");
    expect(screen.queryByRole("dialog")).toBeNull();
    const empty = renderPopover({ tracks: [] });
    expect(empty.container.innerHTML).toBe("");
  });

  it("renders an open native dialog in a body portal with the now-playing details", () => {
    const { container } = renderPopover();
    const dialog = screen.getByRole("dialog", { name: "Background audio" });
    expect(dialog.tagName).toBe("DIALOG");
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(dialog.className).toContain("card");
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);

    expect(within(dialog).getByText("Now playing")).toBeTruthy();
    // Localized title in the now-playing block and again as the list option.
    expect(within(dialog).getAllByText("Tema")).toHaveLength(2);
    expect(within(dialog).getByText("Source: theme.mp3")).toBeTruthy();
    expect(within(dialog).getByText("0:42 / 3:10")).toBeTruthy();
    expect(within(dialog).getByText("Pick a track")).toBeTruthy();
  });

  it("hides the source line and the timer when asked", () => {
    renderPopover({ hideSource: true, showMinutes: false, description: "" });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByText(/Source:/)).toBeNull();
    expect(within(dialog).queryByText("0:42 / 3:10")).toBeNull();
    expect(within(dialog).queryByText("Pick a track")).toBeNull();
  });

  it("lists tracks with localized labels, marks the current one and reports selections", () => {
    const { onSelect, onClose } = renderPopover();
    const options = screen.getAllByTestId("audio-track-option");
    expect(options.map((option) => option.textContent)).toEqual(["Tema", "audio/outro.mp3"]);
    expect(options[0].style.border).toContain("var(--secondary)");
    expect(options[1].style.border).toContain("var(--card-border)");

    fireEvent.click(options[1]);
    expect(onSelect).toHaveBeenCalledWith(1);

    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("wires the transport controls and mirrors playback state in their labels", () => {
    const { onPlay, onPause, onRestart, onToggleLoop, rerender } = renderPopover();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Play" }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dialog).getByRole("button", { name: "Restart" }));
    expect(onRestart).toHaveBeenCalledTimes(1);

    const loop = within(dialog).getByRole("button", { name: "Loop on" });
    expect(loop.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(loop);
    expect(onToggleLoop).toHaveBeenCalledTimes(1);

    rerender(
      <AudioPlayerPopover
        isOpen
        tracks={[THEME]}
        language="en"
        currentTrack={THEME}
        playing
        loopEnabled
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onPlay={onPlay}
        onPause={onPause}
        onRestart={onRestart}
        onToggleLoop={onToggleLoop}
        title="Background audio"
        description=""
        closeLabel="Close"
        nowPlayingLabel="Now playing"
        restartLabel="Restart"
        loopOnLabel="Loop on"
        loopOffLabel="Loop off"
        sourceLabel="Source"
        playLabel="Play"
        pauseLabel="Pause"
        statusPausedLabel="Pause playback"
        statusLoopOffLabel="Stop looping"
      />,
    );
    const updated = screen.getByRole("dialog");
    fireEvent.click(within(updated).getByRole("button", { name: "Pause playback" }));
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(within(updated).getByRole("button", { name: "Stop looping" }).getAttribute("aria-pressed")).toBe("true");
    expect(within(updated).getAllByText("Theme")).toHaveLength(2);
  });

  it("wraps the overlay in the theme variables when provided", () => {
    renderPopover({ themeVarsStyle: { "--primary": "#123456" } as React.CSSProperties });
    const dialog = screen.getByRole("dialog");
    const wrapper = dialog.parentElement?.parentElement as HTMLElement;
    expect(wrapper.style.getPropertyValue("--primary")).toBe("#123456");
  });
});
