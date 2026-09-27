// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import {
  EMPTY_CAPTIONS_PATH,
  getAudioRouteCaptions,
  resolveCaptionsSrc,
  resolveCaptionsTrackProps,
} from "@/widgets/docs-shell/ui/content-type-containers/captions-track";
import { VideoContainer } from "@/widgets/docs-shell/ui/content-type-containers/video-container";
import { AudioRouteControls } from "@/widgets/docs-shell/ui/content-type-containers/audio-route-controls";

vi.mock("next/image", () => ({
  default: ({ unoptimized: _unoptimized, ...props }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => (
    <img alt="" {...props} />
  ),
}));

const routeControls = {
  playLabel: "Play",
  pauseLabel: "Pause",
  restartLabel: "Restart",
  loopOnLabel: "Loop on",
  loopOffLabel: "Loop off",
};

function trackOf(container: HTMLElement, media: "audio" | "video"): HTMLTrackElement {
  const track = container.querySelector<HTMLTrackElement>(`${media} > track`);
  if (!track) throw new Error(`no <track> under <${media}>`);
  return track;
}

describe("captions track", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("uses the .vtt configured for the active language", () => {
    const captions = { en: "/media/intro.en.vtt", pt: "/media/intro.pt.vtt" };
    expect(resolveCaptionsSrc(captions, "pt")).toBe("/media/intro.pt.vtt");
    expect(resolveCaptionsTrackProps(captions, "pt")).toEqual({
      src: "/media/intro.pt.vtt",
      srcLang: "pt",
      label: "pt",
      default: true,
    });
  });

  it("falls back to the empty site track under the base path", () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
    const fallback = `/git-page-docs${EMPTY_CAPTIONS_PATH}`;
    expect(resolveCaptionsSrc(undefined, "en")).toBe(fallback);
    expect(resolveCaptionsSrc({ pt: "/media/intro.pt.vtt" }, "en")).toBe(fallback);
    expect(resolveCaptionsSrc({ en: "   " }, "en")).toBe(fallback);
  });

  it("serves the empty track from the site root when no base path is set", () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "");
    expect(resolveCaptionsSrc(undefined, "es")).toBe(EMPTY_CAPTIONS_PATH);
  });

  it("reads route captions only from a routes-audio config", () => {
    expect(
      getAudioRouteCaptions({ id: 1, audio: { audioType: { en: "mp3" }, pathAudio: { en: "/a.mp3" }, captions: { en: "/a.vtt" } } }),
    ).toEqual({ en: "/a.vtt" });
    expect(getAudioRouteCaptions({ id: 2, audio: { tracks: [] } })).toBeUndefined();
    expect(getAudioRouteCaptions(undefined)).toBeUndefined();
  });

  it("renders the configured captions track on a native video", () => {
    const { container } = render(
      <VideoContainer
        videoType="mp4"
        pathVideo="/media/intro.mp4"
        language="en"
        config={{
          id: 1,
          video: { videoType: { en: "mp4" }, pathVideo: { en: "/media/intro.mp4" }, captions: { en: "/media/intro.en.vtt" } },
        }}
        fullscreenCloseLabel="Close"
        fullscreenExpandLabel="Expand"
      />,
    );
    const track = trackOf(container, "video");
    expect(track.getAttribute("kind")).toBe("captions");
    expect(track.getAttribute("src")).toBe("/media/intro.en.vtt");
    expect(track.getAttribute("srclang")).toBe("en");
    expect(track.getAttribute("label")).toBe("en");
    expect(track.hasAttribute("default")).toBe(true);
  });

  it("renders the empty site track on a native audio route without captions", () => {
    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "/git-page-docs");
    const { container } = render(
      <VideoContainer
        videoType="mp3"
        pathVideo="/media/talk.mp3"
        language="pt"
        config={{ id: 3, video: { videoType: { pt: "mp3" }, pathVideo: { pt: "/media/talk.mp3" } } }}
        fullscreenCloseLabel="Close"
        fullscreenExpandLabel="Expand"
      />,
    );
    const track = trackOf(container, "audio");
    expect(track.getAttribute("kind")).toBe("captions");
    expect(track.getAttribute("src")).toBe("/git-page-docs/captions/empty.vtt");
    expect(track.getAttribute("srclang")).toBe("pt");
  });

  it("gives the route audio player a captions track for its language", () => {
    const { container, rerender } = render(
      <AudioRouteControls
        audioType="mp3"
        pathAudio="/media/talk.mp3"
        language="pt"
        controls={routeControls}
        captions={{ pt: "/media/talk.pt.vtt" }}
      />,
    );
    expect(trackOf(container, "audio").getAttribute("src")).toBe("/media/talk.pt.vtt");

    vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", "");
    rerender(<AudioRouteControls audioType="mp3" pathAudio="/media/talk.mp3" language="en" controls={routeControls} />);
    const fallback = trackOf(container, "audio");
    expect(fallback.getAttribute("kind")).toBe("captions");
    expect(fallback.getAttribute("src")).toBe(EMPTY_CAPTIONS_PATH);
    expect(fallback.getAttribute("srclang")).toBe("en");
  });
});
