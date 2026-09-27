import { describe, expect, it } from "vitest";
import { getEmbedResolver, registerEmbedResolver, resolveAudioEmbedUrl } from "@/entities/docs/lib/embed";
import { resolveBandcampEmbed } from "@/entities/docs/lib/embed/resolvers/bandcamp-resolver";
import { resolveDeezerEmbed } from "@/entities/docs/lib/embed/resolvers/deezer-resolver";
import { resolveInstagramEmbed } from "@/entities/docs/lib/embed/resolvers/instagram-resolver";
import { resolveLinkedInEmbed } from "@/entities/docs/lib/embed/resolvers/linkedin-resolver";
import { resolveSoundCloudEmbed } from "@/entities/docs/lib/embed/resolvers/soundcloud-resolver";
import { resolveSpotifyEmbed } from "@/entities/docs/lib/embed/resolvers/spotify-resolver";
import { resolveTiktokEmbed } from "@/entities/docs/lib/embed/resolvers/tiktok-resolver";
import { resolveVimeoEmbed } from "@/entities/docs/lib/embed/resolvers/vimeo-resolver";
import { resolveXEmbed } from "@/entities/docs/lib/embed/resolvers/x-resolver";
import { resolveYoutubeEmbed } from "@/entities/docs/lib/embed/resolvers/youtube-resolver";

const YT_ID = "dQw4w9WgXcQ";

describe("resolveYoutubeEmbed", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${YT_ID}`, YT_ID],
    [`https://youtu.be/${YT_ID}?t=10`, YT_ID],
    [YT_ID, YT_ID],
  ])("%s -> embed/%s", (url, id) => {
    expect(resolveYoutubeEmbed(url, "en")).toBe(`https://www.youtube.com/embed/${id}`);
  });
});

describe("resolveVimeoEmbed", () => {
  it.each([
    ["https://vimeo.com/123456", "123456"],
    ["https://vimeo.com/video/98765", "98765"],
    ["42", "42"],
  ])("%s -> video/%s", (url, id) => {
    expect(resolveVimeoEmbed(url, "en")).toBe(`https://player.vimeo.com/video/${id}`);
  });
});

describe("resolveSpotifyEmbed", () => {
  it.each(["track", "album", "playlist", "show", "episode", "artist"])("rewrites a %s url to its embed form", (kind) => {
    expect(resolveSpotifyEmbed(`  https://open.spotify.com/${kind}/4iV5W9uYEdYUVa79Axb7Rh?si=x  `, "en")).toBe(
      `https://open.spotify.com/embed/${kind}/4iV5W9uYEdYUVa79Axb7Rh`,
    );
  });

  it("passes through an embed url or anything it does not recognise", () => {
    expect(resolveSpotifyEmbed("https://open.spotify.com/embed/track/abc", "en")).toBe("https://open.spotify.com/embed/track/abc");
    expect(resolveSpotifyEmbed("https://example.com/x", "en")).toBe("https://example.com/x");
  });
});

describe("resolveLinkedInEmbed", () => {
  it("keeps absolute urls and prefixes relative embed paths", () => {
    expect(resolveLinkedInEmbed(" https://www.linkedin.com/embed/feed/update/urn:li:share:1 ", "en")).toBe(
      "https://www.linkedin.com/embed/feed/update/urn:li:share:1",
    );
    expect(resolveLinkedInEmbed("feed/update/urn:li:share:1", "en")).toBe("https://www.linkedin.com/embed/feed/update/urn:li:share:1");
  });
});

describe("resolveInstagramEmbed", () => {
  it("extracts the post code from a url or accepts a bare code", () => {
    expect(resolveInstagramEmbed(" https://www.instagram.com/p/AbC_1-x/?utm=1 ", "en")).toBe("https://www.instagram.com/p/AbC_1-x/embed");
    expect(resolveInstagramEmbed(" AbC ", "en")).toBe("https://www.instagram.com/p/AbC/embed");
  });
});

describe("resolveSoundCloudEmbed", () => {
  it("wraps the track url in the player, building the url from a slug when needed", () => {
    expect(resolveSoundCloudEmbed("", "en")).toBe("");
    expect(resolveSoundCloudEmbed("https://soundcloud.com/artist/track", "en")).toBe(
      "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Ftrack&auto_play=false",
    );
    expect(resolveSoundCloudEmbed(" artist/track ", "en")).toBe(
      "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Ftrack&auto_play=false",
    );
  });
});

describe("resolveBandcampEmbed", () => {
  it("returns absolute urls as-is and makes relative ones https", () => {
    expect(resolveBandcampEmbed("  ", "en")).toBe("");
    expect(resolveBandcampEmbed("http://artist.bandcamp.com/track/x", "en")).toBe("http://artist.bandcamp.com/track/x");
    expect(resolveBandcampEmbed("https://artist.bandcamp.com/track/x", "en")).toBe("https://artist.bandcamp.com/track/x");
    expect(resolveBandcampEmbed("/artist.bandcamp.com/track/x", "en")).toBe("https://artist.bandcamp.com/track/x");
  });
});

describe("resolveDeezerEmbed", () => {
  it("builds the dark widget for tracks, albums and playlists from absolute or relative urls", () => {
    expect(resolveDeezerEmbed("https://www.deezer.com/en/track/123", "en")).toBe("https://widget.deezer.com/widget/dark/track/123");
    expect(resolveDeezerEmbed("album/456", "en")).toBe("https://widget.deezer.com/widget/dark/album/456");
    expect(resolveDeezerEmbed("/playlist/789", "en")).toBe("https://widget.deezer.com/widget/dark/playlist/789");
  });

  it("returns the normalized url for other Deezer resources and nothing for blank input", () => {
    expect(resolveDeezerEmbed("", "en")).toBe("");
    expect(resolveDeezerEmbed("https://www.deezer.com/en/artist/1", "en")).toBe("https://www.deezer.com/en/artist/1");
    expect(resolveDeezerEmbed("artist/1", "en")).toBe("https://www.deezer.com/artist/1");
  });
});

describe("resolveXEmbed", () => {
  it("extracts the status id from twitter.com and x.com urls, or accepts a bare id", () => {
    expect(resolveXEmbed("", "en")).toBe("");
    expect(resolveXEmbed("https://twitter.com/user/status/123?s=20", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=123");
    expect(resolveXEmbed("https://x.com/u_1/status/456", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=456");
    expect(resolveXEmbed(" 789 ", "en")).toBe("https://platform.twitter.com/embed/tweet.html?id=789");
  });
});

describe("resolveTiktokEmbed", () => {
  it("extracts the video id from absolute or relative video urls", () => {
    expect(resolveTiktokEmbed("", "en")).toBe("");
    expect(resolveTiktokEmbed("https://www.tiktok.com/@user.name/video/7000000000000000000", "en")).toBe(
      "https://www.tiktok.com/embed/v2/7000000000000000000",
    );
    expect(resolveTiktokEmbed("/@user/video/123", "en")).toBe("https://www.tiktok.com/embed/v2/123");
  });

  it("falls back to the last url segment when the url is not a video url", () => {
    expect(resolveTiktokEmbed("https://www.tiktok.com/t/ZTabc", "en")).toBe("https://www.tiktok.com/embed/v2/ZTabc");
    expect(resolveTiktokEmbed("456", "en")).toBe("https://www.tiktok.com/embed/v2/456");
  });
});

describe("embed resolver registry", () => {
  it("registers and looks up resolvers case-insensitively", () => {
    const custom = (url: string) => `custom:${url}`;
    registerEmbedResolver("MyProvider", custom);
    expect(getEmbedResolver("myprovider")).toBe(custom);
    expect(getEmbedResolver("MYPROVIDER")).toBe(custom);
    expect(getEmbedResolver("unknown")).toBeUndefined();
  });

  it("bootstraps every built-in provider, with twitter aliased to x", () => {
    for (const type of ["youtube", "vimeo", "spotify", "linkedin", "instagram", "soundcloud", "bandcamp", "deezer", "x", "twitter", "tiktok"]) {
      expect(getEmbedResolver(type), type).toBeTypeOf("function");
    }
    expect(getEmbedResolver("twitter")).toBe(getEmbedResolver("x"));
  });
});

describe("resolveAudioEmbedUrl", () => {
  it("delegates to the provider resolver for audio-capable types, ignoring case", () => {
    expect(resolveAudioEmbedUrl("YouTube", `https://youtu.be/${YT_ID}`, "en")).toBe(`https://www.youtube.com/embed/${YT_ID}`);
    expect(resolveAudioEmbedUrl("DEEZER", "track/1", "en")).toBe("https://widget.deezer.com/widget/dark/track/1");
  });

  it("returns the url untouched for unknown providers and for registered non-audio ones", () => {
    expect(resolveAudioEmbedUrl("mp3", "audio/a.mp3", "en")).toBe("audio/a.mp3");
    registerEmbedResolver("custom-video", (url) => `never:${url}`);
    expect(resolveAudioEmbedUrl("custom-video", "u", "en")).toBe("u");
  });
});
