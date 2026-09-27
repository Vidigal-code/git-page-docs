/**
 * Motion tuning for the introduction guide. Every animated value lives here so
 * the components stay declarative and the numbers have one source of truth.
 */

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

/** Hero content drifts up and fades while the hero leaves the viewport. */
export const HERO_PARALLAX = {
  travelPx: 120,
  fadeTo: 0.15,
  /** `useScroll` offset: from the hero's top at the viewport top to its bottom at the viewport top. */
  offset: ["start start", "end start"],
} as const;

/** Sections fade and rise into place once, the first time they enter the viewport. */
export const REVEAL = {
  risePx: 28,
  durationS: 0.55,
  /** Share of the element that must be visible before it reveals. */
  viewportAmount: 0.15,
  ease: [0.22, 1, 0.36, 1],
} as const;

/**
 * Parallax depth of a story chapter's layers: how far (px) each travels while
 * the chapter enters or leaves. Bigger = feels closer to the viewer.
 */
export const STORY_DEPTH = {
  numeralPx: 220,
  titlePx: 90,
  detailsPx: 50,
} as const;
