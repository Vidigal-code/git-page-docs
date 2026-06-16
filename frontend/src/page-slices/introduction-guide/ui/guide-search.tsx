import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import styles from "./guide-sidebar.module.css";

/** Controlled search input. Presentational only — state lives in the parent (useGuideSearch). */
export function GuideSearch({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.search}>
      <span className={styles.searchIcon} aria-hidden>
        <ReactIconByTag tag="FiSearch" />
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
