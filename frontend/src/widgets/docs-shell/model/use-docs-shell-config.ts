import { useMemo } from "react";
import { buildFooterConfigFromData, type LoadedDocsData, type LoadedPage } from "@/entities/docs";
import { getBasePath } from "@/shared/lib/base-path";
import { resolveHeaderIconConfig } from "@/shared/lib/resolve-site-assets";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";
import type {
  DocsShellAudioConfig,
  DocsShellHeaderConfig,
  DocsShellThemeNavConfig,
  DocsShellVersionConfig,
} from "./docs-shell-config-types";
import { useBuildDocsControlsConfig } from "./use-build-docs-controls-config";
import { useBuildNavMenuConfig } from "./use-build-nav-menu-config";

/**
 * Everything the header controls render, assembled from the four config groups:
 * project/header links, version selector, theme and navigation toggles, audio player.
 */
export type DocsShellControlsConfig = DocsShellHeaderConfig &
  DocsShellVersionConfig &
  DocsShellThemeNavConfig &
  DocsShellAudioConfig;

export interface NavMenuConfig {
  navMenuOpenIcon: ResolvedNavMenuIconConfig;
  navMenuCloseIcon: ResolvedNavMenuIconConfig;
  navMenuMobileOpenIcon: ResolvedNavMenuIconConfig;
  navMenuMobileCloseIcon: ResolvedNavMenuIconConfig;
  navMenuBlockActiveIcon: ResolvedNavMenuIconConfig;
  navMenuBlockInactiveIcon: ResolvedNavMenuIconConfig;
  sidebarCollapseIcon: ResolvedNavMenuIconConfig;
  sidebarExpandIcon: ResolvedNavMenuIconConfig;
  blockMenuOnNavLabelActive: string;
  blockMenuOnNavLabelInactive: string;
}

export interface UseDocsShellConfigOptions {
  data: LoadedDocsData;
  activeLayout: { mode?: "dark" | "light" } | undefined;
  language: string;
  selectedVersionValue: string;
  activeThemeId: string;
  canToggleMode: boolean;
  nextModeIsDark: boolean;
  currentPage: LoadedPage | undefined;
  /** Whether the current page has markdown in the active language (gates focus mode). */
  pageHasMarkdown: boolean;
}

export function useDocsShellConfig({
  data,
  activeLayout,
  language,
  selectedVersionValue,
  activeThemeId,
  canToggleMode,
  nextModeIsDark,
  currentPage,
  pageHasMarkdown,
}: UseDocsShellConfigOptions) {
  const basePath = getBasePath();
  const mode = (activeLayout?.mode ?? "dark") as "dark" | "light";

  const headerIconConfig = useMemo(
    () => resolveHeaderIconConfig(data.config.site, mode, basePath),
    [data.config.site, mode, basePath],
  );

  const controlsConfig = useBuildDocsControlsConfig({
    data,
    activeLayout,
    language,
    selectedVersionValue,
    activeThemeId,
    canToggleMode,
    nextModeIsDark,
    currentPage,
    pageHasMarkdown,
  });

  const navMenuConfig = useBuildNavMenuConfig(data.config, mode, language);

  const footerConfig = useMemo(
    () => buildFooterConfigFromData(data, language),
    [data, language],
  );

  return {
    headerIconConfig,
    controlsConfig,
    navMenuConfig,
    footerEnabled: data.config.site.FooterEnabled !== false,
    footerConfig,
  };
}
