import { useMemo } from "react";
import { getBasePath } from "@/shared/lib/base-path";
import { getLangMenuLabelFromMenu, type GitPageDocsConfig } from "@/entities/docs";
import {
    resolveNavMenuOpenIconConfig,
    resolveNavMenuCloseIconConfig,
    resolveNavMenuMobileOpenIconConfig,
    resolveNavMenuMobileCloseIconConfig,
    resolveNavMenuBlockActiveIconConfig,
    resolveNavMenuBlockInactiveIconConfig,
} from "@/shared/lib/resolve-site-assets";
import type { NavMenuConfig } from "./use-docs-shell-config";

export function useBuildNavMenuConfig(
    config: GitPageDocsConfig,
    mode: "dark" | "light",
    language: string,
): NavMenuConfig {
    return useMemo(() => {
        const site = config.site;
        const basePath = getBasePath();
        return {
            navMenuOpenIcon: resolveNavMenuOpenIconConfig(site, mode, basePath),
            navMenuCloseIcon: resolveNavMenuCloseIconConfig(site, mode, basePath),
            navMenuMobileOpenIcon: resolveNavMenuMobileOpenIconConfig(site, mode, basePath),
            navMenuMobileCloseIcon: resolveNavMenuMobileCloseIconConfig(site, mode, basePath),
            navMenuBlockActiveIcon: resolveNavMenuBlockActiveIconConfig(site, mode, basePath),
            navMenuBlockInactiveIcon: resolveNavMenuBlockInactiveIconConfig(site, mode, basePath),
            blockMenuOnNavLabelActive: getLangMenuLabelFromMenu(site.langmenu, language, "blockMenuOnNavActive", "Block menu on navigation"),
            blockMenuOnNavLabelInactive: getLangMenuLabelFromMenu(site.langmenu, language, "blockMenuOnNavInactive", "Allow menu on navigation"),
        };
    }, [config.site, mode, language]);
}
