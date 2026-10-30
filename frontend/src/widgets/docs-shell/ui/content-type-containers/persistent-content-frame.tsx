"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FiX, MdFullscreen } from "@/shared/ui/fallback-icons";
import { PageContentBrowseNav } from "../page-content-browse-nav";
import { getFullscreenInnerClassName, type FullscreenAlign } from "./fullscreen-alignment";
import type { ContainerWrapperFrameProps } from "./container-wrapper-props";
import styles from "../../docs-shell.module.css";

interface PersistentContentFrameProps extends ContainerWrapperFrameProps {
  header?: ReactNode;
  footer?: ReactNode;
  fullscreenAlign?: FullscreenAlign;
  children: ReactNode;
}

type ExpansionMode = "inline" | "expanded" | "fullscreen";
const EXPANDED_MIN_HEIGHT = "80vh";

/** Expands the existing player or browsing context without mounting a second copy. */
export function PersistentContentFrame(props: Readonly<PersistentContentFrameProps>) {
  const [mode, setMode] = useState<ExpansionMode>("inline");
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const expanded = mode !== "inline";
  const { pagination, fullscreenAlign = "start", onBeforeFullscreen, onAfterFullscreen } = props;
  const paginationTop = pagination?.placement === "top" || pagination?.placement === "both" ? pagination.content : null;
  const paginationBottom = pagination?.placement !== "top" ? pagination?.content : null;

  const collapse = useCallback(() => {
    setMode("inline");
    onAfterFullscreen?.();
    buttonRef.current?.focus({ preventScroll: true });
  }, [onAfterFullscreen]);
  const close = useCallback(async () => {
    if (mode !== "fullscreen") return collapse();
    try {
      await document.exitFullscreen();
    } catch (error) {
      // eslint-disable-next-line no-console -- Keep the actual fullscreen state and report the browser failure.
      console.warn("Could not exit fullscreen. Use the browser fullscreen controls to close it.", error);
    }
  }, [mode, collapse]);
  const syncFullscreen = useCallback(() => {
    const ownsFullscreen = document.fullscreenElement && panelRef.current?.contains(document.fullscreenElement);
    if (ownsFullscreen && mode !== "fullscreen") {
      setMode("fullscreen");
      onBeforeFullscreen?.();
      buttonRef.current?.focus({ preventScroll: true });
    } else if (!ownsFullscreen && mode === "fullscreen") {
      collapse();
    }
  }, [mode, onBeforeFullscreen, collapse]);
  const dismissExpanded = useCallback((event: KeyboardEvent) => {
    if (mode !== "inline" && event.key === "Escape" && event.target instanceof Node && panelRef.current?.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      void close();
    }
  }, [mode, close]);
  useEffect(() => {
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("keydown", dismissExpanded, true);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("keydown", dismissExpanded, true);
    };
  }, [syncFullscreen, dismissExpanded]);

  const open = async () => {
    const panel = panelRef.current;
    if (!panel) return;
    if (typeof panel.requestFullscreen === "function") {
      try {
        await panel.requestFullscreen();
        return;
      } catch (error) {
        // eslint-disable-next-line no-console -- Report browser permission failures while offering inline expansion.
        console.warn("Fullscreen unavailable; expanding the content within the page.", error);
      }
    }
    if (!panel.isConnected) return;
    setMode("expanded");
    props.onBeforeFullscreen?.();
    buttonRef.current?.focus({ preventScroll: true });
  };
  const label = expanded ? props.fullscreenCloseLabel : props.fullscreenExpandLabel;
  return (
    <div className={styles.contentContainerWrapper} style={{ marginTop: props.marginTop?.trim() || "0", marginBottom: props.marginBottom?.trim() || "0" }}>
      {props.header}
      {props.browseNav && <PageContentBrowseNav browseNav={props.browseNav} />}
      <section ref={panelRef} id={panelId} aria-label={expanded ? label : undefined}
        className={mode === "fullscreen" ? styles.contentContainerFullscreen : styles.contentContainerWithButton}
        style={mode === "expanded" ? { minHeight: EXPANDED_MIN_HEIGHT, paddingTop: "48px" } : undefined}>
        {props.fullscreenEnabled && <button ref={buttonRef} type="button" onClick={expanded ? close : open}
          className={expanded ? styles.fullscreenCloseButton : styles.fullscreenButtonInside}
          aria-label={label} title={label} aria-expanded={expanded} aria-controls={panelId}>
          {expanded ? <FiX aria-hidden /> : <MdFullscreen aria-hidden />}
        </button>}
        <div className={mode === "fullscreen" ? getFullscreenInnerClassName(fullscreenAlign) : undefined}>
          {paginationTop}
          {props.children}
          {paginationBottom}
        </div>
      </section>
      {props.footer}
    </div>
  );
}
