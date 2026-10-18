import { afterEach, expect, it, vi } from "vitest";
import { loadPages } from "@/entities/docs/api/content/load-pages";
import { loadRemoteDocsData } from "@/entities/docs/api/load-remote-docs-data-client";
import { minimalConfig, requestedUrls, stubRepoFetch } from "./test-helpers";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it.each(["", "/handbook"])("resolves native media under base path %s while preserving embed IDs and original navigation paths", async (basePath) => {
  vi.stubEnv("NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH", basePath);
  const audioPath = "gitpagedocs/docs/en/lesson.wav";
  const videoPath = "gitpagedocs/docs/en/lesson.mp4";
  const result = await loadPages({
    sortedIds: [1, 2, 3], routesMd: [], routesSourceViewer: [], routesHtml: [],
    routesVideo: [
      { id: 1, video: { videoType: { en: "mp4" }, pathVideo: { en: videoPath } } },
      { id: 3, video: { videoType: { en: "youtube" }, pathVideo: { en: "AbCdEf12345" } } },
    ],
    routesAudio: [{ id: 2, audio: { audioType: { en: "wav" }, pathAudio: { en: audioPath } } }],
    languages: ["en", "pt"], source: "local",
  });
  expect(result.pages[0].video?.pathVideoByLanguage).toEqual({ en: `${basePath}/${videoPath}`, pt: `${basePath}/${videoPath}` });
  expect(result.pages[1].audio?.pathAudioByLanguage).toEqual({ en: `${basePath}/${audioPath}`, pt: `${basePath}/${audioPath}` });
  expect(result.pages[2].video?.pathVideoByLanguage.en).toBe("AbCdEf12345");
  expect(result.pathToPageMap[audioPath]).toEqual({ pageIndex: 1, contentType: "audio" });
  expect(result.pathToPageMap[`${basePath}/${audioPath}`]).toEqual({ pageIndex: 1, contentType: "audio" });
});
it("resolves remote native media against the source repository without fetching media bodies", async () => {
  const audioPath = "gitpagedocs/docs/en/example.wav";
  const videoPath = "gitpagedocs/docs/en/example.mp4";
  const fetch = stubRepoFetch({
    "author/manual/gitpagedocs/config.json": minimalConfig({
      "routes-video": [{ id: 1, video: { videoType: { en: "mp4" }, pathVideo: { en: videoPath } } }],
      "routes-audio": [{ id: 2, audio: { audioType: { en: "wav" }, pathAudio: { en: audioPath } } }],
    }),
  });
  const data = await loadRemoteDocsData("author", "manual");
  const rawRoot = "https://raw.githubusercontent.com/author/manual/HEAD/";
  expect(data?.pages[0].video?.pathVideoByLanguage.en).toBe(rawRoot + videoPath);
  expect(data?.pages[1].audio?.pathAudioByLanguage.en).toBe(rawRoot + audioPath);
  expect(data?.pathToPageMap[audioPath]).toEqual({ pageIndex: 1, contentType: "audio" });
  expect(data?.pathToPageMap[rawRoot + audioPath]).toEqual({ pageIndex: 1, contentType: "audio" });
  expect(requestedUrls(fetch).some(url => /\.(?:wav|mp4)$/.test(url))).toBe(false);
});

function loadNativeMedia(location: string, source: "local" | "remote" = "local") {
  return loadPages({
    sortedIds: [1], routesMd: [], routesSourceViewer: [], routesHtml: [],
    routesVideo: [{ id: 1, video: { videoType: { en: "MP4" }, pathVideo: { en: location } } }],
    routesAudio: [{ id: 1, audio: { audioType: { en: "WAV" }, pathAudio: { en: location } } }],
    languages: ["en"], source, owner: "author", repo: "manual",
  });
}

it.each(["local", "remote"] as const)("preserves absolute native media URLs in the %s loader", async (source) => {
  const location = "https://media.example.com/lesson.mp4?part=2#t=4";
  const { pages } = await loadNativeMedia(location, source);
  expect(pages[0].video?.pathVideoByLanguage.en).toBe(location);
  expect(pages[0].audio?.pathAudioByLanguage.en).toBe(location);
});

it("encodes accented native media filenames when loading from a remote repository on the server", async () => {
  const { pages } = await loadNativeMedia("gitpagedocs/docs/pt/áudio demo.wav", "remote");
  expect(pages[0].audio?.pathAudioByLanguage.en).toBe("https://raw.githubusercontent.com/author/manual/HEAD/gitpagedocs/docs/pt/%C3%A1udio%20demo.wav");
});

it.each(["javascript:alert(1)", "data:audio/wav;base64,AAA", "//other.example/lesson.wav", "../private.wav", "%2e%2e/private.wav", "folder\\private.wav", "https://[invalid", "lesson%ZZ.wav", "lesson\n.wav"])("rejects unsafe native media path %s", async (location) => {
  const { pages } = await loadNativeMedia(location);
  expect(pages[0].audio?.pathAudioByLanguage.en).toBe("");
  expect(pages[0].video?.pathVideoByLanguage.en).toBe("");
});
