import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { GuideSection as GuideSectionModel } from "../model/types";
import { GuideBlock } from "./guide-block";
import styles from "./guide-content.module.css";

/** Renders one documentation section: an anchored header plus its content blocks. */
export function GuideSection({ section }: { section: GuideSectionModel }) {
  return (
    <section id={section.id} className={styles.section}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden>
          <ReactIconByTag tag={section.icon} />
        </span>
        <div>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <p className={styles.sectionLead}>{section.lead}</p>
        </div>
      </header>
      <div className={styles.sectionBody}>
        {section.blocks.map((block, index) => (
          <GuideBlock key={`${section.id}-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}
