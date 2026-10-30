"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { interpolate, m, useScroll, useTransform, type MotionValue } from "motion/react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { splitWords } from "../model/hero-motion";
import { HERO_ACTION_FEEDBACK, HERO_PARALLAX, type HeroRow as HeroRowName } from "../model/motion-config";
import type { GuideHero as GuideHeroModel } from "../model/types";
import { useGuideMotion } from "./motion/guide-motion-provider";
import styles from "./introduction-guide-page.module.css";

interface GuideHeroProps {
  /** Id of the hero, the landing spot (and focus target) of "back to top". */
  readonly id: string;
  readonly hero: GuideHeroModel;
  readonly projectUrl: string;
  readonly backToSearchHref: string;
  readonly backToSearchLabel: string;
  readonly onPrimary: () => void;
}

/** Hero opacity for a scroll progress (0..1): fully shown at the top, `fadeTo` once it has left. */
const fadeOut = interpolate([0, 1], [1, HERO_PARALLAX.fadeTo], { clamp: true });

interface HeroRowProps {
  readonly row: HeroRowName;
  readonly progress: MotionValue<number>;
  readonly children: ReactNode;
}

function HeroRow({ row, progress, children }: Readonly<HeroRowProps>) {
  const { enabled } = useGuideMotion();
  const y = useTransform(progress, [0, 1], [0, HERO_PARALLAX.depthPx[row]]);
  return (
    <m.div style={{ y: enabled ? y : 0, opacity: 1 }} data-hero-row={row}>
      {children}
    </m.div>
  );
}

/** Keeps words together visually while assistive technology reads one complete title. */
function HeroTitle({ text }: Readonly<{ text: string }>) {
  const words = useMemo(() => splitWords(text), [text]);
  return (
    <h1 className={styles.heroTitle}>
      <span className={styles.visuallyHidden}>{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={word.key} className={styles.heroWord}>
            {word.glyphs.map((glyph) => (
              <span key={glyph.key} className={styles.heroGlyph} data-hero-glyph>
                {glyph.char}
              </span>
            ))}
            {wordIndex < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </h1>
  );
}

/** Content is visible from first paint; optional depth follows the native scroll position. */
export function GuideHero({ id, hero, projectUrl, backToSearchHref, backToSearchLabel, onPrimary }: Readonly<GuideHeroProps>) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: [...HERO_PARALLAX.offset] });
  const { enabled } = useGuideMotion();
  const opacity = useTransform(() => fadeOut(scrollYProgress.get()));
  const rowProps = { progress: scrollYProgress };
  const actionFeedback = {
    whileHover: { y: enabled ? HERO_ACTION_FEEDBACK.hoverLiftPx : 0 },
    whileTap: { scale: enabled ? HERO_ACTION_FEEDBACK.pressScale : 1 },
    transition: enabled ? HERO_ACTION_FEEDBACK.spring : { duration: 0 },
  };

  return (
    <header ref={heroRef} id={id} className={styles.hero} tabIndex={-1}>
      <a className={styles.backLink} href={backToSearchHref} data-guide-back-link>
        <span className={styles.backIcon} aria-hidden>
          <ReactIconByTag tag="FiArrowLeft" />
        </span>
        {backToSearchLabel}
      </a>
      <m.div className={styles.heroStage} style={{ opacity: enabled ? opacity : 1 }} data-guide-hero-stage>
        <HeroRow row="eyebrow" {...rowProps}>
          <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
        </HeroRow>
        <HeroRow row="title" {...rowProps}>
          <HeroTitle text={hero.title} />
        </HeroRow>
        <HeroRow row="subtitle" {...rowProps}>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
        </HeroRow>
        <HeroRow row="install" {...rowProps}>
          <div className={styles.heroInstall}>
            <span className={styles.heroPrompt} aria-hidden>$</span>
            <code className={styles.heroCommand}>{hero.install}</code>
          </div>
        </HeroRow>
        <HeroRow row="actions" {...rowProps}>
          <div className={styles.heroActions}>
            <m.button
              type="button"
              className={`${styles.heroAction} ${styles.primaryButton}`}
              data-hero-action="primary"
              onClick={onPrimary}
              {...actionFeedback}
            >
              {hero.ctaPrimary}
            </m.button>
            <m.a
              className={`${styles.heroAction} ${styles.secondaryButton}`}
              data-hero-action="secondary"
              href={projectUrl}
              target="_blank"
              rel="noreferrer"
              {...actionFeedback}
            >
              <span className={styles.buttonIcon} aria-hidden>
                <ReactIconByTag tag="FaGithubAlt" />
              </span>
              {hero.ctaSecondary}
            </m.a>
          </div>
        </HeroRow>
      </m.div>
    </header>
  );
}
