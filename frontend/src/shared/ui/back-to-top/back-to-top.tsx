"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { FiArrowUp } from "@react-icons/all-files/fi/FiArrowUp";
import siteBaseline from "@/shared/config/site-baseline.json";
import styles from "./back-to-top.module.css";

interface BackToTopProps {
  label: string;
  targetId: string;
  scrollBehavior?: ScrollBehavior;
  enabled?: boolean;
  minPageHeightViewports?: number;
  className?: string;
  buttonClassName?: string;
  children?: ReactNode;
  testId?: string;
}

function resolveMinimumViewports(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 1
    ? value
    : siteBaseline.backToTop.minPageHeightViewports;
}

export function BackToTop(props: Readonly<BackToTopProps>): ReactElement | null {
  const enabled = props.enabled ?? siteBaseline.backToTop.enabled;
  const minimumViewports = resolveMinimumViewports(props.minPageHeightViewports);
  const [isLongPage, setIsLongPage] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const updateVisibility = () => {
      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const viewportHeight = window.innerHeight;
      setIsLongPage(viewportHeight > 0 && height > viewportHeight && height >= viewportHeight * minimumViewports);
    };
    updateVisibility();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updateVisibility);
    observer?.observe(document.documentElement);
    observer?.observe(document.body);
    window.addEventListener("resize", updateVisibility);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateVisibility);
    };
  }, [enabled, minimumViewports]);

  const returnToTop = () => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    document.getElementById(props.targetId)?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: props.scrollBehavior ?? (reduceMotion ? "auto" : "smooth") });
  };

  if (!enabled || !isLongPage) return null;

  return (
    <div className={props.className ?? styles.container} data-testid={props.testId}>
      <button type="button" className={props.buttonClassName ?? styles.button} aria-label={props.label} title={props.label} onClick={returnToTop}>
        {props.children ?? <FiArrowUp className={styles.icon} aria-hidden="true" focusable="false" />}
      </button>
    </div>
  );
}
