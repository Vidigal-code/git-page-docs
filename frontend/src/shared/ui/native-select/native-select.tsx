import type { ComponentProps, ReactElement } from "react";
import { FiChevronDown } from "@react-icons/all-files/fi/FiChevronDown";
import styles from "./native-select.module.css";

type NativeSelectProps = Omit<ComponentProps<"select">, "multiple" | "size">;

export function NativeSelect({ children, className, ...props }: Readonly<NativeSelectProps>): ReactElement {
  return (
    <span className={styles.control}>
      <select {...props} className={`${styles.select} ${className ?? ""}`}>
        {children}
      </select>
      <FiChevronDown className={styles.arrow} aria-hidden="true" focusable="false" />
    </span>
  );
}
