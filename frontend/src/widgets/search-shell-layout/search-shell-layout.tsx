"use client";

import type { ReactNode, CSSProperties } from "react";
import { SiteFooter, type FooterConfig, type FooterDateMode } from "@/shared/ui/site-footer";
import { useDocumentThemeVars } from "@/shared/lib/use-document-theme-vars";
import styles from "./search-shell-layout.module.css";

const DEFAULT_FOOTER_LABELS: Record<string, string> = {
  en: "Project",
  pt: "Projeto",
  es: "Proyecto",
};

export type { FooterConfig };

interface SearchShellLayoutProps {
  children: ReactNode;
  header: ReactNode;
  footerEnabled?: boolean;
  projectFooterUrl: string;
  language: string;
  style?: CSSProperties;
  footerConfig?: FooterConfig;
}

export function SearchShellLayout({
  children,
  header,
  footerEnabled = true,
  projectFooterUrl,
  language,
  style,
  footerConfig,
}: SearchShellLayoutProps) {
  // Keeps the window scrollbar (owned by <html>, outside this wrapper) on the
  // active palette across live theme switches.
  useDocumentThemeVars(style);
  const resolvedFooter = footerConfig ?? {
    projectLabel: DEFAULT_FOOTER_LABELS[language] ?? DEFAULT_FOOTER_LABELS.en,
    linkName: "GitPageDocs",
    linkUrl: projectFooterUrl,
    dateMode: "browser" as FooterDateMode,
    dateCustom: "",
  };

  return (
    <div className={styles.wrapper} style={style}>
      {header}
      <main className={styles.main}>{children}</main>
      {footerEnabled && (
        <SiteFooter
          language={language}
          projectLabel={resolvedFooter.projectLabel}
          linkName={resolvedFooter.linkName}
          linkUrl={resolvedFooter.linkUrl}
          dateMode={resolvedFooter.dateMode}
          dateCustom={resolvedFooter.dateCustom}
        />
      )}
    </div>
  );
}
