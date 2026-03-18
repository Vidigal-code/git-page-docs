import { loadRootConfig } from "@/entities/docs/server";
import { FALLBACK_HEADER_NAME, resolveHeaderName, resolveIconPath } from "@/shared/lib/resolve-site-assets";

interface RootSiteConfig {
  site?: {
    SiteHeaderName?: string;
    SiteIconPath?: string;
    name?: string;
  };
}

export interface LoadedSiteMetadata {
  siteName: string;
  iconPath: string;
}

export async function loadSiteMetadata(): Promise<LoadedSiteMetadata> {
  let siteName = FALLBACK_HEADER_NAME;
  let iconPath = "/icon.svg";

  try {
    const config = await loadRootConfig<RootSiteConfig>();
    siteName = resolveHeaderName(config?.site?.SiteHeaderName, config?.site?.name);
    const basePath = (process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH ?? "").trim();
    iconPath = resolveIconPath(config?.site?.SiteIconPath, basePath);
  } catch {
    // Keep static fallback metadata when config cannot be loaded.
  }

  return { siteName, iconPath };
}

export async function loadSiteName(): Promise<string> {
  const metadata = await loadSiteMetadata();
  return metadata.siteName;
}
