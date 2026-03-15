import { FiX } from "react-icons/fi";
import type { MenuEntry } from "../model/menu-tree";
import styles from "../docs-shell.module.css";

interface DocsShellQuickNavOverlayProps {
  isOpen: boolean;
  quickNavPlaceholder: string;
  menuCloseLabel: string;
  quickNavQuery: string;
  filteredQuickNavEntries: MenuEntry[];
  quickNavActiveIndex: number;
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  noNavigationResults: string;
  quickNavListRef: React.RefObject<HTMLDivElement | null>;
  quickNavItemRefs: React.RefObject<Array<HTMLButtonElement | null>>;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onActiveIndexChange: (nextIndex: number | ((prev: number) => number)) => void;
  onMenuClick: (pathClick: string, ancestorKeys: string[]) => void;
}

export function DocsShellQuickNavOverlay({
  isOpen,
  quickNavPlaceholder,
  menuCloseLabel,
  quickNavQuery,
  filteredQuickNavEntries,
  quickNavActiveIndex,
  navigateHintLabel,
  selectHintLabel,
  escHintLabel,
  closeHintLabel,
  noNavigationResults,
  quickNavListRef,
  quickNavItemRefs,
  onClose,
  onQueryChange,
  onActiveIndexChange,
  onMenuClick,
}: DocsShellQuickNavOverlayProps) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.quickNavOverlay} onClick={onClose}>
      <div className={styles.quickNavCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.quickNavHeader}>
          <span className={styles.quickNavHeaderTitle}>{quickNavPlaceholder}</span>
          <button className={`${styles.button} ${styles.quickNavCloseButton}`} onClick={onClose} aria-label={menuCloseLabel} title={menuCloseLabel}>
            <FiX aria-hidden />
          </button>
        </div>
        <input
          className={styles.quickNavInput}
          placeholder={quickNavPlaceholder}
          autoFocus
          value={quickNavQuery}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onActiveIndexChange(0);
          }}
          onKeyDown={(event) => {
            if (!filteredQuickNavEntries.length) {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              onActiveIndexChange((prev) => Math.min(prev + 1, filteredQuickNavEntries.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              onActiveIndexChange((prev) => Math.max(prev - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              const selectedEntry = filteredQuickNavEntries[quickNavActiveIndex];
              if (selectedEntry) {
                onMenuClick(selectedEntry.pathClick, selectedEntry.ancestorKeys);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
          }}
        />
        <div className={styles.quickNavList} ref={quickNavListRef}>
          {filteredQuickNavEntries.map((entry, index) => (
            <button
              key={`quick-${entry.key}`}
              ref={(element) => {
                quickNavItemRefs.current[index] = element;
              }}
              className={`${styles.menuButton} ${index === quickNavActiveIndex ? styles.quickNavItemActive : ""}`}
              onClick={() => onMenuClick(entry.pathClick, entry.ancestorKeys)}
              onMouseEnter={() => onActiveIndexChange(index)}
            >
              {entry.searchLabel}
            </button>
          ))}
          {!filteredQuickNavEntries.length && <p className={styles.repoInfo}>{noNavigationResults}</p>}
        </div>
        <div className={styles.quickNavFooter}>
          <span>↓ ↑ {navigateHintLabel}</span>
          <span>↵ {selectHintLabel}</span>
          <span>{escHintLabel} {closeHintLabel}</span>
        </div>
      </div>
    </div>
  );
}
