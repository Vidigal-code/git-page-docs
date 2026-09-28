"use client";

import { useMemo } from "react";
import { interpolate, m, useTransform, type MotionValue } from "motion/react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { STORY_DEPTH } from "../../model/motion-config";
import {
  chapterTimeline,
  highlightDepth,
  type ChapterTimeline,
  type StoryChapter as StoryChapterModel,
} from "../../model/story";
import styles from "./guide-story.module.css";

interface StoryChapterProps {
  readonly chapter: StoryChapterModel;
  readonly index: number;
  readonly total: number;
  readonly progress: MotionValue<number>;
}

/** Maps scroll progress through the chapter's keyframes (clamped outside them). */
function useKeyframedValue(progress: MotionValue<number>, input: number[], output: number[]): MotionValue<number> {
  const map = useMemo(() => interpolate(input, output, { clamp: true }), [input, output]);
  // A transform function is computed on the main thread: scroll-linked opacity
  // handed to the browser's native scroll timeline misread short keyframe lists.
  return useTransform(() => map(progress.get()));
}

/** Parallax travel for a layer: `shift` keyframes (-1..1) scaled to that layer's depth in px. */
function useDepth(progress: MotionValue<number>, timeline: ChapterTimeline, depthPx: number): MotionValue<number> {
  const output = useMemo(() => timeline.shift.map((shift) => shift * depthPx), [timeline, depthPx]);
  return useKeyframedValue(progress, timeline.input, output);
}

interface StoryHighlightProps {
  readonly item: string;
  readonly index: number;
  readonly timeline: ChapterTimeline;
  readonly progress: MotionValue<number>;
}

/** A highlight sits a little deeper than the one before, so the list cascades in and out. */
function StoryHighlight({ item, index, timeline, progress }: Readonly<StoryHighlightProps>) {
  const y = useDepth(progress, timeline, highlightDepth(index));
  return (
    <m.li className={styles.highlight} style={{ y }}>
      {item}
    </m.li>
  );
}

/**
 * One scene of the story. Its layers travel at different depths while the
 * chapter scrolls through its slice: the giant numeral drifts the most and zooms
 * from near to far, the headline less, and the details least, with each
 * highlight a step deeper than the last. Together it reads as parallax depth.
 */
export function StoryChapter({ chapter, index, total, progress }: Readonly<StoryChapterProps>) {
  const timeline = useMemo(() => chapterTimeline(index, total), [index, total]);
  const numeralScaleOutput = useMemo(
    () => timeline.shift.map((shift) => 1 + shift * (STORY_DEPTH.numeralScaleFrom - 1)),
    [timeline],
  );
  const opacity = useKeyframedValue(progress, timeline.input, timeline.opacity);
  const numeralScale = useKeyframedValue(progress, timeline.input, numeralScaleOutput);
  const numeralY = useDepth(progress, timeline, STORY_DEPTH.numeralPx);
  const titleY = useDepth(progress, timeline, STORY_DEPTH.titlePx);
  const bodyY = useDepth(progress, timeline, STORY_DEPTH.detailsPx);
  const headingId = `story-${chapter.id}-title`;

  return (
    <m.article className={styles.chapter} style={{ opacity }} data-story-chapter={chapter.id} aria-labelledby={headingId}>
      <m.span className={styles.numeral} style={{ y: numeralY, scale: numeralScale }} aria-hidden="true">
        {chapter.number}
      </m.span>
      <m.header className={styles.headline} style={{ y: titleY }}>
        <span className={styles.eyebrowIcon} aria-hidden="true">
          <ReactIconByTag tag={chapter.icon} />
        </span>
        <h2 id={headingId} className={styles.title}>
          {chapter.title}
        </h2>
        <p className={styles.lead}>{chapter.lead}</p>
      </m.header>
      <div className={styles.details}>
        {chapter.body ? (
          <m.p className={styles.body} style={{ y: bodyY }}>
            {chapter.body}
          </m.p>
        ) : null}
        {chapter.highlights.length > 0 ? (
          <ul className={styles.highlights}>
            {chapter.highlights.map((item, itemIndex) => (
              <StoryHighlight key={item} item={item} index={itemIndex} timeline={timeline} progress={progress} />
            ))}
          </ul>
        ) : null}
      </div>
    </m.article>
  );
}
