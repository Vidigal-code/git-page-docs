"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { HERO_PARALLAX } from "../model/motion-config";
import type { GuideHero as GuideHeroModel } from "../model/types";
import styles from "./introduction-guide-page.module.css";

/**
 * Landing hero: eyebrow, title, subtitle, an install command and two calls to
 * action. Its content drifts up and fades as the hero scrolls away (parallax);
 * with reduced motion it stays put and fully opaque.
 */
export function GuideHero({
  hero,
  projectUrl,
  backToSearchHref,
  backToSearchLabel,
  onPrimary,
}: Readonly<{
  hero: GuideHeroModel;
  projectUrl: string;
  backToSearchHref: string;
  backToSearchLabel: string;
  onPrimary: () => void;
}>) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: [...HERO_PARALLAX.offset] });
  const reduceMotion = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : HERO_PARALLAX.travelPx]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : HERO_PARALLAX.fadeTo]);

  return (
    <header ref={heroRef} className={styles.hero}>
      <a className={styles.backLink} href={backToSearchHref}>
        <span className={styles.backIcon} aria-hidden>
          <ReactIconByTag tag="FiArrowLeft" />
        </span>
        {backToSearchLabel}
      </a>
      <m.div style={{ y, opacity }}>
        <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.heroTitle}>{hero.title}</h1>
        <p className={styles.heroSubtitle}>{hero.subtitle}</p>
        <div className={styles.heroInstall}>
          <span className={styles.heroPrompt} aria-hidden>$</span>
          <code className={styles.heroCommand}>{hero.install}</code>
        </div>
        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryButton} onClick={onPrimary}>
            {hero.ctaPrimary}
          </button>
          <a className={styles.secondaryButton} href={projectUrl} target="_blank" rel="noreferrer">
            <span className={styles.buttonIcon} aria-hidden>
              <ReactIconByTag tag="FaGithubAlt" />
            </span>
            {hero.ctaSecondary}
          </a>
        </div>
      </m.div>
    </header>
  );
}
