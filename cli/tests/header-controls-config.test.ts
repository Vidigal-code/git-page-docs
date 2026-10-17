import { expect, it } from "vitest";
import { compactSiteIcons, expandSiteIcons } from "@gitpagedocs/tools/config-format";
import { buildRootConfig } from "../builders/root-config-builder.mjs";

it("generates icons for header controls, PDF actions and document navigation by default", () => {
  const site = compactSiteIcons(buildRootConfig().site);

  expect(expandSiteIcons(site)).toMatchObject({
    IconQuickNavigationReactIcones: true,
    IconLanguageSelectorReactIcones: true,
    IconThemeSelectorReactIcones: true,
    IconFocusModeReactIcones: true,
    IconPdfDownloadReactIcones: true,
    IconPdfOpenInNewTabReactIcones: true,
    IconDocumentPreviousReactIcones: true,
    IconDocumentNextReactIcones: true,
  });

  expect(site).toMatchObject({
    FocusMode: true,
    icons: {
      defaults: { reactIcon: true },
      QuickNavigation: {
        tag: "FiSearch",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      LanguageSelector: {
        tag: "FiGlobe",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      ThemeSelector: {
        tag: "BsSunFill",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      FocusMode: {
        tag: "MdFullscreen",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      PdfDownload: {
        tag: "FiDownload",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      PdfOpenInNewTab: {
        tag: "FiExternalLink",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      DocumentPrevious: {
        tag: "FiChevronLeft",
        size: "22px",
        colorDark: "currentColor",
        colorLight: "currentColor",
      },
      DocumentNext: {
        tag: "FiChevronRight",
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
