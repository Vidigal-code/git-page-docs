"use client";

/**
 * @file md-source-actions.tsx
 * @description "Copy markdown" and "Download .md" buttons shown next to the
 * fullscreen button of markdown pages. Both work on the page's original file
 * text (not the rendered HTML), in the language being read.
 */
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy, FiDownload } from "@/shared/ui/fallback-icons";
import styles from "../../docs-shell.module.css";

export interface MdSourceActionLabels {
  copy: string;
  copied: string;
  copyError: string;
  download: string;
}

const COPY_FEEDBACK_MS = 2000;

/** `…/pt/getting-started.md` -> `getting-started.md`; without a path, a slug of the title. */
export function markdownFileName(path: string | undefined, title?: string): string {
  const base = path?.split(/[\\/]/).pop()?.trim();
  if (base) return /\.md$/i.test(base) ? base : `${base}.md`;
  const slug = (title ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "document"}.md`;
}

/** Clipboard API first; the hidden-textarea fallback covers non-secure contexts. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

function downloadText(text: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.click();
  // Revoke after the click has been handed to the browser.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

interface MdSourceActionsProps {
  source: string;
  fileName: string;
  labels: MdSourceActionLabels;
  /** True when the fullscreen button sits at the right edge, so these shift left of it. */
  besideFullscreen?: boolean;
}

export function MdSourceActions({ source, fileName, labels, besideFullscreen = false }: Readonly<MdSourceActionsProps>) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(source);
    setCopyState(ok ? "copied" : "error");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), COPY_FEEDBACK_MS);
  };

  const copyLabel = { idle: labels.copy, copied: labels.copied, error: labels.copyError }[copyState];

  return (
    <div className={`${styles.mdSourceActions} ${besideFullscreen ? styles.mdSourceActionsBesideFullscreen : ""}`}>
      <button
        type="button"
        data-testid="md-copy"
        className={`${styles.fullscreenButton} ${copyState === "copied" ? styles.mdSourceActionDone : ""}`}
        onClick={() => void handleCopy()}
        aria-label={copyLabel}
        title={copyLabel}
      >
        {copyState === "copied" ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
      </button>
      <button
        type="button"
        data-testid="md-download"
        className={styles.fullscreenButton}
        onClick={() => downloadText(source, fileName)}
        aria-label={labels.download}
        title={labels.download}
      >
        <FiDownload aria-hidden />
      </button>
      <span role="status" className={styles.visuallyHidden}>
        {copyState === "idle" ? "" : copyLabel}
      </span>
    </div>
  );
}
