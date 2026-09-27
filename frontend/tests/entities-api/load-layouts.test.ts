import { afterEach, describe, expect, it, vi } from "vitest";
import { loadLayoutsAndThemes } from "@/entities/docs/api/layouts/load-layouts";
import { OFFICIAL_LAYOUTS_CONFIG_URLS } from "@/shared/config/remote-urls";
import { createTempWorkspace, requestedUrls, stubFetch, type TempWorkspace } from "./test-helpers";

const FALLBACK_ID = "gitpagedocs-fallback-dark";

const layoutItem = (id: string) => ({
  id,
  name: id,
  author: "t",
  file: `templates/${id}.json`,
  preview: "",
  supportsLightAndDarkModes: false,
  mode: "dark" as const,
});

const template = (id: string, background: string) => ({
  id,
  name: id,
  author: "t",
  version: "1",
  mode: "dark",
  supportsLightAndDarkModes: false,
  colors: { background },
  typography: { fontFamily: "x", fontSize: { base: "1rem" } },
  components: {},
  animations: {},
});

const INDEX = { layouts: [layoutItem("alpha"), layoutItem("beta")] };

describe("loadLayoutsAndThemes", () => {
  let workspace: TempWorkspace | undefined;

  afterEach(() => {
    workspace?.cleanup();
    workspace = undefined;
    vi.unstubAllGlobals();
  });

  describe("local runtime", () => {
    it("reads the legacy gitpagedocs/layouts folder first and its templates from the same folder", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagedocs/layouts/layoutsConfig.json", INDEX);
      workspace.write("gitpagedocs/layouts/templates/alpha.json", template("alpha", "#legacy"));
      workspace.write("gitpagelayouts/layoutsConfig.json", { layouts: [layoutItem("other")] });
      workspace.write("gitpagelayouts/templates/beta.json", template("beta", "#canonical"));
      const fetchSpy = stubFetch([]);

      const { layoutsConfig, themes } = await loadLayoutsAndThemes({ isLocal: true });

      expect(layoutsConfig).toEqual(INDEX);
      expect(themes.alpha.colors.background).toBe("#legacy");
      // A template missing from the preferred folder is found in the other candidate folder.
      expect(themes.beta.colors.background).toBe("#canonical");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("falls back to the canonical gitpagelayouts folder when the legacy one is absent", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagelayouts/layoutsConfig.json", { layouts: [layoutItem("alpha")] });
      workspace.write("gitpagelayouts/templates/alpha.json", template("alpha", "#canonical"));

      const { layoutsConfig, themes } = await loadLayoutsAndThemes({ isLocal: true });

      expect(layoutsConfig.layouts.map((l) => l.id)).toEqual(["alpha"]);
      expect(themes.alpha.colors.background).toBe("#canonical");
    });

    it("omits templates that cannot be read instead of failing", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagedocs/layouts/layoutsConfig.json", INDEX);
      workspace.write("gitpagedocs/layouts/templates/alpha.json", template("alpha", "#a"));

      const { themes } = await loadLayoutsAndThemes({ isLocal: true });

      expect(Object.keys(themes)).toEqual(["alpha"]);
    });

    it("ships the built-in fallback when no local layouts exist", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagedocs/layouts/layoutsConfig.json", { layouts: [] });

      const { layoutsConfig, themes } = await loadLayoutsAndThemes({ isLocal: true });

      expect(layoutsConfig.layouts.map((l) => l.id)).toEqual([FALLBACK_ID]);
      expect(themes[FALLBACK_ID]).toBeDefined();
    });

    it("never fetches remote templates on a local runtime, even with official layouts on", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagelayouts/templates/alpha.json", template("alpha", "#local"));
      const fetchSpy = stubFetch([
        ["gitpagelayouts/layoutsConfig.json", INDEX],
        ["templates/beta.json", template("beta", "#remote")],
      ]);

      const { themes } = await loadLayoutsAndThemes({ isLocal: true, useOfficialLayouts: true });

      expect(themes.alpha.colors.background).toBe("#local");
      expect(themes.beta).toBeUndefined();
      expect(requestedUrls(fetchSpy).some((url) => url.includes("templates/"))).toBe(false);
    });
  });

  describe("official layouts", () => {
    it("tries the configured official url first and the templates override only for it", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([
        ["custom.example/layouts/index.json", INDEX],
        ["custom.example/tpl/templates/alpha.json", template("alpha", "#override")],
        ["custom.example/tpl/templates/beta.json", template("beta", "#override")],
      ]);

      const { themes } = await loadLayoutsAndThemes({
        isLocal: false,
        useOfficialLayouts: true,
        officialLayoutsConfigPath: "https://custom.example/layouts/index.json",
        officialLayoutsTemplatesPath: "https://custom.example/tpl",
      });

      expect(themes.alpha.colors.background).toBe("#override");
      expect(themes.beta.colors.background).toBe("#override");
      expect(requestedUrls(fetchSpy)[0]).toBe("https://custom.example/layouts/index.json");
    });

    it("recovers through the official candidates and derives templates from the serving url", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([
        ["Vidigal-code/git-page-docs/main/gitpagelayouts/layoutsConfig.json", INDEX],
        ["Vidigal-code/git-page-docs/main/gitpagelayouts/templates/alpha.json", template("alpha", "#official")],
      ]);

      const { layoutsConfig, themes } = await loadLayoutsAndThemes({
        isLocal: false,
        useOfficialLayouts: true,
        officialLayoutsConfigPath: "https://github.com/x/y/blob/main/retired/layoutsConfig.json",
        officialLayoutsTemplatesPath: "https://github.com/x/y/blob/main/retired/templates",
      });

      expect(layoutsConfig).toEqual(INDEX);
      expect(themes.alpha.colors.background).toBe("#official");
      const urls = requestedUrls(fetchSpy);
      expect(urls[0]).toBe("https://raw.githubusercontent.com/x/y/main/retired/layoutsConfig.json");
      expect(urls[1]).toBe("https://raw.githubusercontent.com/Vidigal-code/git-page-docs/main/gitpagelayouts/layoutsConfig.json");
      // The stale templates override must not be used for the fallback source.
      expect(urls.some((url) => url.includes("retired/templates"))).toBe(false);
    });

    it("uses layoutsConfigPath as the official url when no official url is configured", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([["mine.example/layoutsConfig.json", { layouts: [layoutItem("alpha")] }]]);

      await loadLayoutsAndThemes({ isLocal: false, useOfficialLayouts: true, layoutsConfigPath: "https://mine.example/layoutsConfig.json" });

      expect(requestedUrls(fetchSpy)[0]).toBe("https://mine.example/layoutsConfig.json");
    });

    it("walks every official candidate before giving up", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([]);

      const { layoutsConfig } = await loadLayoutsAndThemes({ isLocal: false, useOfficialLayouts: true });

      expect(layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);
      const urls = requestedUrls(fetchSpy);
      expect(urls).toHaveLength(OFFICIAL_LAYOUTS_CONFIG_URLS.length);
      expect(urls[0]).toContain("gitpagelayouts/layoutsConfig.json");
      expect(urls[1]).toContain("gitpagedocs/layouts/layoutsConfig.json");
    });
  });

  describe("remote runtime", () => {
    it("reads the configured layouts url and its templates next to it", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([
        ["cfg.example/layouts/layoutsConfig.json", { layouts: [layoutItem("alpha")] }],
        ["cfg.example/layouts/templates/alpha.json", template("alpha", "#cfg")],
      ]);

      const { themes } = await loadLayoutsAndThemes({ isLocal: false, layoutsConfigPath: "https://cfg.example/layouts/layoutsConfig.json" });

      expect(themes.alpha.colors.background).toBe("#cfg");
      expect(requestedUrls(fetchSpy)).toEqual([
        "https://cfg.example/layouts/layoutsConfig.json",
        "https://cfg.example/layouts/templates/alpha.json",
      ]);
    });

    it("honours the templates override for a configured layouts url, converting github.com urls to raw", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([
        ["cfg.example/layoutsConfig.json", { layouts: [layoutItem("alpha")] }],
        ["raw.githubusercontent.com/o/r/main/tpl/templates/alpha.json", template("alpha", "#tpl")],
      ]);

      const { themes } = await loadLayoutsAndThemes({
        isLocal: false,
        layoutsConfigPath: "https://cfg.example/layoutsConfig.json",
        layoutsConfigPathTemplates: "https://github.com/o/r/blob/main/tpl",
      });

      expect(themes.alpha.colors.background).toBe("#tpl");
      expect(requestedUrls(fetchSpy)[1]).toBe("https://raw.githubusercontent.com/o/r/main/tpl/templates/alpha.json");
    });

    it("falls back to the repository layouts folder and builds the raw base from it", async () => {
      workspace = createTempWorkspace();
      const fetchSpy = stubFetch([
        ["/o/r/HEAD/gitpagelayouts/layoutsConfig.json", { layouts: [layoutItem("alpha")] }],
        ["/o/r/HEAD/gitpagelayouts/templates/alpha.json", template("alpha", "#repo")],
      ]);

      const { themes } = await loadLayoutsAndThemes({ isLocal: false, owner: "o", repo: "r", layoutsConfigPath: "https://down.example/x.json" });

      expect(themes.alpha.colors.background).toBe("#repo");
      const urls = requestedUrls(fetchSpy);
      expect(urls[0]).toBe("https://down.example/x.json");
      expect(urls.some((url) => url.endsWith("/o/r/HEAD/gitpagedocs/layouts/layoutsConfig.json"))).toBe(true);
      expect(urls).toContain("https://raw.githubusercontent.com/o/r/HEAD/gitpagelayouts/templates/alpha.json");
    });

    it("applies the templates override to repository layouts unless official layouts are on", async () => {
      workspace = createTempWorkspace();
      stubFetch([
        ["/o/r/HEAD/gitpagedocs/layouts/layoutsConfig.json", { layouts: [layoutItem("alpha")] }],
        ["tpl.example/templates/alpha.json", template("alpha", "#tpl")],
      ]);

      const { themes } = await loadLayoutsAndThemes({ isLocal: false, owner: "o", repo: "r", layoutsConfigPathTemplates: "https://tpl.example" });
      expect(themes.alpha.colors.background).toBe("#tpl");

      const official = await loadLayoutsAndThemes({
        isLocal: false,
        useOfficialLayouts: true,
        owner: "o",
        repo: "r",
        layoutsConfigPathTemplates: "https://tpl.example",
      });
      expect(official.themes.alpha).toBeUndefined();
    });

    it("falls back to a local template when the remote one is missing, retrying remote once more", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagedocs/layouts/templates/alpha.json", template("alpha", "#local"));
      const fetchSpy = stubFetch([["cfg.example/layoutsConfig.json", { layouts: [layoutItem("alpha"), layoutItem("beta")] }]]);

      const { themes } = await loadLayoutsAndThemes({ isLocal: false, layoutsConfigPath: "https://cfg.example/layoutsConfig.json" });

      expect(themes.alpha.colors.background).toBe("#local");
      expect(themes.beta).toBeUndefined();
      expect(requestedUrls(fetchSpy).filter((url) => url.endsWith("templates/beta.json"))).toHaveLength(2);
    });

    it("ships the built-in fallback when no remote or local source exists", async () => {
      workspace = createTempWorkspace();
      stubFetch([]);

      const { layoutsConfig } = await loadLayoutsAndThemes({ isLocal: false, owner: "o", repo: "r" });

      expect(layoutsConfig.layouts[0].id).toBe(FALLBACK_ID);
    });

    it("reads local layouts as the last remote fallback", async () => {
      workspace = createTempWorkspace();
      workspace.write("gitpagelayouts/layoutsConfig.json", { layouts: [layoutItem("alpha")] });
      workspace.write("gitpagelayouts/templates/alpha.json", template("alpha", "#local"));
      stubFetch([]);

      const { themes } = await loadLayoutsAndThemes({ isLocal: false, owner: "o", repo: "r" });

      expect(themes.alpha.colors.background).toBe("#local");
    });

    it("drops a template whose url cannot be built instead of failing the load", async () => {
      workspace = createTempWorkspace();
      stubFetch([["cfg.example/layoutsConfig.json", { layouts: [layoutItem("alpha")] }]]);

      const { layoutsConfig, themes } = await loadLayoutsAndThemes({
        isLocal: false,
        layoutsConfigPath: "https://cfg.example/layoutsConfig.json",
        layoutsConfigPathTemplates: "not a url",
      });

      expect(layoutsConfig.layouts.map((l) => l.id)).toEqual(["alpha"]);
      expect(themes).toEqual({});
    });
  });
});
