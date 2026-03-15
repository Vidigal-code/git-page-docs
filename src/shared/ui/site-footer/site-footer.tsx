"use client";

import { useEffect, useState } from "react";
import styles from "./site-footer.module.css";

interface SiteFooterProps {
  language: string;
  projectUrl: string;
}

const COPY = {
  en: {
    project: "Project",
    date: "Browser date",
  },
  pt: {
    project: "Projeto",
    date: "Data do navegador",
  },
  es: {
    project: "Proyecto",
    date: "Fecha del navegador",
  },
} as const;

function resolveLanguage(language: string): keyof typeof COPY {
  return language === "pt" || language === "es" ? language : "en";
}

export function SiteFooter({ language, projectUrl }: SiteFooterProps) {
  const lang = resolveLanguage(language);
  const copy = COPY[lang];
  const [browserDate, setBrowserDate] = useState("--/--/----");

  useEffect(() => {
    setBrowserDate(new Date().toLocaleDateString());
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.item}>
          {copy.project}:{" "}
          <a className={styles.link} href={projectUrl} target="_blank" rel="noreferrer">
            git-page-docs
          </a>
        </span>
        <span className={styles.item}>
          <span suppressHydrationWarning>{browserDate}</span>
        </span>
      </div>
    </footer>
  );
}
