"use client";

import { useMemo } from "react";
import type { LanguageCode } from "@/entities/docs/model/types";
import styles from "./site-footer.module.css";

interface SiteFooterProps {
  language: LanguageCode;
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

function resolveLanguage(language: LanguageCode): keyof typeof COPY {
  return language === "pt" || language === "es" ? language : "en";
}

export function SiteFooter({ language, projectUrl }: SiteFooterProps) {
  const lang = resolveLanguage(language);
  const copy = COPY[lang];

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString();
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
          {formattedDate}
        </span>
      </div>
    </footer>
  );
}
