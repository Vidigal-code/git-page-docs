import { FiX } from "@/shared/ui/fallback-icons";
import type { MenuEntry } from "../model/menu-tree";
import type { OnMenuClickOptions } from "../model/use-docs-shell-navigation-state";
import { filterQuickNavigationEntries, useQuickNavigation } from "../model/use-quick-navigation";
import styles from "../docs-shell.module.css";

interface DocsShellQuickNavOverlayProps {
  quickNavPlaceholder: string;
  menuCloseLabel: string;
  entries: MenuEntry[];
  navigateHintLabel: string;
  selectHintLabel: string;
  escHintLabel: string;
  closeHintLabel: string;
  noNavigationResults: string;
  onClose: () => void;
  onMenuClick: (pathClick: string, ancestorKeys: string[], options?: OnMenuClickOptions) => void;
}

export function DocsShellQuickNavOverlay({
  quickNavPlaceholder,
  menuCloseLabel,
  entries,
  navigateHintLabel,
  selectHintLabel,
  escHintLabel,
  closeHintLabel,
  noNavigationResults,
  onClose,
  onMenuClick,
}: Readonly<DocsShellQuickNavOverlayProps>): React.JSX.Element {
  const {
    setQuickNavQuery: onQueryChange,
    quickNavActiveIndex,
    quickNavActiveIndexRef,
    setQuickNavActiveIndex: onActiveIndexChange,
    filteredQuickNavEntries,
    quickNavListRef,
    quickNavItemRefs,
  } = useQuickNavigation(entries);
  return (
    <div className={styles.quickNavOverlay}>
      <button type="button" className={styles.overlayBackdrop} onClick={onClose} aria-label={menuCloseLabel} tabIndex={-1} />
      <div className={styles.quickNavCard}>
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
          defaultValue=""
          onChange={(event) => {
            onQueryChange(event.target.value);
            onActiveIndexChange(0);
          }}
          onKeyDown={(event) => {
            const currentEntries = filterQuickNavigationEntries(entries, event.currentTarget.value);
            if (!currentEntries.length) {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              onActiveIndexChange((prev) => Math.min(prev + 1, currentEntries.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              onActiveIndexChange((prev) => Math.max(prev - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              const selectedEntry = currentEntries[quickNavActiveIndexRef.current];
              if (selectedEntry) {
                onMenuClick(selectedEntry.pathClick, selectedEntry.ancestorKeys, { origin: "quick", containerPage: selectedEntry.containerPage });
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
              onClick={() => onMenuClick(entry.pathClick, entry.ancestorKeys, { origin: "quick", containerPage: entry.containerPage })}
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
