"use client";

import type { BackToTopOptions } from "@/entities/docs";
import { BackToTop } from "@/shared/ui/back-to-top";
import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import styles from "./introduction-guide-page.module.css";

interface GuideBackToTopProps {
  readonly label: string;
  /** Id of the element at the top of the page that receives focus (it needs `tabIndex={-1}`). */
  readonly targetId: string;
  readonly settings?: BackToTopOptions;
}

/**
 * Closing icon button (an up arrow, named by `label` for assistive tech and as
 * a tooltip): scrolls back to the top of the guide and moves
 * keyboard focus there, so the next Tab continues from the top instead of the
 * footer. The guide returns instantly without animating through its chapters.
 */
export function GuideBackToTop({ label, targetId, settings }: Readonly<GuideBackToTopProps>) {
  return (
    <BackToTop
      label={label}
      targetId={targetId}
      scrollBehavior="instant"
      enabled={settings?.enabled}
      minPageHeightViewports={settings?.minPageHeightViewports}
      className={styles.backToTop}
      buttonClassName={`${styles.heroAction} ${styles.secondaryButton} ${styles.iconAction}`}
      testId="guide-back-to-top"
    >
      <span className={styles.buttonIcon} aria-hidden>
        <ReactIconByTag tag="FiArrowUp" />
      </span>
    </BackToTop>
  );
}
