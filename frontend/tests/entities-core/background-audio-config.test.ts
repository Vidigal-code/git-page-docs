import { describe, expect, it } from "vitest";
import { getBackgroundAudioConfig } from "@/entities/docs/lib/audio";
import type { LoadedPage, PageRouteAudioConfig } from "@/entities/docs/model/types";
import { makeSite } from "./fixtures/docs-data";

const tracks: PageRouteAudioConfig["tracks"] = [{ url: "a.mp3", type: "mp3" }];
const siteTracks = [{ url: "s.mp3", type: "mp3" }];

function pageWith(kind: "md" | "html" | "video", audio: PageRouteAudioConfig | undefined): LoadedPage {
  const config = { id: 1, path: { en: "a" }, audio };
  if (kind === "md") return { id: 1, md: { routeId: 1, config, markdownByLanguage: {} } };
  if (kind === "html") return { id: 1, html: { routeId: 1, config, htmlByLanguage: {} } };
  return { id: 1, video: { routeId: 1, config, videoTypeByLanguage: {}, pathVideoByLanguage: {} } };
}

describe("getBackgroundAudioConfig", () => {
  const site = makeSite({
    audioPlayerEnabled: true,
    audioTracks: siteTracks,
    audioAutoPlayOnLoad: true,
    audioLoopEnabled: true,
    audioAllowUserChoice: false,
    audioSequentialPlayback: true,
  });

  it("uses the page playlist, with page flags over site flags over the built-in defaults", () => {
    const page = pageWith("md", { tracks, loopEnabled: false });
    expect(getBackgroundAudioConfig(page, site, "en")).toEqual({
      tracks,
      autoPlayOnLoad: true,
      loopEnabled: false,
      allowUserChoice: false,
      sequentialPlayback: true,
    });
    expect(getBackgroundAudioConfig(page, makeSite(), "en")).toEqual({
      tracks,
      autoPlayOnLoad: false,
      loopEnabled: false,
      allowUserChoice: true,
      sequentialPlayback: false,
    });
  });

  it("looks at md, then html, then video route audio", () => {
    const html = pageWith("html", { tracks });
    const video = pageWith("video", { tracks: [{ url: "v.mp3", type: "mp3" }] });
    const page: LoadedPage = { id: 1, md: pageWith("md", undefined).md, html: html.html, video: video.video };
    expect(getBackgroundAudioConfig(page, makeSite(), "en")?.tracks).toBe(tracks);
    expect(getBackgroundAudioConfig({ id: 1, video: video.video }, makeSite(), "en")?.tracks).toEqual([{ url: "v.mp3", type: "mp3" }]);
  });

  it("skips disabled, empty or non-playlist audio configs", () => {
    expect(getBackgroundAudioConfig(pageWith("md", { tracks, enabled: false }), makeSite(), "en")).toBeNull();
    expect(getBackgroundAudioConfig(pageWith("md", { tracks: [] }), makeSite(), "en")).toBeNull();
    const audioRoute: LoadedPage = {
      id: 1,
      md: { routeId: 1, config: { id: 1, audio: { audioType: { en: "mp3" }, pathAudio: { en: "a.mp3" } } }, markdownByLanguage: {} },
    };
    expect(getBackgroundAudioConfig(audioRoute, makeSite(), "en")).toBeNull();
    const legacy: LoadedPage = { id: 1, md: { routeId: 1, config: { id: 1, path: { en: "a" } }, markdownByLanguage: {} } };
    expect(getBackgroundAudioConfig(legacy, makeSite(), "en")).toBeNull();
  });

  it("falls back to the site playlist when the player is enabled", () => {
    expect(getBackgroundAudioConfig(undefined, site, "en")).toEqual({
      tracks: siteTracks,
      autoPlayOnLoad: true,
      loopEnabled: true,
      allowUserChoice: false,
      sequentialPlayback: true,
    });
    expect(getBackgroundAudioConfig({ id: 1 }, makeSite({ audioPlayerEnabled: true, audioTracks: siteTracks }), "en")).toEqual({
      tracks: siteTracks,
      autoPlayOnLoad: false,
      loopEnabled: false,
      allowUserChoice: true,
      sequentialPlayback: false,
    });
  });

  it("returns null when the site player is disabled or has no tracks", () => {
    expect(getBackgroundAudioConfig(undefined, makeSite({ audioPlayerEnabled: false, audioTracks: siteTracks }), "en")).toBeNull();
    expect(getBackgroundAudioConfig(undefined, makeSite({ audioPlayerEnabled: true, audioTracks: [] }), "en")).toBeNull();
    expect(getBackgroundAudioConfig(undefined, makeSite({ audioPlayerEnabled: true }), "en")).toBeNull();
  });
});
