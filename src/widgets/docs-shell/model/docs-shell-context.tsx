"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { LoadedDocsData, LoadedPage } from "@/entities/docs";

export interface DocsShellContextValue {
  data: LoadedDocsData;
  language: string;
  currentPage: LoadedPage | undefined;
  labels: {
    menuOpenLabel: string;
    menuCloseLabel: string;
    previousLabel: string;
    nextLabel: string;
    browsePrevLabel: string;
    browseNextLabel: string;
    fullscreenExpandLabel: string;
    quickNavPlaceholder: string;
    navigateHintLabel: string;
    selectHintLabel: string;
    escHintLabel: string;
    closeHintLabel: string;
    noNavigationResults: string;
  };
  routeGuideConfig: {
    enabled: boolean;
  };
}

const DocsShellContext = createContext<DocsShellContextValue | null>(null);

export function DocsShellProvider({
  value,
  children,
}: {
  value: DocsShellContextValue;
  children: ReactNode;
}) {
  return <DocsShellContext.Provider value={value}>{children}</DocsShellContext.Provider>;
}

export function useDocsShellContext(): DocsShellContextValue {
  const ctx = useContext(DocsShellContext);
  if (!ctx) {
    throw new Error("useDocsShellContext must be used within DocsShellProvider");
  }
  return ctx;
}

export function useDocsShellContextOptional(): DocsShellContextValue | null {
  return useContext(DocsShellContext);
}
