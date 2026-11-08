"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchOfficialSiteConfig,
  SITE_CONFIG_DEFAULTS,
  loadStandaloneLayoutsAndThemes,
  readCachedShellThemes,
  writeCachedShellThemes,
  type LayoutsConfig,
  type OfficialSiteConfig,
  type ThemeTemplate,
} from "@/entities/docs";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";

export interface StandaloneShellConfig {
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
  siteConfig?: OfficialSiteConfig | null;
}

export function useStandaloneShellConfig(): {
  config: StandaloneShellConfig | null;
  siteConfig: OfficialSiteConfig;
  isLoading: boolean;
} {
  const [config, setConfig] = useState<StandaloneShellConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const siteConfig = useMemo<OfficialSiteConfig>(() => {
    const official = config?.siteConfig;
    return {
      ...SITE_CONFIG_DEFAULTS,
      ...official,
      SiteHeaderName: official?.SiteHeaderName ?? official?.name ?? SITE_CONFIG_DEFAULTS.SiteHeaderName,
    };
  }, [config?.siteConfig]);

  // Adopt the cached catalogue before the browser paints, so a page opened on
  // an explicit `?theme=` renders that theme in its first painted frame instead
  // of showing the default palette for the half second the remote fetch takes.
  // Seeding here rather than in useState keeps the hydration render identical
  // to the prerendered HTML.
  useIsomorphicLayoutEffect(() => {
    const cached = readCachedShellThemes();
    if (cached) {
      setConfig((current) => current ?? cached);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadStandaloneLayoutsAndThemes(), fetchOfficialSiteConfig()])
      .then(([layoutsResult, siteConfig]) => {
        if (cancelled) return;
        setConfig({ ...layoutsResult, siteConfig: siteConfig ?? undefined });
        writeCachedShellThemes(layoutsResult);
      })
      .catch(() => {
        // Keep whatever the cache provided rather than blanking the shell.
        if (!cancelled) {
          setConfig((current) => current);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, siteConfig, isLoading };
}
