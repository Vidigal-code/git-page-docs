import { describe, expect, it, vi } from "vitest";
import { getEmbedUrl } from "@/entities/docs/lib/video/embed-url";

// Providers that are not flagged as audio embeds fall through to getEmbedUrl's
// own provider switch. Narrow the audio set so that path is exercised.
vi.mock("@/shared/lib/media-types", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/media-types")>();
  return { ...actual, isAudioEmbed: (type: string) => type === "youtube" };
});

describe("getEmbedUrl provider switch", () => {
  it("builds X/Twitter embeds from a status url or a raw id", () => {
    expect(getEmbedUrl("x", "https://x.com/user/status/123", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=123");
    expect(getEmbedUrl("twitter", "https://twitter.com/user/status/456", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=456");
    expect(getEmbedUrl("twitter", "789", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=789");
  });

  it("builds TikTok embeds from a video url or a raw id", () => {
    expect(getEmbedUrl("tiktok", "https://www.tiktok.com/@u.s-r/video/7000", "en")).toBe("https://www.tiktok.com/embed/v2/7000");
    expect(getEmbedUrl("tiktok", "7001", "en")).toBe("https://www.tiktok.com/embed/v2/7001");
  });

  it("builds LinkedIn embeds unless the path is already absolute", () => {
    const absolute = "https://www.linkedin.com/embed/feed/update/urn:li:share:1";
    expect(getEmbedUrl("linkedin", absolute, "en")).toBe(absolute);
    expect(getEmbedUrl("linkedin", "feed/update/urn:li:share:1", "en")).toBe(absolute);
  });

  it("builds Instagram embeds from a post url or a raw code", () => {
    expect(getEmbedUrl("instagram", "https://www.instagram.com/p/AbC_1-x/", "en")).toBe("https://www.instagram.com/p/AbC_1-x/embed");
    expect(getEmbedUrl("instagram", "AbC", "en")).toBe("https://www.instagram.com/p/AbC/embed");
  });

  it("still delegates providers that remain audio embeds", () => {
    expect(getEmbedUrl("youtube", "https://youtu.be/dQw4w9WgXcQ", "en")).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });
});
