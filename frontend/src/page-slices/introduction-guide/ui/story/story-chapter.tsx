"use client";

import { useMemo } from "react";
import { interpolate, m, useTransform, type MotionValue } from "motion/react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import { STORY_DEPTH } from "../../model/motion-config";
import { chapterTimeline, type StoryChapter as StoryChapterModel } from "../../model/story";
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

/**
 * One scene of the story. Its layers travel at different depths while the
 * chapter scrolls through its slice: the giant numeral drifts the most, the
 * headline less and the details least, which reads as parallax depth.
 */
export function StoryChapter({ chapter, index, total, progress }: Readonly<StoryChapterProps>) {
  const timeline = useMemo(() => chapterTimeline(index, total), [index, total]);
  const depth = useMemo(
    () => ({
      numeral: timeline.shift.map((s) => s * STORY_DEPTH.numeralPx),
      title: timeline.shift.map((s) => s * STORY_DEPTH.titlePx),
      details: timeline.shift.map((s) => s * STORY_DEPTH.detailsPx),
    }),
    [timeline],
  );
  const opacity = useKeyframedValue(progress, timeline.input, timeline.opacity);
  const numeralY = useKeyframedValue(progress, timeline.input, depth.numeral);
  const titleY = useKeyframedValue(progress, timeline.input, depth.title);
  const detailsY = useKeyframedValue(progress, timeline.input, depth.details);
  const headingId = `story-${chapter.id}-title`;

  return (
    <m.article className={styles.chapter} style={{ opacity }} data-story-chapter={chapter.id} aria-labelledby={headingId}>
      <m.span className={styles.numeral} style={{ y: numeralY }} aria-hidden="true">
        {chapter.number}
      </m.span>
      <m.header className={styles.headline} style={{ y: titleY }}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowIcon} aria-hidden="true">
            <ReactIconByTag tag={chapter.icon} />
          </span>
          <span className={styles.ordinal}>{chapter.number}</span>
        </p>
        <h2 id={headingId} className={styles.title}>
          {chapter.title}
        </h2>
        <p className={styles.lead}>{chapter.lead}</p>
      </m.header>
      <m.div className={styles.details} style={{ y: detailsY }}>
        {chapter.body ? <p className={styles.body}>{chapter.body}</p> : null}
        {chapter.highlights.length > 0 ? (
          <ul className={styles.highlights}>
            {chapter.highlights.map((item) => (
              <li key={item} className={styles.highlight}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </m.div>
    </m.article>
  );
}
