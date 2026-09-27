import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyRouteDefaults,
  compactSiteIcons,
  expandSiteIcons,
  factorRouteDefaults,
} from "../src/config-format";

const REPO = path.resolve(__dirname, "../..");
const readJson = (path: string) => JSON.parse(readFileSync(`${REPO}/${path}`, "utf8"));

const FLAT_SITE = {
  name: "Docs",
  IconMenuHeaderReactIcones: true,
  IconMenuHeaderReactIconesTag: "FaGithubAlt",
  IconMenuHeaderReactIconesTagColorDark: "White",
  IconMenuHeaderReactIconesTagColorLight: "black",
  IconMenuHeaderReactIconesTagSize: "25px",
  IconMenuHeaderDarkImg: "",
  IconMenuHeaderLightImg: "",
  IconCloseReactIcones: true,
  IconCloseReactIconesTag: "IoMdClose",
  IconCloseReactIconesTagColorDark: "White",
  IconCloseReactIconesTagColorLight: "black",
  IconCloseReactIconesTagSize: "20px",
  IconSearchReactIcones: true,
  IconSearchReactIconesTag: "FiSearch",
  IconSearchReactIconesTagColorDark: "White",
  IconSearchReactIconesTagColorLight: "black",
  IconSearchReactIconesTagSize: "25px",
  IconSearchDarkImg: "",
  IconSearchLightImg: "",
  ThemeDefault: "aurora",
};

describe("site icons", () => {
  it("writes the shared icon values once and only the differences per icon", () => {
    const compact = compactSiteIcons(FLAT_SITE) as Record<string, unknown>;
    expect(compact.name).toBe("Docs");
    expect(compact.ThemeDefault).toBe("aurora");
    expect(Object.keys(compact).some((key) => key.startsWith("Icon"))).toBe(false);
    expect(compact.icons).toEqual({
      defaults: { reactIcon: true, colorDark: "White", colorLight: "black", size: "25px", imgDark: "", imgLight: "" },
      MenuHeader: { tag: "FaGithubAlt" },
      Close: { tag: "IoMdClose", size: "20px", imgDark: null, imgLight: null },
      Search: { tag: "FiSearch" },
    });
  });

  it("expands back to exactly the flat keys", () => {
    expect(expandSiteIcons(compactSiteIcons(FLAT_SITE))).toEqual(FLAT_SITE);
  });

  it("keeps explicit flat keys over the compact form", () => {
    const site = { ...compactSiteIcons(FLAT_SITE), IconSearchReactIconesTag: "FiZoomIn" };
    expect((expandSiteIcons(site) as Record<string, unknown>).IconSearchReactIconesTag).toBe("FiZoomIn");
  });

  it("returns values that are not objects as they are", () => {
    expect(compactSiteIcons(undefined)).toBeUndefined();
    expect(expandSiteIcons(null)).toBeNull();
    expect(factorRouteDefaults(undefined)).toBeUndefined();
    expect(applyRouteDefaults("x")).toBe("x");
  });

  it("leaves sites without icons untouched", () => {
    const site = { name: "Plain" };
    expect(compactSiteIcons(site)).toBe(site);
    expect(expandSiteIcons(site)).toBe(site);
  });

  it("is how the generator stores gitpagedocs/config.json, and round-trips its flat form", () => {
    const stored = readJson("gitpagedocs/config.json").site;
    expect(Object.keys(stored).some((key) => key.startsWith("Icon"))).toBe(false);
    const flat = expandSiteIcons(stored);
    expect(Object.keys(flat).filter((key) => key.startsWith("Icon")).length).toBeGreaterThan(200);
    expect(expandSiteIcons(compactSiteIcons(flat))).toEqual(flat);
  });
});

describe("route defaults", () => {
  const md = (id: number, extra: Record<string, unknown> = {}) => ({
    id,
    title: { en: `Page ${id}` },
    path: { en: `docs/${id}.md` },
    titleCss: "font-size: 1.85rem;",
    fullscreenEnabled: true,
    marginTop: "",
    ...extra,
  });

  it("moves values every route shares into routeDefaults", () => {
    const config = { "routes-md": [md(1), md(2, { marginTop: "8px" })], "routes-video": [{ ...md(3), video: { pathVideo: "x" } }] };
    const factored = factorRouteDefaults(config) as Record<string, any>;
    expect(factored.routeDefaults).toEqual({ titleCss: "font-size: 1.85rem;", fullscreenEnabled: true });
    expect(factored["routes-md"][1]).toEqual({ id: 2, title: { en: "Page 2" }, path: { en: "docs/2.md" }, marginTop: "8px" });
    expect(applyRouteDefaults(factored)).toEqual(config);
  });

  it("never factors identity fields and needs at least two routes", () => {
    const single = { "routes-md": [md(1)] };
    expect(factorRouteDefaults(single)).toBe(single);
    const same = { "routes-md": [md(1, { title: { en: "Same" } }), md(2, { title: { en: "Same" } })] };
    expect((factorRouteDefaults(same) as Record<string, any>).routeDefaults).not.toHaveProperty("title");
  });

  it("gives explicit route values precedence over routeDefaults", () => {
    const config = { routeDefaults: { marginTop: "4px" }, "routes-md": [{ id: 1, marginTop: "9px" }, { id: 2 }] };
    const applied = applyRouteDefaults(config) as Record<string, any>;
    expect(applied["routes-md"]).toEqual([{ id: 1, marginTop: "9px" }, { id: 2, marginTop: "4px" }]);
    expect(applied).not.toHaveProperty("routeDefaults");
  });

  it("is how the generator stores version configs, and round-trips their full form", () => {
    const [latest] = readJson("gitpagedocs/config.json").VersionControl.versions;
    const stored = readJson(latest.PathConfig ?? latest.path);
    expect(stored.routeDefaults).toBeDefined();
    const full = applyRouteDefaults(stored);
    expect(applyRouteDefaults(factorRouteDefaults(full))).toEqual(full);
  });
});
