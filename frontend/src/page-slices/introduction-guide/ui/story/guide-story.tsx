"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { buildStoryChapters, chapterAt, formatOrdinal } from "../../model/story";
import type { GuideSection, GuideUi } from "../../model/types";
import { StoryChapter } from "./story-chapter";
import styles from "./guide-story.module.css";

interface GuideStoryProps {
  readonly sections: readonly GuideSection[];
  readonly ui: GuideUi;
  /** Element id of the full guide, the skip link's target. */
  readonly skipTargetId: string;
}

/**
 * Scroll-driven tour of the guide. The section is as tall as its chapters; a
 * stage pinned to the viewport plays one chapter per slice of the scroll, so the
 * page's own scrolling (wheel, touch, keyboard, scrollbar) drives the animation.
 * Every chapter stays in the document for readers and search, and a skip link
 * jumps straight to the full guide.
 */
export function GuideStory({ sections, ui, skipTargetId }: Readonly<GuideStoryProps>) {
  const chapters = useMemo(() => buildStoryChapters(sections), [sections]);
  const total = chapters.length;
  const storyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => setActiveIndex(chapterAt(value, total)));

  const goToChapter = (index: number) => {
    const story = storyRef.current;
    if (!story) return;
    const scrollable = story.offsetHeight - window.innerHeight;
    const top = story.getBoundingClientRect().top + window.scrollY;
    // Aim at the middle of the chapter's slice so it lands fully in.
    window.scrollTo({ top: top + (scrollable * (index + 0.5)) / total, behavior: "smooth" });
  };

  if (total === 0) return null;

  return (
    <section
      ref={storyRef}
      className={styles.story}
      style={{ "--story-chapters": total } as CSSProperties}
      aria-label={ui.storyLabel}
      data-testid="guide-story"
    >
      <a className={styles.skip} href={`#${skipTargetId}`}>
        {ui.storySkip}
      </a>
      <div className={styles.stage}>
        <m.div className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />
        <p className={styles.counter} data-testid="guide-story-counter" aria-live="polite">
          {formatOrdinal(activeIndex + 1)} / {formatOrdinal(total)}
        </p>
        <nav className={styles.rail} aria-label={ui.storyChaptersLabel}>
          <ol>
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <button
                  type="button"
                  className={styles.railItem}
                  aria-current={index === activeIndex ? "step" : undefined}
                  onClick={() => goToChapter(index)}
                >
                  <span className={styles.railDot} aria-hidden="true" />
                  <span className={styles.railLabel}>{chapter.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className={styles.scenes}>
          {chapters.map((chapter, index) => (
            <StoryChapter key={chapter.id} chapter={chapter} index={index} total={total} progress={scrollYProgress} />
          ))}
        </div>
        <p className={styles.hint} aria-hidden="true">
          {ui.storyScrollHint}
        </p>
      </div>
    </section>
  );
}
