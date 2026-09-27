import { describe, it, expect, vi } from "vitest";
import {
  buildHeaderMenuTree,
  buildUnifiedHeaderMenuTree,
  flattenMenuTree,
  getBreadcrumbTrail,
  getPageIndexByPathClick,
  getUrlParamsForPathClick,
} from "@/widgets/docs-shell/model/menu-tree";
import type {
  GitPageDocsConfig,
  HeaderMenuItem,
  HeaderMenuLocalizedContent,
  LoadedDocsData,
  SiteConfig,
} from "@/entities/docs";

// The docs barrel also re-exports a .tsx React component that the node test
// runner does not transform. The menu tree only needs the pure menu helpers,
// so serve those (the real implementations) in place of the barrel.
vi.mock("@/entities/docs", async () => {
  const menu = await import("@/entities/docs/model/menu");
  const menuUtils = await import("@/entities/docs/model/menu-utils");
  return { ...menu, ...menuUtils };
});

const INTRO = "docs/intro.md";
const GUIDE = "docs/guide.md";
const REFERENCE = "docs/reference.md";

function makeData(config: Partial<GitPageDocsConfig> = {}): LoadedDocsData {
  // Only the langmenu labels matter for the menu tree; the rest of SiteConfig is irrelevant here.
  const site = {
    langmenu: {
      en: { titleHeaderMenuMd: "Docs", titleHeaderMenuHtml: "Pages", titleHeaderMenuVideo: "Videos" },
      pt: { titleHeaderMenuMd: "Documentos" },
    },
  } as unknown as SiteConfig;
  return {
    config: {
      site,
      routes: [
        { id: 1, path: { en: INTRO } },
        { id: 2, path: { en: GUIDE } },
        { id: 3, path: { en: REFERENCE } },
      ],
      "menus-header": [],
      ...config,
    },
    docs: [],
    pages: [],
    pathToPageMap: {
      [INTRO]: { pageIndex: 0, contentType: "md" },
      [GUIDE]: { pageIndex: 1, contentType: "md" },
      [REFERENCE]: { pageIndex: 2, contentType: "md" },
    },
    availableVersions: [],
    activeRepository: { source: "local" },
    availableLanguages: ["en", "pt"],
    layoutsConfig: { layouts: [] },
    themes: {},
  };
}

const one = (id: number, title: string, pathClick = ""): HeaderMenuItem[] => [{ id, en: { title, "path-click": pathClick } }];

const NESTED_MD: HeaderMenuItem[] = [
  {
    id: 1,
    en: { title: "Guide", "path-click": "" },
    submenus: [
      {
        id: 2,
        en: { title: "Install", "path-click": INTRO },
        submenus: [{ id: 3, en: { title: "Windows", "path-click": GUIDE } }],
      },
    ],
  },
];

const HTML_MENUS: HeaderMenuItem[] = one(20, "Landing", REFERENCE);

describe("buildHeaderMenuTree", () => {
  it("builds one root node per menu and marks the current page active", () => {
    const menus: HeaderMenuItem[] = [...one(1, "Intro", INTRO), ...one(2, "Guide", GUIDE)];
    expect(buildHeaderMenuTree(menus, makeData(), "en", 1)).toEqual([
      { key: "Intro-1", id: 1, title: "Intro", pathClick: INTRO, active: false, level: 0, searchLabel: "Intro", ancestorKeys: [], children: [] },
      { key: "Guide-2", id: 2, title: "Guide", pathClick: GUIDE, active: true, level: 0, searchLabel: "Guide", ancestorKeys: [], children: [] },
    ]);
  });

  it("falls back to a generic title and an empty path when the language entry is missing", () => {
    const menus: HeaderMenuItem[] = [{ id: 9, pt: { title: "Somente PT", "path-click": INTRO } }];
    expect(buildHeaderMenuTree(menus, makeData(), "en", 0)).toEqual([
      { key: "Menu-9", id: 9, title: "Menu", pathClick: "", active: false, level: 0, searchLabel: "Menu", ancestorKeys: [], children: [] },
    ]);
  });

  it("nests item-level submenus with trail-based keys, levels and ancestor keys", () => {
    const [root] = buildHeaderMenuTree(NESTED_MD, makeData(), "en", 1);
    expect(root).toMatchObject({ key: "Guide-1", level: 0, ancestorKeys: [], searchLabel: "Guide", active: false });
    expect(root.children).toHaveLength(1);
    const [install] = root.children;
    expect(install).toMatchObject({
      key: "Guide-Install-2",
      level: 1,
      ancestorKeys: ["Guide-1"],
      searchLabel: "Guide / Install",
      active: false,
    });
    const [windows] = install.children;
    expect(windows).toMatchObject({
      key: "Guide-Install-Windows-3",
      level: 2,
      ancestorKeys: ["Guide-1", "Guide-Install-2"],
      searchLabel: "Guide / Install / Windows",
      active: true,
      children: [],
    });
  });

  it("nests language-level submenus with level-indexed keys", () => {
    const menus: HeaderMenuItem[] = [
      {
        id: 4,
        en: {
          title: "API",
          "path-click": "",
          submenus: [
            { title: "Auth", "path-click": INTRO, submenus: [{ title: "Tokens", "path-click": GUIDE }] },
            // Legacy configs may omit title/path-click on localized submenus.
            { submenus: [{ title: "Leaf", "path-click": REFERENCE }] } as unknown as HeaderMenuLocalizedContent,
          ],
        },
      },
    ];
    const [api] = buildHeaderMenuTree(menus, makeData(), "en", 1);
    expect(api).toMatchObject({ key: "API-4", level: 0, ancestorKeys: [] });
    expect(api.children).toHaveLength(2);

    const [auth, untitled] = api.children;
    expect(auth).toMatchObject({
      key: "4-l1-0",
      id: 0,
      title: "Auth",
      pathClick: INTRO,
      level: 1,
      ancestorKeys: ["API-4"],
      searchLabel: "API / Auth",
      active: false,
    });
    expect(auth.children).toEqual([
      {
        key: "4-l1-0-l2-0",
        id: 0,
        title: "Tokens",
        pathClick: GUIDE,
        active: true,
        level: 2,
        ancestorKeys: ["API-4", "4-l1-0"],
        searchLabel: "API / Auth / Tokens",
        children: [],
      },
    ]);
    expect(untitled).toMatchObject({ key: "4-l1-1", id: 1, title: "Menu", pathClick: "", searchLabel: "API / Menu" });
    expect(untitled.children.map((node) => node.key)).toEqual(["4-l1-1-l2-0"]);
  });

  it("lists item-level submenus before language-level submenus", () => {
    const menus: HeaderMenuItem[] = [
      {
        id: 5,
        en: { title: "Mixed", "path-click": "", submenus: [{ title: "Lang", "path-click": INTRO }] },
        submenus: one(6, "Item", GUIDE),
      },
    ];
    const [mixed] = buildHeaderMenuTree(menus, makeData(), "en", 0);
    expect(mixed.children.map((node) => node.key)).toEqual(["Mixed-Item-6", "5-l1-0"]);
  });

  describe("isPathAllowed", () => {
    const denyGuide = (pathClick: string) => pathClick !== GUIDE;

    it("drops leaves whose path is denied and always keeps empty paths", () => {
      const menus: HeaderMenuItem[] = [...one(1, "Intro", INTRO), ...one(2, "Guide", GUIDE), ...one(3, "Group")];
      const tree = buildHeaderMenuTree(menus, makeData(), "en", 0, { isPathAllowed: denyGuide });
      expect(tree.map((node) => node.key)).toEqual(["Intro-1", "Group-3"]);
    });

    it("keeps a denied parent when at least one child survives", () => {
      const menus: HeaderMenuItem[] = [
        { id: 1, en: { title: "Parent", "path-click": GUIDE }, submenus: [...one(2, "Denied", GUIDE), ...one(3, "Allowed", INTRO)] },
      ];
      const tree = buildHeaderMenuTree(menus, makeData(), "en", 0, { isPathAllowed: denyGuide });
      expect(tree).toHaveLength(1);
      expect(tree[0].pathClick).toBe(GUIDE);
      expect(tree[0].children.map((node) => node.key)).toEqual(["Parent-Allowed-3"]);
    });

    it("drops a denied parent whose children are all denied", () => {
      const menus: HeaderMenuItem[] = [{ id: 1, en: { title: "Parent", "path-click": GUIDE }, submenus: one(2, "Child", GUIDE) }];
      expect(buildHeaderMenuTree(menus, makeData(), "en", 0, { isPathAllowed: denyGuide })).toEqual([]);
    });

    it("applies the same rule to language-level submenus, keeping original indexes in keys", () => {
      const menus: HeaderMenuItem[] = [
        {
          id: 4,
          en: {
            title: "API",
            "path-click": "",
            submenus: [
              { title: "Denied", "path-click": GUIDE },
              { title: "Kept", "path-click": INTRO },
              { title: "Group", "path-click": GUIDE, submenus: [{ title: "Child", "path-click": INTRO }] },
            ],
          },
        },
      ];
      const [api] = buildHeaderMenuTree(menus, makeData(), "en", 0, { isPathAllowed: denyGuide });
      expect(api.children.map((node) => node.key)).toEqual(["4-l1-1", "4-l1-2"]);
      expect(api.children[1].children.map((node) => node.key)).toEqual(["4-l1-2-l2-0"]);
    });
  });
});

describe("buildUnifiedHeaderMenuTree", () => {
  const MD_MENUS = one(1, "Intro", INTRO);

  it("renders a single section without section headers, at level 0", () => {
    expect(buildUnifiedHeaderMenuTree(makeData({ "menus-header-md": MD_MENUS }), "en", 0)).toEqual([
      { key: "Intro-1", id: 1, title: "Intro", pathClick: INTRO, active: true, level: 0, searchLabel: "Intro", ancestorKeys: [], children: [] },
    ]);
  });

  it("falls back to menus-header when menus-header-md is absent", () => {
    const tree = buildUnifiedHeaderMenuTree(makeData({ "menus-header": MD_MENUS }), "en", 0);
    expect(tree.map((node) => node.key)).toEqual(["Intro-1"]);
  });

  it("returns an empty tree when no section has menus", () => {
    expect(buildUnifiedHeaderMenuTree(makeData(), "en", 0)).toEqual([]);
    expect(buildUnifiedHeaderMenuTree(makeData({ "menus-header-html": [] }), "en", 0)).toEqual([]);
  });

  it("inserts a section header row before each section when more than one section exists", () => {
    const tree = buildUnifiedHeaderMenuTree(makeData({ "menus-header-md": MD_MENUS, "menus-header-html": HTML_MENUS }), "en", 0);
    expect(tree).toEqual([
      {
        key: "section-md",
        id: -1,
        title: "Docs",
        pathClick: "",
        active: false,
        level: 0,
        searchLabel: "Docs",
        ancestorKeys: [],
        children: [],
        isSectionHeader: true,
      },
      { key: "Intro-1", id: 1, title: "Intro", pathClick: INTRO, active: true, level: 1, searchLabel: "Intro", ancestorKeys: [], children: [] },
      {
        key: "section-html",
        id: -1,
        title: "Pages",
        pathClick: "",
        active: false,
        level: 0,
        searchLabel: "Pages",
        ancestorKeys: [],
        children: [],
        isSectionHeader: true,
      },
      { key: "Landing-20", id: 20, title: "Landing", pathClick: REFERENCE, active: false, level: 1, searchLabel: "Landing", ancestorKeys: [], children: [] },
    ]);
  });

  it("treats section headers as sibling rows, not hierarchy parents", () => {
    const tree = buildUnifiedHeaderMenuTree(makeData({ "menus-header-md": NESTED_MD, "menus-header-html": HTML_MENUS }), "en", 0);
    expect(tree[0]).toMatchObject({ key: "section-md", isSectionHeader: true, ancestorKeys: [], children: [] });
    const guide = tree[1];
    // The key, search label and ancestor keys start fresh: no "Docs" prefix, no "section-md" ancestor.
    expect(guide).toMatchObject({ key: "Guide-1", level: 1, ancestorKeys: [], searchLabel: "Guide" });
    expect(guide.children[0]).toMatchObject({
      key: "Guide-Install-2",
      level: 2,
      ancestorKeys: ["Guide-1"],
      searchLabel: "Guide / Install",
    });
    expect(guide.children[0].children[0]).toMatchObject({
      key: "Guide-Install-Windows-3",
      level: 3,
      ancestorKeys: ["Guide-1", "Guide-Install-2"],
    });
  });

  it("orders sections by the default hierarchy (md, source-viewer, html, video, audio)", () => {
    const data = makeData({
      "menus-header-audio": one(50, "A"),
      "menus-header-video": one(40, "V"),
      "menus-header-html": one(30, "H"),
      "menus-header-source-viewer": one(20, "S"),
      "menus-header-md": one(10, "M"),
    });
    expect(buildUnifiedHeaderMenuTree(data, "en", 0).map((node) => node.key)).toEqual([
      "section-md",
      "M-10",
      "section-source-viewer",
      "S-20",
      "section-html",
      "H-30",
      "section-video",
      "V-40",
      "section-audio",
      "A-50",
    ]);
  });

  it("honours a custom hierarchyMenu order", () => {
    const data = makeData({
      "menus-header-md": MD_MENUS,
      "menus-header-html": HTML_MENUS,
      hierarchyMenu: { html: 0, md: 1, video: 2 },
    });
    expect(buildUnifiedHeaderMenuTree(data, "en", 0).map((node) => node.key)).toEqual([
      "section-html",
      "Landing-20",
      "section-md",
      "Intro-1",
    ]);
  });

  it("resolves section labels from the active language, then English, then the label key", () => {
    const data = makeData({
      "menus-header-md": MD_MENUS,
      "menus-header-html": HTML_MENUS,
      "menus-header-video": one(40, "V"),
      "menus-header-audio": one(50, "A"),
    });
    const labelsFor = (language: string) =>
      buildUnifiedHeaderMenuTree(data, language, 0)
        .filter((node) => node.isSectionHeader)
        .map((node) => node.title);
    expect(labelsFor("pt")).toEqual(["Documentos", "Pages", "Videos", "titleHeaderMenuAudio"]);
    expect(labelsFor("en")).toEqual(["Docs", "Pages", "Videos", "titleHeaderMenuAudio"]);
    expect(labelsFor("fr")).toEqual(["Docs", "Pages", "Videos", "titleHeaderMenuAudio"]);
  });

  it("removes the section header when every node of that section is filtered out", () => {
    const data = makeData({ "menus-header-md": MD_MENUS, "menus-header-html": HTML_MENUS });
    const tree = buildUnifiedHeaderMenuTree(data, "en", 0, (pathClick) => pathClick !== REFERENCE);
    expect(tree.map((node) => node.key)).toEqual(["section-md", "Intro-1"]);
  });

  it("returns an empty tree when every section is filtered out", () => {
    const data = makeData({ "menus-header-md": MD_MENUS, "menus-header-html": HTML_MENUS });
    expect(buildUnifiedHeaderMenuTree(data, "en", 0, () => false)).toEqual([]);
  });
});

describe("flattenMenuTree", () => {
  it("returns an empty list for an empty tree", () => {
    expect(flattenMenuTree([])).toEqual([]);
  });

  it("flattens depth-first, dropping children and the section flag", () => {
    const tree = buildUnifiedHeaderMenuTree(makeData({ "menus-header-md": NESTED_MD, "menus-header-html": HTML_MENUS }), "en", 0);
    const flat = flattenMenuTree(tree);
    expect(flat.map((entry) => entry.key)).toEqual([
      "section-md",
      "Guide-1",
      "Guide-Install-2",
      "Guide-Install-Windows-3",
      "section-html",
      "Landing-20",
    ]);
    expect(flat[1]).toEqual({
      key: "Guide-1",
      id: 1,
      title: "Guide",
      pathClick: "",
      active: false,
      level: 1,
      searchLabel: "Guide",
      ancestorKeys: [],
    });
    for (const entry of flat) {
      expect(entry).not.toHaveProperty("children");
      expect(entry).not.toHaveProperty("isSectionHeader");
    }
  });
});

describe("re-exported menu helpers", () => {
  it("exposes the entity helpers through the widget model", () => {
    const data = makeData();
    const tree = buildHeaderMenuTree(NESTED_MD, data, "en", 0);
    expect(getBreadcrumbTrail(tree, GUIDE).map((item) => item.title)).toEqual(["Guide", "Install", "Windows"]);
    expect(getPageIndexByPathClick(data, GUIDE)).toBe(1);
    expect(getUrlParamsForPathClick(data, GUIDE, "en", new URLSearchParams()).toString()).toBe("menu=en&name=guide");
  });
});
