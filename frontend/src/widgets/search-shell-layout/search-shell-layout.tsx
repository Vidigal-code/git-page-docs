"use client";

import type { ReactNode, CSSProperties } from "react";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { resolveThemeBackground, type SiteBackgroundEffectsConfig, type SiteConfig, type ThemeTemplate } from "@/entities/docs";
import { BackgroundAnimationControl, useThemeBackgroundPlayback } from "@/features/theme-background";
import { SiteFooter, type FooterConfig, type FooterDateMode } from "@/shared/ui/site-footer";
import { useDocumentThemeVars } from "@/shared/lib/use-document-theme-vars";
import { resolveControlIcon } from "@/shared/lib/icons/resolve-control-icon";
import styles from "./search-shell-layout.module.css";

const ThemeBackground = dynamic(
  () => import("@/features/theme-background/renderer").then((module) => module.ThemeBackground),
  { ssr: false },
);

const DEFAULT_FOOTER_LABELS: Record<string, string> = {
  en: "Project",
  pt: "Projeto",
  es: "Proyecto",
};

const BACKGROUND_LABELS: Record<string, { pause: string; resume: string }> = {
  en: { pause: "Pause background animation", resume: "Resume background animation" },
  pt: { pause: "Pausar animação de fundo", resume: "Continuar animação de fundo" },
  es: { pause: "Pausar animación de fondo", resume: "Reanudar animación de fondo" },
};

interface BackgroundControlOptions {
  siteConfig?: Partial<SiteConfig>;
  language: string;
  paused: boolean;
  mode: "dark" | "light";
}

function resolveBackgroundControl({ siteConfig, language, paused, mode }: BackgroundControlOptions) {
  const labels = BACKGROUND_LABELS[language] ?? BACKGROUND_LABELS.en;
  const labelKey = paused ? "backgroundAnimationResume" : "backgroundAnimationPause";
  const fallback = paused ? labels.resume : labels.pause;
  return {
    label: siteConfig?.langmenu?.[language]?.[labelKey] || siteConfig?.langmenu?.en?.[labelKey] || fallback,
    icon: resolveControlIcon(siteConfig, { name: paused ? "BackgroundAnimationResume" : "BackgroundAnimationPause", mode }),
  };
}

export type { FooterConfig };
export type SearchShellHeaderSlot = ReactNode | ((backgroundControl: ReactNode) => ReactNode);

interface SearchShellLayoutProps {
  children: ReactNode;
  header: SearchShellHeaderSlot;
  footerEnabled?: boolean;
  projectFooterUrl: string;
  language: string;
  style?: CSSProperties;
  footerConfig?: FooterConfig;
  theme?: ThemeTemplate;
  backgroundEffects?: SiteBackgroundEffectsConfig;
  siteConfig?: Partial<SiteConfig>;
}

export function SearchShellLayout({
  children,
  header,
  footerEnabled = true,
  projectFooterUrl,
  language,
  style,
  footerConfig,
  theme,
  backgroundEffects,
  siteConfig,
}: Readonly<SearchShellLayoutProps>) {
  const background = useMemo(
    () => resolveThemeBackground({ theme, settings: backgroundEffects }),
    [theme, backgroundEffects],
  );
  const playback = useThemeBackgroundPlayback(background);
  const backgroundControl = playback.showControl ? (
    <BackgroundAnimationControl paused={playback.paused} onToggle={playback.toggle}
      {...resolveBackgroundControl({ siteConfig, language, paused: playback.paused, mode: theme?.mode === "light" ? "light" : "dark" })} />
  ) : null;
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
    <div className={styles.wrapper} style={style} data-background-effects={Boolean(background)}>
      {background && <ThemeBackground key={theme?.id} config={background} paused={playback.paused} />}
      {typeof header === "function" ? header(backgroundControl) : header}
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
