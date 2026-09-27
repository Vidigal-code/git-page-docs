import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getAudioSrc,
  getEmbedUrlWithAutoplay,
  getEmbedUrlWithPlaybackParams,
  isEmbedTrack,
  isNativePlayableTrack,
} from "@/features/audio-player/model/get-audio-src";
import { getDisplaySourceLabel } from "@/features/audio-player/lib/get-display-source-label";
import type { AudioTrackConfig } from "@/entities/docs";

const BASE_PATH_ENV = "NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH";
const originalBasePath = process.env[BASE_PATH_ENV];
const YOUTUBE_EMBED = "https://www.youtube.com/embed/dQw4w9WgXcQ";

function track(overrides: Partial<AudioTrackConfig> = {}): AudioTrackConfig {
  return { url: "audio/theme.mp3", type: "mp3", ...overrides };
}

beforeEach(() => {
  delete process.env[BASE_PATH_ENV];
});

afterEach(() => {
  if (originalBasePath === undefined) delete process.env[BASE_PATH_ENV];
  else process.env[BASE_PATH_ENV] = originalBasePath;
});

describe("track type predicates", () => {
  it("recognises native audio and video-as-audio formats case-insensitively", () => {
    expect(isNativePlayableTrack("MP3")).toBe(true);
    expect(isNativePlayableTrack("webm")).toBe(true);
    expect(isNativePlayableTrack("youtube")).toBe(false);
    expect(isNativePlayableTrack("pdf")).toBe(false);
  });

  it("recognises embed providers", () => {
    expect(isEmbedTrack("YouTube")).toBe(true);
    expect(isEmbedTrack("spotify")).toBe(true);
    expect(isEmbedTrack("mp3")).toBe(false);
  });
});

describe("getAudioSrc", () => {
  it("returns absolute native URLs untouched", () => {
    expect(getAudioSrc(track({ url: "https://cdn.example.com/a.mp3" }), "en")).toBe("https://cdn.example.com/a.mp3");
    expect(getAudioSrc(track({ url: "//cdn.example.com/a.mp3" }), "en")).toBe("//cdn.example.com/a.mp3");
  });

  it("roots relative native URLs at the site root without a base path", () => {
    expect(getAudioSrc(track({ url: "audio/theme.mp3" }), "en")).toBe("/audio/theme.mp3");
    expect(getAudioSrc(track({ url: "/audio/theme.mp3" }), "en")).toBe("/audio/theme.mp3");
  });

  it("prefixes relative native URLs with the configured base path", () => {
    process.env[BASE_PATH_ENV] = "/git-page-docs";
    expect(getAudioSrc(track({ url: " audio/theme.mp3 " }), "en")).toBe("/git-page-docs/audio/theme.mp3");
    expect(getAudioSrc(track({ url: "/audio/theme.mp3", type: "MP4" }), "en")).toBe("/git-page-docs/audio/theme.mp3");
  });

  it("resolves embed providers to their iframe URL", () => {
    expect(getAudioSrc(track({ type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }), "en")).toBe(YOUTUBE_EMBED);
    expect(getAudioSrc(track({ type: "youtube", url: "dQw4w9WgXcQ" }), "pt")).toBe(YOUTUBE_EMBED);
  });

  it("passes unknown types through and tolerates a missing URL", () => {
    expect(getAudioSrc(track({ type: "pdf", url: "docs/file.pdf" }), "en")).toBe("docs/file.pdf");
    expect(getAudioSrc(track({ url: undefined as unknown as string, type: "pdf" }), "en")).toBe("");
  });
});

describe("getEmbedUrlWithPlaybackParams", () => {
  it("returns the URL untouched without playback flags", () => {
    expect(getEmbedUrlWithPlaybackParams(YOUTUBE_EMBED, { autoplay: false })).toBe(YOUTUBE_EMBED);
    expect(getEmbedUrlWithPlaybackParams(YOUTUBE_EMBED, { autoplay: false, loop: false })).toBe(YOUTUBE_EMBED);
  });

  it("appends autoplay using the right separator", () => {
    expect(getEmbedUrlWithPlaybackParams(YOUTUBE_EMBED, { autoplay: true })).toBe(`${YOUTUBE_EMBED}?autoplay=1`);
    expect(getEmbedUrlWithPlaybackParams(`${YOUTUBE_EMBED}?rel=0`, { autoplay: true })).toBe(`${YOUTUBE_EMBED}?rel=0&autoplay=1`);
  });

  it("loops YouTube through a single-video playlist and other providers with loop=1", () => {
    expect(getEmbedUrlWithPlaybackParams(YOUTUBE_EMBED, { autoplay: false, loop: true })).toBe(
      `${YOUTUBE_EMBED}?loop=1&playlist=dQw4w9WgXcQ`,
    );
    expect(getEmbedUrlWithPlaybackParams(YOUTUBE_EMBED, { autoplay: true, loop: true })).toBe(
      `${YOUTUBE_EMBED}?autoplay=1&loop=1&playlist=dQw4w9WgXcQ`,
    );
    expect(getEmbedUrlWithPlaybackParams("https://player.vimeo.com/video/123", { autoplay: false, loop: true })).toBe(
      "https://player.vimeo.com/video/123?loop=1",
    );
  });

  it("exposes the autoplay-only shorthand", () => {
    expect(getEmbedUrlWithAutoplay(YOUTUBE_EMBED, false)).toBe(YOUTUBE_EMBED);
    expect(getEmbedUrlWithAutoplay(YOUTUBE_EMBED, true)).toBe(`${YOUTUBE_EMBED}?autoplay=1`);
  });
});

describe("getDisplaySourceLabel", () => {
  const base = { language: "pt", hideSource: false };

  it("hides the source entirely when asked", () => {
    expect(getDisplaySourceLabel({ ...base, track: track(), hideSource: true, customLabel: { pt: "x" } })).toBeNull();
  });

  it("prefers a non-blank custom label for the language", () => {
    expect(getDisplaySourceLabel({ ...base, track: track(), customLabel: { pt: "  Arquivo  " } })).toBe("Arquivo");
    expect(getDisplaySourceLabel({ ...base, track: track(), customLabel: { pt: "   ", en: "File" } })).toBe("theme.mp3");
  });

  it("then uses the track's own label, falling back to English", () => {
    expect(getDisplaySourceLabel({ ...base, track: track({ sourceLabel: { pt: " Trilha " } }) })).toBe("Trilha");
    expect(getDisplaySourceLabel({ ...base, track: track({ sourceLabel: { en: "Track" } }) })).toBe("Track");
    expect(getDisplaySourceLabel({ ...base, track: track({ sourceLabel: { pt: "  " } }) })).toBe("theme.mp3");
  });

  it("names embed platforms", () => {
    expect(getDisplaySourceLabel({ ...base, track: track({ type: "youtube", url: "https://youtu.be/x" }) })).toBe("YouTube");
    expect(getDisplaySourceLabel({ ...base, track: track({ type: "TWITTER", url: "https://x.com/p/1" }) })).toBe("X");
    expect(getDisplaySourceLabel({ ...base, track: track({ type: "tiktok", url: "1" }) })).toBe("TikTok");
  });

  it("derives a file name from the URL for native tracks", () => {
    expect(getDisplaySourceLabel({ ...base, track: track({ url: "https://cdn.example.com/a/b/theme.mp3?v=2" }) })).toBe("theme.mp3");
    expect(getDisplaySourceLabel({ ...base, track: track({ url: "//cdn.example.com/theme.mp3" }) })).toBe("theme.mp3");
    expect(getDisplaySourceLabel({ ...base, track: track({ url: "audio/nested/theme.mp3" }) })).toBe("theme.mp3");
    expect(getDisplaySourceLabel({ ...base, track: track({ url: "theme.mp3" }) })).toBe("theme.mp3");
    expect(getDisplaySourceLabel({ ...base, track: track({ url: "https://cdn.example.com/" }) })).toBe("https://cdn.example.com/");
    expect(getDisplaySourceLabel({ ...base, track: track({ url: "" }) })).toBe("");
  });
});
