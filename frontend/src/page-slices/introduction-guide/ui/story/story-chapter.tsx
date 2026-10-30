import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { StoryChapter as StoryChapterModel } from "../../model/story";
import styles from "./guide-story.module.css";

interface StoryChapterProps {
  readonly chapter: StoryChapterModel;
  readonly active: boolean;
}

/** A complete, stationary chapter; selecting another chapter swaps the whole scene. */
export function StoryChapter({ chapter, active }: Readonly<StoryChapterProps>) {
  const headingId = `story-${chapter.id}-title`;

  return (
    <article className={styles.chapter} data-active={active} data-story-chapter={chapter.id} aria-labelledby={headingId}>
      <span className={styles.numeral} aria-hidden="true">{chapter.number}</span>
      <header className={styles.headline}>
        <span className={styles.eyebrowIcon} aria-hidden="true">
          <ReactIconByTag tag={chapter.icon} />
        </span>
        <h2 id={headingId} className={styles.title}>{chapter.title}</h2>
        <p className={styles.lead}>{chapter.lead}</p>
      </header>
      <div className={styles.details}>
        {chapter.body ? <p className={styles.body}>{chapter.body}</p> : null}
        {chapter.highlights.length > 0 ? (
          <ul className={styles.highlights}>
            {chapter.highlights.map((item) => <li key={item} className={styles.highlight}>{item}</li>)}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
