"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { interpolate, m, useReducedMotion, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { splitWords } from "../model/hero-motion";
import { HERO_ACTION_FEEDBACK, HERO_ENTRANCE, HERO_PARALLAX, type HeroRow as HeroRowName } from "../model/motion-config";
import type { GuideHero as GuideHeroModel } from "../model/types";
import styles from "./introduction-guide-page.module.css";

interface GuideHeroProps {
  readonly hero: GuideHeroModel;
  readonly projectUrl: string;
  readonly backToSearchHref: string;
  readonly backToSearchLabel: string;
  readonly onPrimary: () => void;
}

interface HeroVariants {
  readonly stage: Variants;
  readonly row: Variants;
  readonly title: Variants;
  readonly glyph: Variants;
}

/** Hero opacity for a scroll progress (0..1): fully shown at the top, `fadeTo` once it has left. */
const fadeOut = interpolate([0, 1], [1, HERO_PARALLAX.fadeTo], { clamp: true });

const EASED = { duration: HERO_ENTRANCE.durationS, ease: HERO_ENTRANCE.ease } as const;
const BLURRED = `blur(${HERO_ENTRANCE.blurPx}px)`;
const SHARP = "blur(0px)";

/**
 * Entrance choreography, identical for every visitor so the server and the
 * browser always render the same markup. Under reduced motion the provider's
 * `MotionConfig reducedMotion="user"` skips the movement (scale, rise) while the
 * fade and focus-in still play, since neither moves anything on screen.
 */
const HERO_VARIANTS: HeroVariants = {
  stage: {
    hidden: {},
    shown: { transition: { delayChildren: HERO_ENTRANCE.delayS, staggerChildren: HERO_ENTRANCE.rowStaggerS } },
  },
  row: {
    hidden: { opacity: 0, scale: HERO_ENTRANCE.scaleFrom, filter: BLURRED },
    shown: { opacity: 1, scale: 1, filter: SHARP, transition: EASED },
  },
  title: {
    hidden: {},
    shown: { transition: { staggerChildren: HERO_ENTRANCE.glyphStaggerS } },
  },
  glyph: {
    hidden: { opacity: 0, y: `${HERO_ENTRANCE.glyphRiseEm}em`, filter: BLURRED },
    shown: { opacity: 1, y: 0, filter: SHARP, transition: EASED },
  },
};

/**
 * Hover lift and press scale for the calls to action. Always passed (a tap
 * gesture adds `tabindex`, so dropping it for some visitors would make the
 * browser markup differ from the server's); reduced motion skips the movement.
 */
const ACTION_FEEDBACK = {
  whileHover: { y: HERO_ACTION_FEEDBACK.hoverLiftPx },
  whileTap: { scale: HERO_ACTION_FEEDBACK.pressScale },
  transition: HERO_ACTION_FEEDBACK.spring,
} as const;

interface HeroRowProps {
  readonly row: HeroRowName;
  readonly progress: MotionValue<number>;
  readonly variants: Variants;
  readonly reduceMotion: boolean;
  readonly children: ReactNode;
}

/**
 * One hero row: it focuses in on first paint and drifts at its own depth while
 * the hero scrolls away. Reduced motion only zeroes the drift; the element and
 * its attributes stay the same.
 */
function HeroRow({ row, progress, variants, reduceMotion, children }: Readonly<HeroRowProps>) {
  const travelPx = reduceMotion ? 0 : HERO_PARALLAX.depthPx[row];
  const y = useTransform(progress, [0, 1], [0, travelPx]);
  return (
    <m.div variants={variants} style={{ y }} data-hero-row={row}>
      {children}
    </m.div>
  );
}

/** The title, read whole by assistive tech and animated letter by letter on screen. */
function HeroTitle({ text, glyphVariants }: Readonly<{ text: string; glyphVariants: Variants }>) {
  const words = useMemo(() => splitWords(text), [text]);
  return (
    <h1 className={styles.heroTitle}>
      <span className={styles.visuallyHidden}>{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={word.key} className={styles.heroWord}>
            {word.glyphs.map((glyph) => (
              <m.span key={glyph.key} className={styles.heroGlyph} variants={glyphVariants} data-hero-glyph>
                {glyph.char}
              </m.span>
            ))}
            {wordIndex < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </h1>
  );
}

/**
 * Landing hero: eyebrow, title, subtitle, an install command and two calls to
 * action. On first paint the rows focus in one after another and the title's
 * letters rise into place; while the hero scrolls away each row drifts at its
 * own depth and the whole block fades. Reduced motion keeps the fades but drops
 * every movement.
 */
export function GuideHero({ hero, projectUrl, backToSearchHref, backToSearchLabel, onPrimary }: Readonly<GuideHeroProps>) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: [...HERO_PARALLAX.offset] });
  const reduceMotion = useReducedMotion() ?? false;
  // A fade is not motion, so the hero fades out on scroll for every visitor. The
  // function form keeps this scroll-linked opacity on the main thread instead of
  // the browser's native scroll timeline (see the story chapters for why).
  const opacity = useTransform(() => fadeOut(scrollYProgress.get()));
  const rowProps = { progress: scrollYProgress, variants: HERO_VARIANTS.row, reduceMotion };

  return (
    <header ref={heroRef} className={styles.hero}>
      <a className={styles.backLink} href={backToSearchHref}>
        <span className={styles.backIcon} aria-hidden>
          <ReactIconByTag tag="FiArrowLeft" />
        </span>
        {backToSearchLabel}
      </a>
      <m.div className={styles.heroStage} style={{ opacity }} variants={HERO_VARIANTS.stage} initial="hidden" animate="shown">
        <HeroRow row="eyebrow" {...rowProps}>
          <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
        </HeroRow>
        <HeroRow row="title" {...rowProps} variants={HERO_VARIANTS.title}>
          <HeroTitle text={hero.title} glyphVariants={HERO_VARIANTS.glyph} />
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
              {...ACTION_FEEDBACK}
            >
              {hero.ctaPrimary}
            </m.button>
            <m.a
              className={`${styles.heroAction} ${styles.secondaryButton}`}
              data-hero-action="secondary"
              href={projectUrl}
              target="_blank"
              rel="noreferrer"
              {...ACTION_FEEDBACK}
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
