"use client";

import { useEffect, useState } from "react";
import styles from "./site-footer.module.css";

export type FooterDateMode = "browser" | "year" | "custom";

export interface FooterConfig {
  projectLabel: string;
  linkName: string;
  linkUrl: string;
  dateMode?: FooterDateMode;
  dateCustom?: string;
}

export interface SiteFooterProps {
  language: string;
  projectLabel: string;
  linkName: string;
  linkUrl: string;
  dateMode?: FooterDateMode;
  dateCustom?: string;
}

export function SiteFooter({
  language,
  projectLabel,
  linkName,
  linkUrl,
  dateMode = "browser",
  dateCustom = "",
}: SiteFooterProps) {
  const [dateText, setDateText] = useState("--/--/----");

  useEffect(() => {
    if (dateMode === "browser") {
      setDateText(new Date().toLocaleDateString());
    } else if (dateMode === "year") {
      setDateText(String(new Date().getFullYear()));
    } else {
      setDateText("");
    }
  }, [dateMode]);

  const showDate = dateMode === "custom" ? dateCustom : dateText;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.item}>
          {projectLabel}:{" "}
          <a className={styles.link} href={linkUrl} target="_blank" rel="noreferrer">
            {linkName}
          </a>
        </span>
        {showDate && (
          <span className={styles.item}>
            <span suppressHydrationWarning>{showDate}</span>
          </span>
        )}
      </div>
    </footer>
  );
}
