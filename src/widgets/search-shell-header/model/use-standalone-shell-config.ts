"use client";

import { useEffect, useState } from "react";
import {
  fetchOfficialSiteConfig,
  loadStandaloneLayoutsAndThemes,
} from "@/entities/docs/api/load-remote-docs-data-client";
import type { LayoutsConfig, ThemeTemplate } from "@/entities/docs/model/types";

export interface StandaloneShellConfig {
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
  siteConfig?: {
    SiteHeaderName?: string;
    SiteIconPath?: string;
    name?: string;
  } | null;
}

export function useStandaloneShellConfig(): {
  config: StandaloneShellConfig | null;
  isLoading: boolean;
} {
  const [config, setConfig] = useState<StandaloneShellConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadStandaloneLayoutsAndThemes(), fetchOfficialSiteConfig()])
      .then(([layoutsResult, siteConfig]) => {
        if (!cancelled) {
          setConfig({
            ...layoutsResult,
            siteConfig: siteConfig ?? undefined,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConfig(null);
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

  return { config, isLoading };
}
