/**
 * Motion tuning for the introduction guide. Every animated value lives here so
 * the components stay declarative and the numbers have one source of truth.
 */

/** Soft ease-out (fast start, long settle) shared by every entrance on the page. */
const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

/** Theme token that tints a decorative layer; resolved by CSS, so every theme applies. */
export type ParallaxTint = "primary" | "secondary";

export interface ParallaxLayerSpec {
  /** Stable key and CSS hook (`data-parallax-layer`). */
  readonly id: string;
  readonly tint: ParallaxTint;
  /** Vertical travel (px) across one full page scroll; negative moves up. */
  readonly travelPx: number;
}

/** Decorative backdrop layers, back to front: farther layers travel less (depth). */
export const PARALLAX_LAYERS: readonly ParallaxLayerSpec[] = [
  { id: "far", tint: "secondary", travelPx: -80 },
  { id: "mid", tint: "primary", travelPx: -180 },
  { id: "near", tint: "secondary", travelPx: -320 },
];

/** Hero content fades while the hero leaves the viewport; each row drifts at its own depth. */
export const HERO_PARALLAX = {
  fadeTo: 0.15,
  /** `useScroll` offset: from the hero's top at the viewport top to its bottom at the viewport top. */
  offset: ["start start", "end start"],
  /** Travel (px) per hero row across the hero's exit: later rows travel further, which reads as depth. */
  depthPx: {
    eyebrow: 40,
    title: 90,
    subtitle: 150,
    install: 200,
    actions: 240,
  },
} as const;

export type HeroRow = keyof typeof HERO_PARALLAX.depthPx;

/** First-paint entrance: rows focus in one after another, then the title's letters rise in. */
export const HERO_ENTRANCE = {
  delayS: 0.1,
  rowStaggerS: 0.09,
  glyphStaggerS: 0.035,
  durationS: 0.7,
  blurPx: 10,
  scaleFrom: 0.96,
  /** Letters start this far below their baseline (em, so it scales with the font). */
  glyphRiseEm: 0.45,
  ease: EASE_OUT_SOFT,
} as const;

/** Hover and press feedback shared by the hero's calls to action. */
export const HERO_ACTION_FEEDBACK = {
  hoverLiftPx: -2,
  pressScale: 0.97,
  spring: { type: "spring", stiffness: 420, damping: 26 },
} as const;

/** Sections fade and rise into place once, the first time they enter the viewport. */
export const REVEAL = {
  risePx: 28,
  durationS: 0.55,
  /** Share of the element that must be visible before it reveals. */
  viewportAmount: 0.15,
  ease: EASE_OUT_SOFT,
} as const;

/**
 * Parallax depth of a story chapter's layers: how far (px) each travels while
 * the chapter enters or leaves. Bigger = feels closer to the viewer.
 */
export const STORY_DEPTH = {
  numeralPx: 220,
  titlePx: 90,
  detailsPx: 50,
  /** Each later highlight travels this share of `detailsPx` further, so the list cascades. */
  highlightStepShare: 0.45,
  /** The numeral starts this much larger and settles to 1 while its chapter enters. */
  numeralScaleFrom: 1.18,
} as const;
