import type { ReactNode } from "react";
import { FiSkipBack } from "@react-icons/all-files/fi/FiSkipBack";
import { FiSkipForward } from "@react-icons/all-files/fi/FiSkipForward";
import type { FocusNavigationTarget } from "../model/focus-navigation";
import styles from "../docs-shell.module.css";

interface FocusNavigationGroupProps {
  label: string;
  index: number;
  count: number;
  labels: Record<FocusNavigationTarget, string>;
  titles?: Partial<Record<FocusNavigationTarget, string>>;
  stepIcons: { previous: ReactNode; next: ReactNode };
  onNavigate: (target: FocusNavigationTarget) => void;
}

export function FocusNavigationGroup({ label, index, count, labels, titles, stepIcons, onNavigate }: Readonly<FocusNavigationGroupProps>): ReactNode {
  const canGoPrevious = index > 0;
  const canGoNext = index >= 0 && index < count - 1;
  const controls = [
    { target: "first", enabled: canGoPrevious, icon: <FiSkipBack aria-hidden /> },
    { target: "previous", enabled: canGoPrevious, icon: stepIcons.previous },
    { target: "next", enabled: canGoNext, icon: stepIcons.next },
    { target: "last", enabled: canGoNext, icon: <FiSkipForward aria-hidden /> },
  ] as const;

  return (
    <nav className={styles.focusModeNavigationGroup} aria-label={label}>
      <span className={styles.focusModeCounter}>{label}<strong>{Math.max(index + 1, 0)} / {count}</strong></span>
      {controls.map(({ target, enabled, icon }) => (
        <button key={target} type="button" className={styles.focusModeNavButton}
          onClick={() => onNavigate(target)} disabled={!enabled} aria-label={labels[target]} title={titles?.[target] ?? labels[target]}>
          {icon}
        </button>
      ))}
    </nav>
  );
}
