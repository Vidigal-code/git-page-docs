import { useMemo } from "react";
import { getLanguageLabelFromMenu, getLangMenuLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
import { resolveTranslation } from "@/entities/docs/lib/i18n/resolve-translation";
import { buildVersionLinkOptions } from "@/entities/docs/lib/version-links";
import type { LayoutItem, LoadedDocsData, VersionEntry } from "@/entities/docs/model/types";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";

export interface DocsShellControlsConfig {
  fallbackProjectLink: string | undefined;
  projectLabel: string;
  useReactProjectLinkIcon: boolean;
  projectLinkReactIconTag: string | undefined;
  projectLinkReactIconStyle: React.CSSProperties;
  versionLinkOptionsWithLabels: { id: "branch" | "release" | "commit"; label: string; url: string }[];
  versionLinksLabel: string;
  useReactVersionLinksIcon: boolean;
  versionLinksIconTag: string | undefined;
  versionLinksIconStyle: React.CSSProperties;
  versionLinksIconImage: string | undefined;
  versionLinksIconImgWidth: number;
  versionLinksIconImgHeight: number;
  infoIconImgWidth: number;
  infoIconImgHeight: number;
  previewIconImgWidth: number;
  previewIconImgHeight: number;
  showInfoButton: boolean;
  updateDate: string;
  lastUpdateLabel: string;
  useReactInfoIcon: boolean;
  infoIconTag: string | undefined;
  infoIconStyle: React.CSSProperties;
  infoIconImage: string | undefined;
  showPreviewButton: boolean;
  previewProjectUrl: string;
  useReactPreviewIcon: boolean;
  previewIconTag: string | undefined;
  previewIconStyle: React.CSSProperties;
  previewIconImage: string | undefined;
  focusModeEnabled: boolean;
  focusModeLabel: string;
  activeNavigation: boolean;
  quickNavLabel: string;
  showVersionSelector: boolean;
  availableVersions: VersionEntry[];
  selectedVersionValue: string;
  versionLabel: string;
  isLanguageSelectVisible: boolean;
  availableLanguages: string[];
  language: string;
  languageLabelResolver: (lang: string) => string;
  hideThemeSelector: boolean;
  activeThemeId: string;
  layouts: LayoutItem[];
  canToggleMode: boolean;
  nextModeIsDark: boolean;
  darkModeLabel: string;
  lightModeLabel: string;
}

export function useDocsShellConfig(
  data: LoadedDocsData,
  activeLayout: { mode?: "dark" | "light" } | undefined,
  language: string,
  selectedVersionValue: string,
  activeThemeId: string,
  canToggleMode: boolean,
  nextModeIsDark: boolean,
) {
  const basePath = getBasePath();

  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, activeLayout?.mode ?? "dark", basePath),
    [data.config.site, activeLayout?.mode, basePath],
  );

  const versionLinkOptions = useMemo(() => buildVersionLinkOptions(data.activeVersion), [data.activeVersion]);
  const branchLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "branchLabel", "Branch");
  const releaseLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "releaseLabel", "Release");
  const commitLabel = getLangMenuLabelFromMenu(data.config.site.langmenu, language, "commitLabel", "Commit");

  const versionLinkOptionsWithLabels = useMemo(
    () =>
      versionLinkOptions.map((option) => ({
        ...option,
        label: option.id === "branch" ? branchLabel : option.id === "release" ? releaseLabel : commitLabel,
      })),
    [versionLinkOptions, branchLabel, releaseLabel, commitLabel],
  );

  const mode = activeLayout?.mode ?? "dark";
  const site = data.config.site;

  const controlsConfig: DocsShellControlsConfig = useMemo(
    () => ({
      fallbackProjectLink: data.activeVersion?.ProjectLink?.trim() || site.ProjectLink?.trim(),
      projectLabel: getLangMenuLabelFromMenu(site.langmenu, language, "projectLabel", "Project"),
      useReactProjectLinkIcon: Boolean(site.IconProjectLinkReactIcones),
      projectLinkReactIconTag: site.IconProjectLinkReactIconesTag,
      projectLinkReactIconStyle: {
        color: (mode === "dark" ? site.IconProjectLinkReactIconesTagColorDark : site.IconProjectLinkReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconProjectLinkReactIconesTagSize?.trim() || undefined,
      },
      versionLinkOptionsWithLabels,
      versionLinksLabel: getLangMenuLabelFromMenu(site.langmenu, language, "versionLinksLabel", "Repository links"),
      useReactVersionLinksIcon: Boolean(site.IconVersionLinksReactIcones),
      versionLinksIconTag: site.IconVersionLinksReactIconesTag,
      versionLinksIconStyle: {
        color: (mode === "dark" ? site.IconVersionLinksReactIconesTagColorDark : site.IconVersionLinksReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconVersionLinksReactIconesTagSize?.trim() || undefined,
      },
      versionLinksIconImage:
        (mode === "dark"
          ? site.IconVersionLinksDarkImg?.trim() || site.IconVersionLinksHeaderDark?.trim()
          : site.IconVersionLinksLightImg?.trim() || site.IconVersionLinksLight?.trim()) || undefined,
      versionLinksIconImgWidth: Number(site.IconVersionLinksImgWidth) || 20,
      versionLinksIconImgHeight: Number(site.IconVersionLinksImgHeight) || 20,
      infoIconImgWidth: Number(site.IconInfoHeaderMenuImgWidth) || 20,
      infoIconImgHeight: Number(site.IconInfoHeaderMenuImgHeight) || 20,
      previewIconImgWidth: Number(site.IconPreviewProjectLinkImgWidth) || 20,
      previewIconImgHeight: Number(site.IconPreviewProjectLinkImgHeight) || 20,
      showInfoButton: Boolean(data.activeVersion?.UpdateDate?.trim()),
      updateDate: data.activeVersion?.UpdateDate?.trim() ?? "",
      lastUpdateLabel: getLangMenuLabelFromMenu(site.langmenu, language, "lastUpdateVersionLabel", "Last update version"),
      useReactInfoIcon: Boolean(site.IconInfoHeaderMenuReactIcones),
      infoIconTag: site.IconInfoHeaderMenuReactIconesTag,
      infoIconStyle: {
        color: (mode === "dark" ? site.IconInfoHeaderMenuReactIconesTagColorDark : site.IconInfoHeaderMenuReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconInfoHeaderMenuReactIconesTagSize?.trim() || undefined,
      },
      infoIconImage:
        (mode === "dark"
          ? site.IconInfoHeaderMenuDarkImg?.trim() || site.IconInfoHeaderMenuHeaderDark?.trim()
          : site.IconInfoHeaderMenuLightImg?.trim() || site.IconInfoHeaderMenuLight?.trim()) || undefined,
      showPreviewButton: Boolean(data.activeVersion?.PreviewProject?.trim()),
      previewProjectUrl: data.activeVersion?.PreviewProject?.trim() ?? "",
      useReactPreviewIcon: Boolean(site.IconPreviewProjectLinkReactIcones),
      previewIconTag: site.IconPreviewProjectLinkReactIconesTag,
      previewIconStyle: {
        color: (mode === "dark" ? site.IconPreviewProjectLinkReactIconesTagColorDark : site.IconPreviewProjectLinkReactIconesTagColorLight)?.trim() || undefined,
        fontSize: site.IconPreviewProjectLinkReactIconesTagSize?.trim() || undefined,
      },
      previewIconImage:
        (mode === "dark"
          ? site.IconPreviewProjectLinkDarkImg?.trim() || site.IconPreviewProjectLinkHeaderDark?.trim()
          : site.IconPreviewProjectLinkLightImg?.trim() || site.IconPreviewProjectLinkLight?.trim()) || undefined,
      focusModeEnabled: Boolean(site.FocusMode),
      focusModeLabel: getLangMenuLabelFromMenu(site.langmenu, language, "focusMode", "Focus mode"),
      activeNavigation: Boolean(site.ActiveNavigation),
      quickNavLabel: getLangMenuLabelFromMenu(site.langmenu, language, "quickNavigation", "Ctrl+K"),
      showVersionSelector: data.availableVersions.length > 1,
      availableVersions: data.availableVersions,
      selectedVersionValue,
      versionLabel: getLangMenuLabelFromMenu(site.langmenu, language, "versionLabel", "Version"),
      isLanguageSelectVisible: data.availableLanguages.length > 1,
      availableLanguages: data.availableLanguages,
      language,
      languageLabelResolver: (lang: string) => getLanguageLabelFromMenu(site.langmenu, language, lang),
      hideThemeSelector: Boolean(site.HideThemeSelector),
      activeThemeId,
      layouts: data.layoutsConfig.layouts,
      canToggleMode,
      nextModeIsDark,
      darkModeLabel: getLangMenuLabelFromMenu(site.langmenu, language, "darkMode", "Dark mode"),
      lightModeLabel: getLangMenuLabelFromMenu(site.langmenu, language, "lightMode", "Light mode"),
    }),
    [
      data.activeVersion,
      data.availableVersions,
      data.availableLanguages,
      data.layoutsConfig.layouts,
      site,
      language,
      mode,
      versionLinkOptionsWithLabels,
      selectedVersionValue,
      activeThemeId,
      canToggleMode,
      nextModeIsDark,
    ],
  );

  return {
    headerIconConfig,
    controlsConfig,
    footerEnabled: data.config.site.FooterEnabled !== false,
  };
}
