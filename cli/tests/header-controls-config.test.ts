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
      defaults: { reactIcon: true, size: "22px", colorDark: "currentColor", colorLight: "currentColor" },
      QuickNavigation: {
        tag: "LuSearch",
      },
      LanguageSelector: {
        tag: "SiGoogletranslate",
      },
      ThemeSelector: {
        tag: "LuPencil",
      },
      FocusMode: {
        tag: "LuBookOpen",
      },
      PdfDownload: {
        tag: "LuDownload",
      },
      PdfOpenInNewTab: {
        tag: "LuExternalLink",
      },
      DocumentPrevious: {
        tag: "LuChevronLeft",
      },
      DocumentNext: {
        tag: "LuChevronRight",
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
