import { describe, it, expect } from "vitest";
import { resolveVideoProvider, withVideoPlaybackParams, isVideoExclusive } from "@/features/video-playback";

describe("resolveVideoProvider", () => {
  it("maps route video types to the playback provider that can be controlled", () => {
    expect(resolveVideoProvider("youtube")).toBe("youtube");
    expect(resolveVideoProvider("Vimeo")).toBe("vimeo");
    expect(resolveVideoProvider("mp4")).toBe("native");
    expect(resolveVideoProvider("mp3")).toBe("native");
    expect(resolveVideoProvider("tiktok")).toBe("iframe");
  });
});

describe("withVideoPlaybackParams", () => {
  const origin = "https://vidigal-code.github.io";

  it("enables the YouTube IFrame API with the page origin", () => {
    const url = withVideoPlaybackParams("https://www.youtube.com/embed/r8jQ9hVA2qs", { provider: "youtube", muted: false, origin });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("enablejsapi")).toBe("1");
    expect(parsed.searchParams.get("origin")).toBe(origin);
    expect(parsed.searchParams.has("mute")).toBe(false);
  });

  it("mutes a YouTube or Vimeo video that only shows the picture", () => {
    expect(new URL(withVideoPlaybackParams("https://www.youtube.com/embed/x?rel=0", { provider: "youtube", muted: true, origin })).searchParams.get("mute")).toBe("1");
    const vimeo = new URL(withVideoPlaybackParams("https://player.vimeo.com/video/1", { provider: "vimeo", muted: true, origin }));
    expect(vimeo.searchParams.get("muted")).toBe("1");
    expect(vimeo.searchParams.get("api")).toBe("1");
  });

  it("leaves other embeds and unparsable urls untouched", () => {
    expect(withVideoPlaybackParams("https://www.tiktok.com/embed/v2/1", { provider: "iframe", muted: false, origin })).toBe("https://www.tiktok.com/embed/v2/1");
    expect(withVideoPlaybackParams("not a url", { provider: "youtube", muted: false, origin })).toBe("not a url");
  });
});

describe("isVideoExclusive", () => {
  it("is on by default, off when the site disables it or the route video is muted", () => {
    expect(isVideoExclusive({ siteExclusive: undefined, muted: undefined })).toBe(true);
    expect(isVideoExclusive({ siteExclusive: true, muted: false })).toBe(true);
    expect(isVideoExclusive({ siteExclusive: false, muted: false })).toBe(false);
    expect(isVideoExclusive({ siteExclusive: true, muted: true })).toBe(false);
  });
});
