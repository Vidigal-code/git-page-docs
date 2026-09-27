import { describe, expectTypeOf, it } from "vitest";
import type { IconConfigFields, SiteConfig, StandardIconName } from "@/entities/docs/model/types/site";
import type { HeaderIconConfigInput } from "@/shared/lib/icons/header/resolve-header-icon";
import type { NavMenuIconConfigInput } from "@/shared/lib/icons/nav-menu/resolve-nav-menu-icon-factory";
import type { AudioPlayerPopoverCloseIconConfigInput } from "@/shared/lib/icons/audio-popover/resolve-audio-popover-close-icon";
import type { AudioPlayerPopoverIconsConfigInput } from "@/shared/lib/icons/audio-popover/resolve-audio-popover-icons";

/** Flattens an intersection into one object type so `toEqualTypeOf` compares members, not shape. */
type Flat<T> = { [K in keyof T]: T[K] };

// Type-level contract (checked by `tsc -p frontend/tsconfig.json`): the icon groups
// SiteConfig now takes from IconConfigFields keep the key names, optionality and
// value types the hand-written fields had, and the resolver inputs stay subsets of it.
describe("SiteConfig icon field groups", () => {
  it("keeps the nine standard fields of a converted group with their original types", () => {
    expectTypeOf<SiteConfig["IconSidebarCollapseLightImg"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseDarkImg"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseReactIcones"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseReactIconesTag"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseReactIconesTagColorDark"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseReactIconesTagColorLight"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseReactIconesTagSize"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseImgWidth"]>().toEqualTypeOf<string | number | undefined>();
    expectTypeOf<SiteConfig["IconSidebarCollapseImgHeight"]>().toEqualTypeOf<string | number | undefined>();
  });

  it("declares every Icon* field as optional", () => {
    type IconKeys = Extract<keyof SiteConfig, `Icon${string}`>;
    expectTypeOf<Pick<SiteConfig, IconKeys>>().toEqualTypeOf<Partial<Pick<SiteConfig, IconKeys>>>();
  });

  it("exposes representative keys from every converted family", () => {
    expectTypeOf<SiteConfig>().toHaveProperty("IconImageMenuHeaderImgWidth");
    expectTypeOf<SiteConfig>().toHaveProperty("IconProjectLinkLightImg");
    expectTypeOf<SiteConfig>().toHaveProperty("IconPreviewProjectLinkReactIconesTagColorLight");
    expectTypeOf<SiteConfig>().toHaveProperty("IconNavMenuMobileOpenReactIconesTag");
    expectTypeOf<SiteConfig>().toHaveProperty("IconNavMenuBlockInactiveReactIcones");
    expectTypeOf<SiteConfig>().toHaveProperty("IconDocsLockImgHeight");
    expectTypeOf<SiteConfig>().toHaveProperty("IconAudioPlayerPopoverCloseDarkImg");
    expectTypeOf<SiteConfig>().toHaveProperty("IconAudioPlayerPopoverLoopOffDarkImg");
    expectTypeOf<SiteConfig>().toHaveProperty("IconAiChatCollapseReactIconesTagSize");
    // Legacy aliases declared beside the converted groups are still there.
    expectTypeOf<SiteConfig["IconImageMenuHeaderLight"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig["IconVersionLinksHeaderDark"]>().toEqualTypeOf<string | undefined>();
    // Slots that were never declared did not sneak in.
    expectTypeOf<SiteConfig>().not.toHaveProperty("IconAiChatLockLightImg");
    expectTypeOf<StandardIconName>().not.toExtend<"AiChatLock">();
  });

  it("leaves the groups that never had the standard shape untouched", () => {
    expectTypeOf<SiteConfig["IconRouteGuideImgWidth"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SiteConfig["IconRouteGuideImgHeight"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SiteConfig["IconAudioPlayReactIcones"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<SiteConfig["IconAudioPauseReactIconesTag"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<SiteConfig>().not.toHaveProperty("IconAudioPlayLightImg");
  });

  it("builds a single group from the generic with the standard nine fields", () => {
    type Group = IconConfigFields<"SidebarCollapse">;
    expectTypeOf<keyof Group>().toEqualTypeOf<
      | "IconSidebarCollapseLightImg"
      | "IconSidebarCollapseDarkImg"
      | "IconSidebarCollapseReactIcones"
      | "IconSidebarCollapseReactIconesTag"
      | "IconSidebarCollapseReactIconesTagColorDark"
      | "IconSidebarCollapseReactIconesTagColorLight"
      | "IconSidebarCollapseReactIconesTagSize"
      | "IconSidebarCollapseImgWidth"
      | "IconSidebarCollapseImgHeight"
    >();
    expectTypeOf<Group["IconSidebarCollapseReactIcones"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Group["IconSidebarCollapseImgWidth"]>().toEqualTypeOf<string | number | undefined>();
  });

  it("keeps the resolver inputs as exact subsets of SiteConfig", () => {
    expectTypeOf<Flat<Pick<SiteConfig, keyof NavMenuIconConfigInput>>>().toEqualTypeOf<Flat<NavMenuIconConfigInput>>();
    expectTypeOf<Flat<Pick<SiteConfig, keyof AudioPlayerPopoverIconsConfigInput>>>().toEqualTypeOf<
      Flat<AudioPlayerPopoverIconsConfigInput>
    >();
    expectTypeOf<Flat<Pick<SiteConfig, keyof AudioPlayerPopoverCloseIconConfigInput>>>().toEqualTypeOf<
      Flat<AudioPlayerPopoverCloseIconConfigInput>
    >();
    // The header input adds optional name/path fields, so it is a supertype; its icon group still matches.
    type HeaderIconGroup = IconConfigFields<"ImageMenuHeader">;
    expectTypeOf<Flat<Pick<SiteConfig, keyof HeaderIconGroup>>>().toEqualTypeOf<Flat<HeaderIconGroup>>();
    expectTypeOf<SiteConfig>().toExtend<NavMenuIconConfigInput>();
    expectTypeOf<SiteConfig>().toExtend<AudioPlayerPopoverIconsConfigInput>();
    expectTypeOf<SiteConfig>().toExtend<AudioPlayerPopoverCloseIconConfigInput>();
    expectTypeOf<SiteConfig>().toExtend<HeaderIconConfigInput>();
  });
});
