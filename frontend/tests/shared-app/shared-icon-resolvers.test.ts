import { describe, expect, it } from "vitest";
import { DEFAULT_ICON_FALLBACK_URL } from "@/shared/config/icon-defaults";
import { FALLBACK_ICON_PATH, resolveIconPath } from "@/shared/lib/icons/resolve-icon-path";
import {
  FALLBACK_HEADER_NAME,
  resolveHeaderIconConfig,
  resolveHeaderName,
} from "@/shared/lib/icons/header/resolve-header-icon";
import { resolveRouteGuideIconConfig } from "@/shared/lib/icons/route-guide/resolve-route-guide-icon";
import {
  createNavMenuIconResolver,
  hasNavMenuIconConfig,
  type NavMenuIconConfigInput,
} from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon-factory";
import {
  resolveDocsLockIconConfig,
  resolveNavMenuBlockActiveIconConfig,
  resolveNavMenuBlockInactiveIconConfig,
  resolveNavMenuCloseIconConfig,
  resolveNavMenuMobileCloseIconConfig,
  resolveNavMenuMobileOpenIconConfig,
  resolveNavMenuOpenIconConfig,
  resolveSidebarCollapseIconConfig,
  resolveSidebarExpandIconConfig,
} from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon";
import { resolveAudioPlayerPopoverCloseIconConfig } from "@/shared/lib/icons/audio-popover/resolve-audio-popover-close-icon";
import {
  resolveAudioPlayerPopoverLoopOffIconConfig,
  resolveAudioPlayerPopoverLoopOnIconConfig,
  resolveAudioPlayerPopoverPauseIconConfig,
  resolveAudioPlayerPopoverPlayIconConfig,
  resolveAudioPlayerPopoverRestartIconConfig,
} from "@/shared/lib/icons/audio-popover/resolve-audio-popover-icons";
import {
  resolveAiChatCancelIconConfig,
  resolveAiChatClearChatIconConfig,
  resolveAiChatClearDataIconConfig,
  resolveAiChatCloseIconConfig,
  resolveAiChatCollapseIconConfig,
  resolveAiChatExpandIconConfig,
  resolveAiChatLockIconConfig,
  resolveAiChatOpenIconConfig,
  resolveAiChatSendIconConfig,
  resolveAiChatSettingsIconConfig,
  resolveAiChatTrashIconConfig,
  type ResolvedAiChatIconConfig,
} from "@/shared/lib/icons/ai-chat/resolve-ai-chat-icon";
import * as iconsBarrel from "@/shared/lib/icons";
import * as siteAssetsBarrel from "@/shared/lib/resolve-site-assets";
import * as navMenuBarrel from "@/shared/lib/resolve-nav-menu-icon";

const DEFAULTS_20 = { iconImgWidth: 20, iconImgHeight: 20 };

describe("resolveIconPath", () => {
  it("falls back to /icon.svg under the base path when no icon is configured", () => {
    expect(resolveIconPath(undefined, "")).toBe(FALLBACK_ICON_PATH);
    expect(resolveIconPath("   ", "/base")).toBe("/base/icon.svg");
  });

  it("returns remote URLs untouched", () => {
    expect(resolveIconPath("https://cdn.example/x.png", "/base")).toBe("https://cdn.example/x.png");
    expect(resolveIconPath(" http://cdn.example/x.png ", "/base")).toBe("http://cdn.example/x.png");
  });

  it("prefixes local paths with a slash and the base path", () => {
    expect(resolveIconPath("img/a.png", "")).toBe("/img/a.png");
    expect(resolveIconPath("/img/a.png", "/base")).toBe("/base/img/a.png");
    expect(resolveIconPath("img/a.png", "/base")).toBe("/base/img/a.png");
  });
});

describe("header icon", () => {
  it("resolves the header name with trimming and fallbacks", () => {
    expect(resolveHeaderName("  Custom ", "Site")).toBe("Custom");
    expect(resolveHeaderName("   ", " Site ")).toBe("Site");
    expect(resolveHeaderName(undefined, undefined)).toBe(FALLBACK_HEADER_NAME);
  });

  it("uses the GitHub react icon when there is no site config", () => {
    expect(resolveHeaderIconConfig(undefined, "dark", "/b")).toEqual({
      iconImage: "/b/icon.svg",
      headerName: FALLBACK_HEADER_NAME,
      useReactIcon: true,
      reactIconTag: "FaGithubAlt",
      reactIconStyle: {},
      ...DEFAULTS_20,
    });
  });

  it("picks the image for the active mode and disables the react icon when an image exists", () => {
    const site = { name: "Docs", IconImageMenuHeaderDarkImg: " dark.png ", IconImageMenuHeaderLightImg: "light.png" };
    expect(resolveHeaderIconConfig(site, "dark", "")).toMatchObject({
      iconImage: "/dark.png",
      headerName: "Docs",
      useReactIcon: false,
      reactIconTag: "FaGithubAlt",
    });
    expect(resolveHeaderIconConfig(site, "light", "/b")).toMatchObject({ iconImage: "/b/light.png", useReactIcon: false });
  });

  it("walks the legacy image keys: mode-specific, generic, then site icon", () => {
    expect(resolveHeaderIconConfig({ IconImageMenuHeaderDark: "legacy-dark.png" }, "dark", "")).toMatchObject({
      iconImage: "/legacy-dark.png",
    });
    expect(resolveHeaderIconConfig({ IconImageMenuHeaderLight: "legacy-light.png" }, "light", "")).toMatchObject({
      iconImage: "/legacy-light.png",
    });
    expect(resolveHeaderIconConfig({ IconImageMenuHeader: "generic.png" }, "dark", "")).toMatchObject({
      iconImage: "/generic.png",
    });
    expect(resolveHeaderIconConfig({ SiteIconPath: "site.png" }, "light", "")).toMatchObject({ iconImage: "/site.png" });
    expect(resolveHeaderIconConfig({}, "light", "")).toMatchObject({ iconImage: "/icon.svg", useReactIcon: true });
  });

  it("honors explicit react icon settings, colors per mode and numeric sizes", () => {
    const site = {
      IconImageMenuHeaderDarkImg: "dark.png",
      IconImageMenuHeaderReactIcones: true,
      IconImageMenuHeaderReactIconesTag: "FiBook",
      IconImageMenuHeaderReactIconesTagColorDark: " #fff ",
      IconImageMenuHeaderReactIconesTagColorLight: "#000",
      IconImageMenuHeaderReactIconesTagSize: "22px",
      IconImageMenuHeaderImgWidth: "32",
      IconImageMenuHeaderImgHeight: "abc",
    };
    expect(resolveHeaderIconConfig(site, "dark", "")).toMatchObject({
      useReactIcon: true,
      reactIconTag: "FiBook",
      reactIconStyle: { color: "#fff", fontSize: "22px" },
      iconImgWidth: 32,
      iconImgHeight: 20,
    });
    expect(resolveHeaderIconConfig(site, "light", "").reactIconStyle).toEqual({ color: "#000", fontSize: "22px" });
    expect(resolveHeaderIconConfig({ IconImageMenuHeaderReactIcones: false }, "dark", "").useReactIcon).toBe(false);
  });
});

describe("route guide icon", () => {
  it("has no react icon and the default image without a site config", () => {
    expect(resolveRouteGuideIconConfig(undefined, true, "/b")).toEqual({
      iconImage: "/b/icon.svg",
      useReactIcon: false,
      reactIconTag: undefined,
      reactIconStyle: {},
      ...DEFAULTS_20,
    });
  });

  it("only keeps remote images; local ones fall back to the site icon", () => {
    const site = { IconRouteGuideDarkImg: " https://cdn/x.png ", IconRouteGuideLightImg: "local.png" };
    expect(resolveRouteGuideIconConfig(site, true, "/b")).toMatchObject({ iconImage: "https://cdn/x.png", useReactIcon: false });
    expect(resolveRouteGuideIconConfig(site, false, "/b")).toMatchObject({ iconImage: "/b/icon.svg", useReactIcon: false });
    expect(resolveRouteGuideIconConfig({}, false, "/b")).toMatchObject({ iconImage: "/b/icon.svg", useReactIcon: true });
  });

  it("passes react icon tag, per-mode colors, size and explicit dimensions through", () => {
    const site = {
      IconRouteGuideReactIcones: true,
      IconRouteGuideReactIconesTag: "FiCompass",
      IconRouteGuideReactIconesTagColorDark: "#eee",
      IconRouteGuideReactIconesTagColorLight: " ",
      IconRouteGuideReactIconesTagSize: "1.2rem",
      IconRouteGuideImgWidth: 24,
      IconRouteGuideImgHeight: 18,
    };
    expect(resolveRouteGuideIconConfig(site, true, "")).toMatchObject({
      useReactIcon: true,
      reactIconTag: "FiCompass",
      reactIconStyle: { color: "#eee", fontSize: "1.2rem" },
      iconImgWidth: 24,
      iconImgHeight: 18,
    });
    expect(resolveRouteGuideIconConfig(site, false, "").reactIconStyle).toEqual({ color: undefined, fontSize: "1.2rem" });
  });
});

describe("nav menu icons", () => {
  const withoutSite = (resolver: (s: undefined, m: "dark", b: string) => unknown) => resolver(undefined, "dark", "/b");

  it.each([
    ["open", resolveNavMenuOpenIconConfig, "FaBars"],
    ["close", resolveNavMenuCloseIconConfig, "IoMdClose"],
    ["mobile open", resolveNavMenuMobileOpenIconConfig, "FaBars"],
    ["mobile close", resolveNavMenuMobileCloseIconConfig, "IoMdClose"],
    ["block active", resolveNavMenuBlockActiveIconConfig, "FiLock"],
    ["block inactive", resolveNavMenuBlockInactiveIconConfig, "FiUnlock"],
    ["sidebar collapse", resolveSidebarCollapseIconConfig, "FiChevronsLeft"],
    ["sidebar expand", resolveSidebarExpandIconConfig, "FiChevronsRight"],
    ["docs lock", resolveDocsLockIconConfig, "FiLock"],
  ])("%s falls back to a react icon and the default image without a site config", (_name, resolver, tag) => {
    expect(withoutSite(resolver)).toEqual({
      iconImage: DEFAULT_ICON_FALLBACK_URL,
      useReactIcon: true,
      reactIconTag: tag,
      reactIconStyle: {},
      ...DEFAULTS_20,
    });
  });

  it("reads the mode-specific image and trims configured values", () => {
    const site: NavMenuIconConfigInput = {
      IconNavMenuOpenDarkImg: " menu-dark.png ",
      IconNavMenuOpenLightImg: "menu-light.png",
      IconNavMenuOpenReactIconesTagColorDark: " red ",
      IconNavMenuOpenReactIconesTagColorLight: "blue",
      IconNavMenuOpenReactIconesTagSize: " 18px ",
      IconNavMenuOpenImgWidth: "28",
      IconNavMenuOpenImgHeight: 0,
    };
    expect(resolveNavMenuOpenIconConfig(site, "dark", "/b")).toEqual({
      iconImage: "/b/menu-dark.png",
      useReactIcon: false,
      reactIconTag: "FaBars",
      reactIconStyle: { color: "red", fontSize: "18px" },
      iconImgWidth: 28,
      iconImgHeight: 20,
    });
    expect(resolveNavMenuOpenIconConfig(site, "light", "/b")).toMatchObject({
      iconImage: "/b/menu-light.png",
      reactIconStyle: { color: "blue", fontSize: "18px" },
    });
  });

  it("respects an explicit react icon flag and custom tag even with an image", () => {
    const site: NavMenuIconConfigInput = {
      IconNavMenuCloseDarkImg: "x.png",
      IconNavMenuCloseReactIcones: true,
      IconNavMenuCloseReactIconesTag: "FiX",
    };
    expect(resolveNavMenuCloseIconConfig(site, "dark", "")).toMatchObject({ useReactIcon: true, reactIconTag: "FiX" });
    expect(resolveNavMenuCloseIconConfig({ IconNavMenuCloseReactIcones: false }, "dark", "")).toMatchObject({
      useReactIcon: false,
      iconImage: DEFAULT_ICON_FALLBACK_URL,
    });
  });

  it("uses the desktop config for mobile slots until a mobile-specific value exists", () => {
    const desktopOnly: NavMenuIconConfigInput = { IconNavMenuOpenReactIconesTag: "FiMenu", IconNavMenuCloseReactIconesTag: "FiX" };
    expect(resolveNavMenuMobileOpenIconConfig(desktopOnly, "dark", "").reactIconTag).toBe("FiMenu");
    expect(resolveNavMenuMobileCloseIconConfig(desktopOnly, "dark", "").reactIconTag).toBe("FiX");

    const withMobile: NavMenuIconConfigInput = { ...desktopOnly, IconNavMenuMobileOpenReactIconesTag: "FiGrid", IconNavMenuMobileCloseDarkImg: "mc.png" };
    expect(resolveNavMenuMobileOpenIconConfig(withMobile, "dark", "").reactIconTag).toBe("FiGrid");
    expect(resolveNavMenuMobileCloseIconConfig(withMobile, "dark", "/b")).toMatchObject({ iconImage: "/b/mc.png", reactIconTag: "IoMdClose" });
  });

  it("detects mobile overrides from any image, flag or tag but ignores blank strings", () => {
    expect(hasNavMenuIconConfig(undefined, "mobileOpen")).toBe(false);
    expect(hasNavMenuIconConfig({}, "mobileOpen")).toBe(false);
    expect(hasNavMenuIconConfig({ IconNavMenuMobileOpenLightImg: "   " }, "mobileOpen")).toBe(false);
    expect(hasNavMenuIconConfig({ IconNavMenuMobileOpenLightImg: "a.png" }, "mobileOpen")).toBe(true);
    expect(hasNavMenuIconConfig({ IconNavMenuMobileCloseDarkImg: "a.png" }, "mobileClose")).toBe(true);
    expect(hasNavMenuIconConfig({ IconNavMenuMobileCloseReactIcones: true }, "mobileClose")).toBe(true);
    expect(hasNavMenuIconConfig({ IconNavMenuMobileCloseReactIconesTag: "FiX" }, "mobileClose")).toBe(true);
  });

  it("rejects unknown icon keys at resolver creation", () => {
    expect(() => createNavMenuIconResolver("nope" as never)).toThrow(/Unknown nav menu icon key/);
  });
});

describe("audio popover icons", () => {
  it("close icon defaults and configured values", () => {
    expect(resolveAudioPlayerPopoverCloseIconConfig(undefined, "light", "/b")).toEqual({
      iconImage: DEFAULT_ICON_FALLBACK_URL,
      useReactIcon: true,
      reactIconTag: "IoMdClose",
      reactIconStyle: {},
      ...DEFAULTS_20,
    });
    const site = {
      IconAudioPlayerPopoverCloseDarkImg: " close-dark.png ",
      IconAudioPlayerPopoverCloseReactIconesTag: " FiX ",
      IconAudioPlayerPopoverCloseReactIconesTagColorDark: "#abc",
      IconAudioPlayerPopoverCloseReactIconesTagColorLight: "#def",
      IconAudioPlayerPopoverCloseReactIconesTagSize: "20px",
      IconAudioPlayerPopoverCloseImgWidth: 30,
      IconAudioPlayerPopoverCloseImgHeight: "31",
    };
    expect(resolveAudioPlayerPopoverCloseIconConfig(site, "dark", "/b")).toEqual({
      iconImage: "/b/close-dark.png",
      useReactIcon: false,
      reactIconTag: "FiX",
      reactIconStyle: { color: "#abc", fontSize: "20px" },
      iconImgWidth: 30,
      iconImgHeight: 31,
    });
    expect(resolveAudioPlayerPopoverCloseIconConfig(site, "light", "")).toMatchObject({
      iconImage: DEFAULT_ICON_FALLBACK_URL,
      useReactIcon: true,
      reactIconStyle: { color: "#def", fontSize: "20px" },
    });
    expect(
      resolveAudioPlayerPopoverCloseIconConfig({ IconAudioPlayerPopoverCloseReactIcones: false }, "light", "").useReactIcon,
    ).toBe(false);
  });

  it.each([
    ["play", resolveAudioPlayerPopoverPlayIconConfig, "CiPlay1", "IconAudioPlayerPopoverPlay"],
    ["pause", resolveAudioPlayerPopoverPauseIconConfig, "FaPause", "IconAudioPlayerPopoverPause"],
    ["restart", resolveAudioPlayerPopoverRestartIconConfig, "FiRefreshCw", "IconAudioPlayerPopoverRestart"],
    ["loop on", resolveAudioPlayerPopoverLoopOnIconConfig, "FiRepeat", "IconAudioPlayerPopoverLoopOn"],
    ["loop off", resolveAudioPlayerPopoverLoopOffIconConfig, "FiRepeat", "IconAudioPlayerPopoverLoopOff"],
  ])("%s resolves defaults and per-mode configuration", (_name, resolver, fallbackTag, prefix) => {
    expect(resolver(undefined, "dark", "/b")).toEqual({
      iconImage: DEFAULT_ICON_FALLBACK_URL,
      useReactIcon: true,
      reactIconTag: fallbackTag,
      reactIconStyle: {},
      ...DEFAULTS_20,
    });
    const site = {
      [`${prefix}DarkImg`]: " d.png ",
      [`${prefix}LightImg`]: "l.png",
      [`${prefix}ReactIconesTag`]: " FiZap ",
      [`${prefix}ReactIconesTagColorDark`]: "#111",
      [`${prefix}ReactIconesTagColorLight`]: "#222",
      [`${prefix}ReactIconesTagSize`]: "16px",
      [`${prefix}ImgWidth`]: "40",
      [`${prefix}ImgHeight`]: "x",
    };
    expect(resolver(site, "dark", "/b")).toEqual({
      iconImage: "/b/d.png",
      useReactIcon: false,
      reactIconTag: "FiZap",
      reactIconStyle: { color: "#111", fontSize: "16px" },
      iconImgWidth: 40,
      iconImgHeight: 20,
    });
    expect(resolver(site, "light", "")).toMatchObject({ iconImage: "/l.png", reactIconStyle: { color: "#222", fontSize: "16px" } });
    expect(resolver({ [`${prefix}ReactIcones`]: true, [`${prefix}DarkImg`]: "d.png" }, "dark", "").useReactIcon).toBe(true);
    expect(resolver({}, "dark", "")).toMatchObject({ useReactIcon: true, reactIconTag: fallbackTag, iconImage: DEFAULT_ICON_FALLBACK_URL });
  });
});

describe("ai chat icons", () => {
  type Resolver = (site: unknown, mode: "dark" | "light", basePath: string) => ResolvedAiChatIconConfig;
  const cases: Array<[string, Resolver, string, string]> = [
    ["open", resolveAiChatOpenIconConfig, "BsRobot", "IconAiChatOpen"],
    ["close", resolveAiChatCloseIconConfig, "IoMdClose", "IconAiChatClose"],
    ["settings", resolveAiChatSettingsIconConfig, "FiSettings", "IconAiChatSettings"],
    ["send", resolveAiChatSendIconConfig, "FiSend", "IconAiChatSend"],
    ["cancel", resolveAiChatCancelIconConfig, "FiXCircle", "IconAiChatCancel"],
    ["trash", resolveAiChatTrashIconConfig, "FiTrash2", "IconAiChatTrash"],
    ["clear chat", resolveAiChatClearChatIconConfig, "FiMessageSquare", "IconAiChatClearChat"],
    ["clear data", resolveAiChatClearDataIconConfig, "FiDatabase", "IconAiChatClearData"],
    ["expand", resolveAiChatExpandIconConfig, "FiMaximize2", "IconAiChatExpand"],
    ["lock", resolveAiChatLockIconConfig, "FiLock", "IconAiChatLock"],
    ["collapse", resolveAiChatCollapseIconConfig, "FiMinimize2", "IconAiChatCollapse"],
  ];

  it.each(cases)("%s falls back to its react icon without a site config", (_name, resolver, tag) => {
    expect(resolver(undefined, "dark", "/b")).toEqual({
      iconImage: DEFAULT_ICON_FALLBACK_URL,
      useReactIcon: true,
      reactIconTag: tag,
      reactIconStyle: {},
      ...DEFAULTS_20,
    });
    expect(resolver(null, "light", "")).toMatchObject({ reactIconTag: tag });
  });

  it.each(cases)("%s reads per-mode images, colors and sizes from the site config", (_name, resolver, tag, prefix) => {
    const site = {
      [`${prefix}DarkImg`]: "d.png",
      [`${prefix}LightImg`]: "l.png",
      [`${prefix}ReactIconesTag`]: "FiCustom",
      [`${prefix}ReactIconesTagColorDark`]: "#d",
      [`${prefix}ReactIconesTagColorLight`]: "#l",
      [`${prefix}ReactIconesTagSize`]: "24px",
      [`${prefix}ImgWidth`]: "36",
      [`${prefix}ImgHeight`]: "oops",
    };
    expect(resolver(site, "dark", "/b")).toEqual({
      iconImage: "/b/d.png",
      useReactIcon: false,
      reactIconTag: "FiCustom",
      reactIconStyle: { color: "#d", fontSize: "24px" },
      iconImgWidth: 36,
      iconImgHeight: 20,
    });
    expect(resolver(site, "light", "")).toMatchObject({ iconImage: "/l.png", reactIconStyle: { color: "#l", fontSize: "24px" } });
    expect(resolver({ [`${prefix}ReactIcones`]: true, [`${prefix}DarkImg`]: "d.png" }, "dark", "")).toMatchObject({
      useReactIcon: true,
      reactIconTag: tag,
    });
    expect(resolver({}, "dark", "")).toEqual({
      iconImage: DEFAULT_ICON_FALLBACK_URL,
      useReactIcon: true,
      reactIconTag: tag,
      reactIconStyle: { color: undefined, fontSize: undefined },
      ...DEFAULTS_20,
    });
  });
});

describe("barrels", () => {
  it("re-export the same implementations", () => {
    expect(iconsBarrel.resolveIconPath).toBe(resolveIconPath);
    expect(iconsBarrel.resolveHeaderIconConfig).toBe(resolveHeaderIconConfig);
    expect(iconsBarrel.resolveNavMenuOpenIconConfig).toBe(resolveNavMenuOpenIconConfig);
    expect(iconsBarrel.resolveAudioPlayerPopoverPlayIconConfig).toBe(resolveAudioPlayerPopoverPlayIconConfig);
    expect(siteAssetsBarrel.resolveHeaderIconConfig).toBe(resolveHeaderIconConfig);
    expect(siteAssetsBarrel.resolveSidebarExpandIconConfig).toBe(resolveSidebarExpandIconConfig);
    expect(siteAssetsBarrel.FALLBACK_HEADER_NAME).toBe(FALLBACK_HEADER_NAME);
    expect(navMenuBarrel.resolveNavMenuBlockActiveIconConfig).toBe(resolveNavMenuBlockActiveIconConfig);
    expect(navMenuBarrel.resolveNavMenuBlockInactiveIconConfig).toBe(resolveNavMenuBlockInactiveIconConfig);
  });
});
