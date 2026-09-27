import { describe, it, expect } from "vitest";
import { DEFAULT_LAYOUTS_DIR, normalizeLayoutsDir } from "../../contracts/layouts-paths.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as sanitize from "../../domain/services/sanitize-segment.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as langsPaths from "../../contracts/langs-paths.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as contracts from "../../contracts/index.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as docVersions from "../../contracts/doc-versions.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as versionConstants from "../../data/version-constants.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as languages from "../../contracts/languages.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as pathMappings from "../../data/path-mappings.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as routeMetas from "../../data/route-metas.mjs";
// @ts-expect-error .mjs runtime module is type-less in this package.
import * as urls from "../../data/urls.mjs";

type LangMap = Record<"pt" | "en" | "es", string>;

const { sanitizeSegment } = sanitize as { sanitizeSegment(value: unknown): string };
const { languageArtifactPaths } = langsPaths as {
  languageArtifactPaths(outputDir: string): { config: string; dir: string; bundle: (language: string) => string };
};
const { DOC_VERSIONS, PACKAGE_VERSION } = docVersions as { DOC_VERSIONS: string[]; PACKAGE_VERSION: string };
const { SUPPORTED_LANGUAGES } = languages as { SUPPORTED_LANGUAGES: readonly string[] };
const { ROUTE_PATHS, VIDEO_IDS, AUDIO_IDS, PAGE2_AUDIO } = pathMappings as {
  ROUTE_PATHS: Record<number, LangMap>;
  VIDEO_IDS: string[];
  AUDIO_IDS: string[];
  PAGE2_AUDIO: { enabled: boolean; tracks: Array<{ url: string; type: string; title: LangMap }> };
};
const metas = routeMetas as Record<string, { titles?: LangMap; descriptions?: LangMap; title?: LangMap; description?: LangMap; id?: number }> & {
  DEFAULT_HIERARCHY: Record<string, number>;
};
const { OFFICIAL_LAYOUTS_CONFIG_URL, OFFICIAL_LAYOUTS_TEMPLATES_URL } = urls as Record<string, string>;

describe("sanitizeSegment", () => {
  it.each([
    ["acme", "acme"],
    [" acme ", "acme"],
    ["my-repo_v1.2", "my-repo_v1.2"],
    ["bad owner", ""],
    ["../evil", ""],
    ["a/b", ""],
    ["", ""],
    [undefined, ""],
    [null, ""],
  ])("sanitizes %j to %j", (input, expected) => {
    expect(sanitizeSegment(input)).toBe(expected);
  });
});

describe("languageArtifactPaths", () => {
  it("derives every language artifact path from the output dir", () => {
    const paths = languageArtifactPaths("gitpagedocs");
    expect(paths.config).toBe("gitpagedocs/config.json");
    expect(paths.dir).toBe("gitpagedocs/langs");
    expect(paths.bundle("pt")).toBe("gitpagedocs/langs/pt.json");
    expect(languageArtifactPaths("out").bundle("en")).toBe("out/langs/en.json");
  });
});

describe("contracts index", () => {
  it("re-exports the doc versions and the layouts path helpers", () => {
    expect(contracts.DOC_VERSIONS).toBe(DOC_VERSIONS);
    expect(contracts.DEFAULT_LAYOUTS_DIR).toBe(DEFAULT_LAYOUTS_DIR);
    expect(contracts.normalizeLayoutsDir).toBe(normalizeLayoutsDir);
    expect(contracts.LAYOUTS_CONFIG_FILENAME).toBe("layoutsConfig.json");
    expect(contracts.LAYOUTS_FALLBACK_CONFIG_FILENAME).toBe("layoutsFallbackConfig.json");
    expect(contracts.LAYOUTS_TEMPLATES_DIRNAME).toBe("templates");
    expect(contracts.layoutsArtifactPaths("themes").config).toBe("themes/layoutsConfig.json");
  });

  it("publishes the package version as the only doc version", () => {
    expect(PACKAGE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(DOC_VERSIONS).toEqual([PACKAGE_VERSION]);
    expect(versionConstants.DOC_VERSIONS).toBe(DOC_VERSIONS);
  });

  it("freezes the supported language list in menu order", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["en", "pt", "es"]);
    expect(Object.isFrozen(SUPPORTED_LANGUAGES)).toBe(true);
  });
});

describe("route data", () => {
  it("maps every markdown route to a file per language", () => {
    expect(Object.keys(ROUTE_PATHS).map(Number)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const paths of Object.values(ROUTE_PATHS)) {
      for (const language of ["pt", "en", "es"] as const) {
        expect(paths[language]).toMatch(/\.md$/);
      }
    }
    expect(VIDEO_IDS).toHaveLength(4);
    expect(AUDIO_IDS).toHaveLength(1);
    expect(PAGE2_AUDIO.enabled).toBe(true);
    expect(PAGE2_AUDIO.tracks[0].url).toContain(AUDIO_IDS[0]);
  });

  it("describes every route in the three languages", () => {
    for (const id of [1, 2, 3, 4, 5, 6]) {
      const meta = metas[`ROUTE_META_ID${id}`];
      expect(Object.keys(meta.titles ?? {}).sort()).toEqual(["en", "es", "pt"]);
      expect(Object.keys(meta.descriptions ?? {}).sort()).toEqual(["en", "es", "pt"]);
    }
    for (const id of [1, 2, 3, 4]) {
      const meta = metas[`VIDEO_META_ID${id}`];
      expect(Object.keys(meta.title ?? {}).sort()).toEqual(["en", "es", "pt"]);
      expect(Object.keys(meta.description ?? {}).sort()).toEqual(["en", "es", "pt"]);
    }
    expect(metas.SOURCE_VIEWER_META.id).toBe(7);
    expect(metas.AUDIO_META_ID12.id).toBe(12);
    expect(metas.DEFAULT_HIERARCHY).toEqual({ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 });
  });

  it("points the official layout URLs at the standalone layouts home", () => {
    expect(OFFICIAL_LAYOUTS_CONFIG_URL).toBe("https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagelayouts/layoutsConfig.json");
    expect(OFFICIAL_LAYOUTS_TEMPLATES_URL).toBe("https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagelayouts/templates");
  });
});
