import { describe, expect, it } from "vitest";
import { getEmbedUrl, isNativeAudio, isNativeVideo } from "@/entities/docs/lib/video/embed-url";

describe("getEmbedUrl", () => {
  it("returns native video and audio paths untouched, whatever the type casing", () => {
    expect(getEmbedUrl("mp4", "videos/a.mp4", "en")).toBe("videos/a.mp4");
    expect(getEmbedUrl("MP3", "audio/a.mp3", "en")).toBe("audio/a.mp3");
  });

  it("delegates audio-capable providers to the embed resolvers", () => {
    expect(getEmbedUrl("youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "en")).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(getEmbedUrl("X", "https://x.com/u/status/1", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=1");
    expect(getEmbedUrl("Spotify", "https://open.spotify.com/album/abc", "en")).toBe("https://open.spotify.com/embed/album/abc");
  });

  it("returns the path untouched for unknown providers", () => {
    expect(getEmbedUrl("unknown", "https://example.com/v", "en")).toBe("https://example.com/v");
  });

  it("re-exports the native media predicates", () => {
    expect(isNativeVideo("webm")).toBe(true);
    expect(isNativeAudio("flac")).toBe(true);
    expect(isNativeAudio("youtube")).toBe(false);
  });
});
