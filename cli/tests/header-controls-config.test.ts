import { expect, it } from "vitest";
import { compactSiteIcons } from "@gitpagedocs/tools/config-format";
import { buildRootConfig } from "../builders/root-config-builder.mjs";

it("generates optional language, theme and focus icons while keeping text controls by default", () => {
  const site = compactSiteIcons(buildRootConfig().site);

  expect(site).toMatchObject({
    FocusMode: true,
    icons: {
      QuickNavigation: {
        reactIcon: false,
        tag: "FiSearch",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      LanguageSelector: {
        reactIcon: false,
        tag: "FiGlobe",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      ThemeSelector: {
        reactIcon: false,
        tag: "BsSunFill",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      FocusMode: {
        reactIcon: false,
        tag: "MdFullscreen",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
    },
  });
});

it("enables configurable focus actions, nested menus and native narration by default", () => {
  expect(buildRootConfig().site).toMatchObject({
    focusMode: {
      copyEnabled: true,
      downloadEnabled: true,
      sectionNavigationEnabled: true,
      documentNavigationEnabled: true,
    },
    nestedMenusEnabled: true,
    accessibility: {
      enabled: true,
      narration: { enabled: true, defaultRate: 1, defaultVolume: 1 },
    },
    mediaExclusivePlayback: true,
  });
});
