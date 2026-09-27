// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import {
  useBuildDocsControlsConfig,
  type UseBuildDocsControlsConfigArgs,
} from "@/widgets/docs-shell/model/use-build-docs-controls-config";
import { useDocsShellConfig } from "@/widgets/docs-shell/model/use-docs-shell-config";
import { INTRO, makeConfig, makeDocsData, makePages, makeSite, makeVersions } from "./fixtures";

afterEach(cleanup);

function baseArgs(overrides: Partial<UseBuildDocsControlsConfigArgs> = {}): UseBuildDocsControlsConfigArgs {
  return {
    data: makeDocsData(),
    activeLayout: { mode: "dark" },
    language: "en",
    selectedVersionValue: "v1",
    activeThemeId: "aurora-dark",
    canToggleMode: true,
    nextModeIsDark: false,
    currentPage: undefined,
    pageHasMarkdown: true,
    ...overrides,
  };
}

function controls(overrides: Partial<UseBuildDocsControlsConfigArgs> = {}) {
  return renderHook(() => useBuildDocsControlsConfig(baseArgs(overrides))).result.current;
}

describe("useBuildDocsControlsConfig", () => {
  it("labels the repository links and surfaces the active version metadata", () => {
    const config = controls();
    expect(config.versionLinkOptionsWithLabels).toEqual([
      { id: "branch", label: "Branch", url: "https://github.com/demo/docs/tree/main" },
      { id: "release", label: "Release", url: "https://github.com/demo/docs/releases/tag/v1" },
    ]);
    expect(config).toMatchObject({
      showInfoButton: true,
      updateDate: "2026-01-15",
      showPreviewButton: true,
      previewProjectUrl: "https://demo.example.com",
      showVersionSelector: true,
      selectedVersionValue: "v1",
      versionLabel: "Version",
      isLanguageSelectVisible: true,
      availableLanguages: ["en", "pt"],
      language: "en",
      hideThemeSelector: false,
      activeThemeId: "aurora-dark",
      canToggleMode: true,
      nextModeIsDark: false,
      quickNavLabel: "Ctrl+K",
      projectLabel: "Project",
      projectLinkReactIconTag: "FaGithubAlt",
      versionLinksIconTag: "FaCodeBranch",
      infoIconTag: "BsInfoSquareFill",
      previewIconTag: "CiGlobe",
      audioPlayIconTag: "CiPlay1",
      audioPauseIconTag: "FaPause",
    });
    expect(config.availableVersions.map((version) => version.id)).toEqual(["v1", "v2"]);
    expect(config.layouts.map((layout) => layout.id)).toEqual(["aurora-dark", "aurora-light", "mono-dark"]);
    expect(config.languageLabelResolver("pt")).toBe("Portuguese");
    expect(config.languageLabelResolver("es")).toBe("ES");
  });

  it("translates the link labels and icon tags from the site config", () => {
    const versions = makeVersions();
    const data = makeDocsData({
      config: makeConfig({
        site: makeSite({
          IconProjectLinkReactIconesTag: "FaGithub",
          langmenu: { en: { branchLabel: "Ramo", releaseLabel: "Lançamento", commitLabel: "Commit hash" } },
        }),
      }),
      activeVersion: { ...versions[0], commit: "https://github.com/demo/docs/commit/abc" },
    });
    const config = controls({ data });
    expect(config.versionLinkOptionsWithLabels.map((option) => option.label)).toEqual(["Ramo", "Lançamento", "Commit hash"]);
    expect(config.projectLinkReactIconTag).toBe("FaGithub");
  });

  it("falls back cleanly when the active version has no metadata", () => {
    const single = makeVersions().slice(1);
    const config = controls({
      data: makeDocsData({
        config: makeConfig({ site: makeSite({ ProjectLink: " https://github.com/demo/docs " }) }),
        availableVersions: single,
        activeVersion: undefined,
        activeVersionId: undefined,
      }),
    });
    expect(config).toMatchObject({
      versionLinkOptionsWithLabels: [],
      showInfoButton: false,
      updateDate: "",
      showPreviewButton: false,
      previewProjectUrl: "",
      showVersionSelector: false,
      fallbackProjectLink: "https://github.com/demo/docs",
    });

    const fromVersion = controls({
      data: makeDocsData({ activeVersion: { ...makeVersions()[0], ProjectLink: "https://example.com/version" } }),
    });
    expect(fromVersion.fallbackProjectLink).toBe("https://example.com/version");
    expect(controls().fallbackProjectLink).toBeUndefined();
  });

  it("gates focus mode on the site flag and the page having markdown", () => {
    const enabled = makeDocsData({ config: makeConfig({ site: makeSite({ FocusMode: true, ActiveNavigation: true }) }) });
    expect(controls({ data: enabled, pageHasMarkdown: true })).toMatchObject({ focusModeEnabled: true, activeNavigation: true });
    expect(controls({ data: enabled, pageHasMarkdown: false }).focusModeEnabled).toBe(false);
    expect(controls({ pageHasMarkdown: true })).toMatchObject({ focusModeEnabled: false, activeNavigation: false });
  });

  it("resolves icon styles, images and sizes per theme mode", () => {
    const data = makeDocsData({
      config: makeConfig({
        site: makeSite({
          IconProjectLinkReactIcones: true,
          IconProjectLinkReactIconesTagColorDark: "#111",
          IconProjectLinkReactIconesTagColorLight: "#eee",
          IconProjectLinkReactIconesTagSize: " 18px ",
          IconVersionLinksDarkImg: " dark.png ",
          IconVersionLinksLightImg: "   ",
          IconVersionLinksLight: "light-fallback.png",
          IconVersionLinksImgWidth: "32",
          IconVersionLinksImgHeight: "abc",
          IconInfoHeaderMenuHeaderDark: "info-dark.png",
        }),
      }),
    });
    const dark = controls({ data, activeLayout: { mode: "dark" } });
    expect(dark.useReactProjectLinkIcon).toBe(true);
    expect(dark.projectLinkReactIconStyle).toEqual({ color: "#111", fontSize: "18px" });
    expect(dark.versionLinksIconImage).toBe("dark.png");
    expect(dark.infoIconImage).toBe("info-dark.png");
    expect(dark.versionLinksIconImgWidth).toBe(32);
    expect(dark.versionLinksIconImgHeight).toBe(20);
    expect(dark.infoIconImgWidth).toBe(20);

    const light = controls({ data, activeLayout: { mode: "light" } });
    expect(light.projectLinkReactIconStyle).toEqual({ color: "#eee", fontSize: "18px" });
    expect(light.versionLinksIconImage).toBe("light-fallback.png");
    expect(light.infoIconImage).toBeUndefined();

    // No active layout means dark.
    expect(controls({ data, activeLayout: undefined }).versionLinksIconImage).toBe("dark.png");
  });

  it("exposes background audio from the site or the current page", () => {
    expect(controls()).toMatchObject({ showAudioPlayer: false, audioPlayerConfig: null, audioPopoverShowMinutes: true, audioPopoverHideSource: false });

    const siteAudio = makeDocsData({
      config: makeConfig({
        site: makeSite({
          audioPlayerEnabled: true,
          audioTracks: [{ url: "bg.mp3", type: "mp3" }],
          audioPopoverShowMinutes: false,
          audioPopoverHideSource: true,
          audioPopoverSourceCustomLabel: { en: "Track" },
        }),
      }),
    });
    const fromSite = controls({ data: siteAudio });
    expect(fromSite.showAudioPlayer).toBe(true);
    expect(fromSite.audioPlayerConfig?.tracks).toEqual([{ url: "bg.mp3", type: "mp3" }]);
    expect(fromSite).toMatchObject({ audioPopoverShowMinutes: false, audioPopoverHideSource: true, audioPopoverSourceCustomLabel: { en: "Track" } });
    expect(fromSite.audioPopoverCloseIcon).toEqual(expect.any(Object));

    const page = makePages()[0];
    const pageWithAudio = {
      ...page,
      md: { ...page.md!, config: { id: 1, path: { en: INTRO }, audio: { tracks: [{ url: "page.mp3", type: "mp3" }], loopEnabled: true } } },
    };
    const fromPage = controls({ currentPage: pageWithAudio });
    expect(fromPage.audioPlayerConfig).toMatchObject({ tracks: [{ url: "page.mp3", type: "mp3" }], loopEnabled: true });
  });

  it("memoises the config for identical inputs", () => {
    const args = baseArgs();
    const { result, rerender } = renderHook(({ language }) => useBuildDocsControlsConfig({ ...args, language }), {
      initialProps: { language: "en" },
    });
    const first = result.current;
    rerender({ language: "en" });
    expect(result.current).toBe(first);
    rerender({ language: "pt" });
    expect(result.current).not.toBe(first);
    expect(result.current.language).toBe("pt");
  });
});

describe("useDocsShellConfig", () => {
  function shellConfig(data = makeDocsData(), activeLayout: { mode?: "dark" | "light" } | undefined = { mode: "dark" }) {
    return renderHook(() => useDocsShellConfig({ data, activeLayout, language: "en", selectedVersionValue: "v1", activeThemeId: "aurora-dark", canToggleMode: true, nextModeIsDark: false, currentPage: undefined, pageHasMarkdown: true })).result.current;
  }

  it("assembles the header, controls, nav menu and footer config", () => {
    const config = shellConfig();
    expect(config.headerIconConfig).toEqual(expect.any(Object));
    expect(config.controlsConfig).toMatchObject({ language: "en", selectedVersionValue: "v1", activeThemeId: "aurora-dark" });
    expect(config.navMenuConfig.blockMenuOnNavLabelActive).toBe("Block menu on navigation");
    expect(config.footerEnabled).toBe(true);
    expect(config.footerConfig).toEqual({
      projectLabel: "Project",
      linkName: "GitPageDocs",
      linkUrl: "https://github.com/Vidigal-code/git-page-docs",
      dateMode: "browser",
      dateCustom: "",
    });
  });

  it("disables the footer only when the site says so and defaults the mode to dark", () => {
    const disabled = shellConfig(makeDocsData({ config: makeConfig({ site: makeSite({ FooterEnabled: false, FooterLinkName: "Docs", FooterDateMode: "year" }) }) }));
    expect(disabled.footerEnabled).toBe(false);
    expect(disabled.footerConfig).toMatchObject({ linkName: "Docs", dateMode: "year" });

    const withoutLayout = shellConfig(makeDocsData(), undefined);
    expect(withoutLayout.headerIconConfig).toEqual(shellConfig().headerIconConfig);
    expect(withoutLayout.navMenuConfig).toEqual(shellConfig().navMenuConfig);
  });
});
