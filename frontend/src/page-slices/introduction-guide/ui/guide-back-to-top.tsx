"use client";

import { useReducedMotion } from "motion/react";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import styles from "./introduction-guide-page.module.css";

interface GuideBackToTopProps {
  readonly label: string;
  /** Id of the element at the top of the page that receives focus (it needs `tabIndex={-1}`). */
  readonly targetId: string;
}

/**
 * Closing icon button (an up arrow, named by `label` for assistive tech and as
 * a tooltip): scrolls back to the top of the guide and moves
 * keyboard focus there, so the next Tab continues from the top instead of the
 * footer. The scroll is smooth unless the visitor asks for reduced motion.
 */
export function GuideBackToTop({ label, targetId }: Readonly<GuideBackToTopProps>) {
  const reduceMotion = useReducedMotion();

  const backToTop = () => {
    document.getElementById(targetId)?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className={styles.backToTop}>
      <button
        type="button"
        className={`${styles.heroAction} ${styles.secondaryButton} ${styles.iconAction}`}
        aria-label={label}
        title={label}
        onClick={backToTop}
      >
        <span className={styles.buttonIcon} aria-hidden>
          <ReactIconByTag tag="FiArrowUp" />
        </span>
      </button>
    </div>
  );
}
