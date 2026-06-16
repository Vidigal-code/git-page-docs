import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { GuideSection, GuideUi } from "../model/types";
import { GuideSearch } from "./guide-search";
import styles from "./guide-sidebar.module.css";

/** Left navigation: search box + a filtered, scroll-synced list of sections. */
export function GuideSidebar({
  ui,
  sections,
  query,
  onQueryChange,
  activeId,
  onSelect,
}: {
  ui: GuideUi;
  sections: GuideSection[];
  query: string;
  onQueryChange: (value: string) => void;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <GuideSearch value={query} placeholder={ui.searchPlaceholder} onChange={onQueryChange} />
      <p className={styles.groupLabel}>{ui.sectionsLabel}</p>
      {sections.length === 0 ? (
        <p className={styles.empty}>{ui.searchEmpty}</p>
      ) : (
        <nav className={styles.nav}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.navItem} ${section.id === activeId ? styles.navItemActive : ""}`}
              onClick={() => onSelect(section.id)}
            >
              <span className={styles.navIcon} aria-hidden>
                <ReactIconByTag tag={section.icon} />
              </span>
              <span className={styles.navText}>
                <span className={styles.navTitle}>{section.title}</span>
                <span className={styles.navLead}>{section.lead}</span>
              </span>
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
}
