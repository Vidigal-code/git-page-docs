import type { ReactElement } from "react";
import { FiSearch } from "@/shared/ui/fallback-icons";
import styles from "./guide-sidebar.module.css";

/** Controlled search input. Presentational only — state lives in the parent (useGuideSearch). */
export function GuideSearch({
  value,
  placeholder,
  onChange,
}: Readonly<{
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}>): ReactElement {
  return (
    <label className={styles.search}>
      <span className={styles.searchIcon} aria-hidden>
        <FiSearch aria-hidden />
      </span>
      <input
        type="search"
        className={styles.searchInput}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
