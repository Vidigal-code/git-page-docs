"use client";

import type { ReactElement } from "react";
import { FiSkipBack } from "@react-icons/all-files/fi/FiSkipBack";
import { FiSkipForward } from "@react-icons/all-files/fi/FiSkipForward";
import { FiChevronLeft } from "@react-icons/all-files/fi/FiChevronLeft";
import { FiChevronRight } from "@/shared/ui/fallback-icons";
import { ControlIcon } from "@/shared/ui/control-icon";
import type { ContainerPageAction, ContainerPageSelection, PaginatedContainer } from "@/entities/docs";
import styles from "../../docs-shell.module.css";
import paginationStyles from "./container-pagination.module.css";

const DEFAULT_LABELS = { first: "First page", previous: "Previous page", next: "Next page", last: "Last page", pages: "Pages" };
const DEFAULT_ICONS = { first: "FiSkipBack", previous: "FiChevronLeft", next: "FiChevronRight", last: "FiSkipForward" };

interface ContainerPaginationProps {
  container: PaginatedContainer;
  language: string;
  onSelect: (selection: ContainerPageSelection) => void;
}

export function ContainerPagination({ container, language, onSelect }: Readonly<ContainerPaginationProps>): ReactElement {
  const { index, items, options, key } = container;
  const last = items.length - 1;
  const labelFor = (action: ContainerPageAction | "pages"): string => {
    const label = options.labels?.[action];
    return (typeof label === "string" ? label : label?.[language] ?? label?.en) || DEFAULT_LABELS[action];
  };
  const controls = [
    { action: "first", destination: 0, disabled: index <= 0, icon: <FiSkipBack aria-hidden /> },
    { action: "previous", destination: index - 1, disabled: index <= 0, icon: <FiChevronLeft aria-hidden /> },
    { action: "next", destination: index + 1, disabled: index >= last, icon: <FiChevronRight aria-hidden /> },
    { action: "last", destination: last, disabled: index >= last, icon: <FiSkipForward aria-hidden /> },
  ] as const;
  return (
    <nav className={paginationStyles.pagination} data-alignment={options.alignment ?? "right"} aria-label={labelFor("pages")}>
      {options.showCount !== false && <output className={paginationStyles.counter}>{labelFor("pages")} {index + 1} / {items.length}</output>}
      <div className={paginationStyles.buttons}>
        {controls.filter(({ action }) => options.controls?.[action] !== false).map(({ action, destination, disabled, icon }) => (
          <button key={action} type="button" className={options.display === "text" ? styles.button : `${styles.button} ${styles.modeIconButton}`}
            disabled={disabled} aria-label={labelFor(action)} title={labelFor(action)} onClick={() => onSelect({ key, index: destination })}>
            {options.display === "text" ? labelFor(action) : <ControlIcon icon={{ tag: options.icons?.[action] ?? DEFAULT_ICONS[action], style: { fontSize: options.iconSize, color: "currentColor" } }} fallback={icon} />}
          </button>
        ))}
      </div>
    </nav>
  );
}
