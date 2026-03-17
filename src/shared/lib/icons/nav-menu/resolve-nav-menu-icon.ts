import {
  createNavMenuIconResolver,
  hasNavMenuIconConfig,
  type NavMenuIconConfigInput,
  type ResolvedNavMenuIconConfig,
} from "./resolve-nav-menu-icon-factory";

export type { NavMenuIconConfigInput, ResolvedNavMenuIconConfig };

const resolveOpen = createNavMenuIconResolver("open");
const resolveClose = createNavMenuIconResolver("close");
const resolveMobileOpen = createNavMenuIconResolver("mobileOpen");
const resolveMobileClose = createNavMenuIconResolver("mobileClose");
const resolveBlockActive = createNavMenuIconResolver("blockActive");
const resolveBlockInactive = createNavMenuIconResolver("blockInactive");

export function resolveNavMenuOpenIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
): ResolvedNavMenuIconConfig {
  return resolveOpen(site, mode, basePath);
}

export function resolveNavMenuCloseIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
): ResolvedNavMenuIconConfig {
  return resolveClose(site, mode, basePath);
}

export function resolveNavMenuMobileOpenIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
): ResolvedNavMenuIconConfig {
  if (hasNavMenuIconConfig(site, "mobileOpen")) {
    return resolveMobileOpen(site, mode, basePath);
  }
  return resolveOpen(site, mode, basePath);
}

export function resolveNavMenuMobileCloseIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
): ResolvedNavMenuIconConfig {
  if (hasNavMenuIconConfig(site, "mobileClose")) {
    return resolveMobileClose(site, mode, basePath);
  }
  return resolveClose(site, mode, basePath);
}

export function resolveNavMenuBlockActiveIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
): ResolvedNavMenuIconConfig {
  return resolveBlockActive(site, mode, basePath);
}

export function resolveNavMenuBlockInactiveIconConfig(
  site: NavMenuIconConfigInput | undefined,
  mode: "dark" | "light",
  basePath: string,
): ResolvedNavMenuIconConfig {
  return resolveBlockInactive(site, mode, basePath);
}
