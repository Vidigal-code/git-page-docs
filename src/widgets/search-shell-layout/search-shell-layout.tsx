import type { ReactNode, CSSProperties } from "react";
import { SiteFooter } from "@/shared/ui/site-footer";
import styles from "./search-shell-layout.module.css";

interface SearchShellLayoutProps {
  children: ReactNode;
  header: ReactNode;
  footerEnabled?: boolean;
  projectFooterUrl: string;
  language: string;
  style?: CSSProperties;
}

export function SearchShellLayout({
  children,
  header,
  footerEnabled = true,
  projectFooterUrl,
  language,
  style,
}: SearchShellLayoutProps) {
  return (
    <div className={styles.wrapper} style={style}>
      {header}
      <main className={styles.main}>{children}</main>
      {footerEnabled && <SiteFooter language={language} projectUrl={projectFooterUrl} />}
    </div>
  );
}
