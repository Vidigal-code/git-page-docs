import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/entities/docs/api/utils/markdown";
import { parseOwnerRepoFromRenderingUrl } from "@/entities/docs/api/utils/url-utils";
import { getLanguages, getLanguagesFromPathRecord, hasAudio, hasPath, hasVideo } from "@/entities/docs/api/utils/route-utils";
import { buildRemoteTemplateUrl, templatesBaseFromConfigUrl } from "@/entities/docs/api/layouts/remote-template-urls";
import type { ContentTypeRouteConfig } from "@/entities/docs/model/types";
import { minimalConfig } from "./test-helpers";

describe("markdownToHtml", () => {
  it("strips front matter and gives headings slug ids for the table of contents", () => {
    const html = markdownToHtml("---\ntitle: Ignored\n---\n# Hello World\n\n## Getting Started: Part 2\n\ntext");
    expect(html).not.toContain("Ignored");
    expect(html).toContain('<h1 id="hello-world">Hello World</h1>');
    expect(html).toContain('<h2 id="getting-started-part-2">Getting Started: Part 2</h2>');
    expect(html).toContain("<p>text</p>");
  });

  it("keeps an id the author already set", () => {
    expect(markdownToHtml('<h2 id="custom">Keep</h2>')).toContain('<h2 id="custom">Keep</h2>');
  });

  it("falls back to the id 'heading' when the text has no slug characters", () => {
    expect(markdownToHtml("# ???")).toContain('<h1 id="heading">???</h1>');
  });

  it("leaves headings with inline markup untouched", () => {
    expect(markdownToHtml("# Hello *World*")).toContain("<h1>Hello <em>World</em></h1>");
  });
});

describe("parseOwnerRepoFromRenderingUrl", () => {
  it("reads owner and repo from the first two path segments", () => {
    expect(parseOwnerRepoFromRenderingUrl("https://github.com/owner/repo")).toEqual({ owner: "owner", repo: "repo" });
    expect(parseOwnerRepoFromRenderingUrl("https://github.com/owner/repo/blob/main/x")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("yields nothing for short paths, empty strings and invalid urls", () => {
    expect(parseOwnerRepoFromRenderingUrl("https://github.com/owner")).toEqual({});
    expect(parseOwnerRepoFromRenderingUrl("")).toEqual({});
    expect(parseOwnerRepoFromRenderingUrl("not a url")).toEqual({});
  });
});

describe("route guards", () => {
  it("hasPath requires a path object", () => {
    expect(hasPath({ id: 1, path: { en: "a.md" } })).toBe(true);
    expect(hasPath({ id: 1 })).toBe(false);
    expect(hasPath({ id: 1, path: "a.md" } as unknown as ContentTypeRouteConfig)).toBe(false);
  });

  it("hasVideo requires both the type and the path maps", () => {
    expect(hasVideo({ id: 1, video: { videoType: { en: "youtube" }, pathVideo: { en: "u" } } })).toBe(true);
    expect(hasVideo({ id: 1, video: { videoType: { en: "youtube" } } as never })).toBe(false);
    expect(hasVideo({ id: 1 })).toBe(false);
  });

  it("hasAudio accepts routes-audio entries but not background-music blocks", () => {
    expect(hasAudio({ id: 1, audio: { audioType: { en: "mp3" }, pathAudio: { en: "u" } } })).toBe(true);
    expect(hasAudio({ id: 1, audio: { tracks: [{ url: "u", type: "mp3" }] } })).toBe(false);
    expect(hasAudio({ id: 1 })).toBe(false);
  });

  it("getLanguagesFromPathRecord lists the record keys or nothing", () => {
    expect(getLanguagesFromPathRecord({ en: "a", pt: "b" })).toEqual(["en", "pt"]);
    expect(getLanguagesFromPathRecord(undefined)).toEqual([]);
    expect(getLanguagesFromPathRecord("nope" as unknown as Record<string, string>)).toEqual([]);
  });
});

describe("getLanguages content fallback chain", () => {
  const config = minimalConfig({}, { defaultLanguage: "pt" });

  it("uses the first md route path when it has one", () => {
    expect(getLanguages(config, [{ id: 1, path: { en: "a", es: "b" } }], [], [], [], [])).toEqual(["en", "es"]);
  });

  it("falls through source viewer titles, html paths, video and audio paths", () => {
    const mdWithoutPath = [{ id: 1 }] as ContentTypeRouteConfig[];
    expect(getLanguages(config, mdWithoutPath, [{ id: 2, title: { es: "t" } }], [], [], [])).toEqual(["es"]);
    expect(getLanguages(config, mdWithoutPath, [{ id: 2 }], [{ id: 3, path: { en: "h" } }], [], [])).toEqual(["en"]);
    expect(
      getLanguages(config, mdWithoutPath, [], [{ id: 3 }], [{ id: 4, video: { videoType: { fr: "youtube" }, pathVideo: { fr: "v" } } }], []),
    ).toEqual(["fr"]);
    expect(
      getLanguages(config, mdWithoutPath, [], [], [{ id: 4 }], [{ id: 5, audio: { audioType: { de: "mp3" }, pathAudio: { de: "a" } } }]),
    ).toEqual(["de"]);
  });

  it("falls back to the legacy routes list, then to the default language", () => {
    const withRoutes = minimalConfig({ routes: [{ id: 1, path: { it: "x" } }] }, { defaultLanguage: "pt" });
    expect(getLanguages(withRoutes, [], [], [], [])).toEqual(["it"]);
    expect(getLanguages(config, [], [], [], [])).toEqual(["pt"]);
    expect(getLanguages(config, [], [], [], [], undefined)).toEqual(["pt"]);
  });
});

describe("remote template urls", () => {
  it("templatesBaseFromConfigUrl is the raw parent folder of the config", () => {
    expect(templatesBaseFromConfigUrl("https://github.com/o/r/blob/main/gitpagelayouts/layoutsConfig.json")).toBe(
      "https://raw.githubusercontent.com/o/r/main/gitpagelayouts/",
    );
    expect(templatesBaseFromConfigUrl("https://cdn.example/dir/index.json")).toBe("https://cdn.example/dir/");
  });

  it("buildRemoteTemplateUrl never duplicates the templates segment", () => {
    expect(buildRemoteTemplateUrl("templates/a.json", "https://h/x/templates/")).toBe("https://h/x/templates/a.json");
    expect(buildRemoteTemplateUrl("templates/a.json", "https://h/x")).toBe("https://h/x/templates/a.json");
    expect(buildRemoteTemplateUrl("./templates/a.json", "https://h/x/")).toBe("https://h/x/templates/a.json");
    expect(buildRemoteTemplateUrl("Templates/a.json", "https://h/x/TEMPLATES/")).toBe("https://h/x/TEMPLATES/a.json");
    expect(buildRemoteTemplateUrl("a.json", "https://h/x/templates")).toBe("https://h/x/templates/a.json");
  });
});
