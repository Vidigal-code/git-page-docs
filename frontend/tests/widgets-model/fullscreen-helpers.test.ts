// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  applyFullscreenParams,
  findMediaPathClickBySlug,
  resolveFullscreenPageIndex,
  resolveFullscreenPathClick,
  stripFullscreenParams,
} from "@/widgets/docs-shell/model/use-docs-shell-fullscreen.helpers";
import {
  AUDIO_ROUTE_ID,
  AUDIO_SLUG_KEY,
  GUIDE,
  INTRO,
  LANDING,
  PAGE_INDEX,
  VIDEO_ROUTE_ID,
  VIDEO_SLUG_KEY,
  makeDocsData,
} from "./fixtures";

const data = makeDocsData();

describe("findMediaPathClickBySlug", () => {
  it("matches a key of the requested media type containing the slug, ignoring case", () => {
    expect(findMediaPathClickBySlug(data, "video", "COPILOT")).toBe(VIDEO_SLUG_KEY);
    expect(findMediaPathClickBySlug(data, "audio", "intro")).toBe(AUDIO_SLUG_KEY);
    // The audio key contains "intro" but the video lookup ignores it.
    expect(findMediaPathClickBySlug(data, "video", "intro")).toBeNull();
    expect(findMediaPathClickBySlug(makeDocsData({ pathToPageMap: {} }), "video", "copilot")).toBeNull();
  });
});

describe("resolveFullscreenPathClick", () => {
  it("uses the file for documents", () => {
    expect(resolveFullscreenPathClick(data, { type: "md", lang: "en", file: INTRO })).toBe(INTRO);
    expect(resolveFullscreenPathClick(data, { type: "html", lang: "en", file: LANDING })).toBe(LANDING);
    expect(resolveFullscreenPathClick(data, { type: "md", lang: "en" })).toBeNull();
    expect(resolveFullscreenPathClick(data, { type: "html", lang: "en", file: "" })).toBeNull();
  });

  it("prefers the media id over the slug", () => {
    expect(resolveFullscreenPathClick(data, { type: "video", lang: "en", id: 30, slug: "copilot" })).toBe("page:30");
    expect(resolveFullscreenPathClick(data, { type: "audio", lang: "en", id: 0 })).toBe("page:0");
    expect(resolveFullscreenPathClick(data, { type: "video", lang: "en", slug: "copilot" })).toBe(VIDEO_SLUG_KEY);
    expect(resolveFullscreenPathClick(data, { type: "audio", lang: "en", slug: "intro" })).toBe(AUDIO_SLUG_KEY);
    expect(resolveFullscreenPathClick(data, { type: "audio", lang: "en", slug: "ghost" })).toBeNull();
    expect(resolveFullscreenPathClick(data, { type: "video", lang: "en" })).toBeNull();
  });

  it("resolves nothing for an empty request", () => {
    expect(resolveFullscreenPathClick(data, { type: null, lang: "en", file: INTRO })).toBeNull();
  });
});

describe("resolveFullscreenPageIndex", () => {
  it("opens the page of a document file, or the first page when it is unknown", () => {
    expect(resolveFullscreenPageIndex(data, { type: "md", lang: "en", file: GUIDE })).toBe(PAGE_INDEX.guide);
    expect(resolveFullscreenPageIndex(data, { type: "html", lang: "en", file: LANDING })).toBe(PAGE_INDEX.landing);
    expect(resolveFullscreenPageIndex(data, { type: "md", lang: "en", file: "docs/missing.md" })).toBe(0);
    expect(resolveFullscreenPageIndex(data, { type: "md", lang: "en" })).toBe(0);
  });

  it("resolves media by id first, then by slug, falling back to the first page", () => {
    expect(resolveFullscreenPageIndex(data, { type: "video", lang: "en", id: VIDEO_ROUTE_ID })).toBe(PAGE_INDEX.video);
    expect(resolveFullscreenPageIndex(data, { type: "audio", lang: "en", id: AUDIO_ROUTE_ID, slug: "copilot" })).toBe(PAGE_INDEX.audio);
    expect(resolveFullscreenPageIndex(data, { type: "video", lang: "en", slug: "COPILOT" })).toBe(PAGE_INDEX.video);
    expect(resolveFullscreenPageIndex(data, { type: "audio", lang: "en", slug: "intro" })).toBe(PAGE_INDEX.audio);
    // The audio key contains "intro" but a video lookup ignores it.
    expect(resolveFullscreenPageIndex(data, { type: "video", lang: "en", slug: "intro" })).toBe(0);
    expect(resolveFullscreenPageIndex(data, { type: "video", lang: "en", id: 999 })).toBe(0);
    expect(resolveFullscreenPageIndex(data, { type: "audio", lang: "en", slug: "ghost" })).toBe(0);
    expect(resolveFullscreenPageIndex(data, { type: "video", lang: "en" })).toBe(0);
  });

  it("falls back to the first page for an empty request or an empty page map", () => {
    expect(resolveFullscreenPageIndex(data, { type: null, lang: "en", file: GUIDE })).toBe(0);
    expect(resolveFullscreenPageIndex(makeDocsData({ pathToPageMap: {} }), { type: "md", lang: "en", file: GUIDE })).toBe(0);
  });
});

describe("applyFullscreenParams", () => {
  it("writes document params only when a file is given, keeping existing params", () => {
    const md = new URLSearchParams("theme=t");
    applyFullscreenParams(md, { type: "md", lang: "en", file: INTRO });
    expect(md.toString()).toBe("theme=t&mdfull=en&file=docs%2Fintro.md");

    const html = new URLSearchParams();
    applyFullscreenParams(html, { type: "html", lang: "pt", file: LANDING });
    expect(html.toString()).toBe("htmlfull=pt&file=pages%2Flanding.html");

    const noFile = new URLSearchParams("theme=t");
    applyFullscreenParams(noFile, { type: "md", lang: "en" });
    expect(noFile.toString()).toBe("theme=t");
  });

  it("writes media params with whichever selector is present", () => {
    const both = new URLSearchParams();
    applyFullscreenParams(both, { type: "video", lang: "en", id: 30, slug: "copilot" });
    expect(both.toString()).toBe("videofull=en&id=30&slug=copilot");

    const slugOnly = new URLSearchParams();
    applyFullscreenParams(slugOnly, { type: "audio", lang: "en", slug: "intro" });
    expect(slugOnly.toString()).toBe("audiofull=en&slug=intro");

    const idOnly = new URLSearchParams();
    applyFullscreenParams(idOnly, { type: "audio", lang: "en", id: 40 });
    expect(idOnly.toString()).toBe("audiofull=en&id=40");

    const none = new URLSearchParams("keep=1");
    applyFullscreenParams(none, { type: null, lang: "en" });
    expect(none.toString()).toBe("keep=1");
  });
});

describe("stripFullscreenParams", () => {
  it("removes every fullscreen param and the id when asked to always drop it", () => {
    const params = new URLSearchParams("mdfull=en&file=f&htmlfull=x&videofull=y&audiofull=z&slug=s&id=3&theme=t");
    stripFullscreenParams(params, "always");
    expect(params.toString()).toBe("theme=t");
  });

  it("keeps the id unless a media fullscreen owned it", () => {
    const document = new URLSearchParams("mdfull=en&file=f&id=7&theme=t");
    stripFullscreenParams(document, "media-only");
    expect(document.toString()).toBe("id=7&theme=t");

    const video = new URLSearchParams("videofull=en&id=30&slug=x");
    stripFullscreenParams(video, "media-only");
    expect(video.toString()).toBe("");

    const audio = new URLSearchParams("audiofull=en&id=40&lang=pt");
    stripFullscreenParams(audio, "media-only");
    expect(audio.toString()).toBe("lang=pt");
  });
});
