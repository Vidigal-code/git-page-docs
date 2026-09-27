import styles from "./repository-source-browser.module.css";

/** Placeholder rows per pane, sized to read as a file tree and a file listing. */
const SIDEBAR_ROW_WIDTHS = ["72%", "58%", "84%", "64%", "48%", "76%"] as const;
const PANEL_ROW_WIDTHS = ["46%", "62%", "38%"] as const;
const VIEWER_ROW_WIDTHS = ["88%", "74%", "92%", "60%", "80%", "68%", "84%"] as const;
/** Fields of the browser's owner/repo/branch/submit toolbar form. */
const FORM_FIELDS = ["owner", "repo", "branch"] as const;

interface SourceBrowserSkeletonProps {
  /**
   * Accessible status text. When omitted the skeleton is purely decorative —
   * use that form when a labelled loading state is already announced nearby.
   */
  label?: string;
  /** Must mirror the browser's own flag so the reserved toolbar matches. */
  showSearchForm?: boolean;
}

/** Widths are distinct per pane, so each one doubles as its row's key. */
function SkeletonRows({ widths }: Readonly<{ widths: ReadonlyArray<string> }>) {
  return (
    <div className={`${styles.skeletonTree} ${styles.skeletonPane}`} aria-hidden>
      {widths.map((width) => (
        <span key={width} className={styles.skeletonRow} style={{ width }} />
      ))}
    </div>
  );
}

/**
 * Height-stable stand-in for {@link RepositorySourceBrowser}.
 *
 * It reuses the browser's own stylesheet, so the frame it reserves — including
 * every responsive height — is the same box the browser will occupy. Rendering
 * it while the browser's chunk or its initial route resolves keeps the
 * surrounding card from loading collapsed and then stretching.
 */
export function SourceBrowserSkeleton({ label, showSearchForm = true }: Readonly<SourceBrowserSkeletonProps>) {
  return (
    <div
      className={styles.browser}
      {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
    >
      <section className={styles.toolbar}>
        <div className={styles.titleRow}>
          <div className={styles.title}>
            <span className={styles.skeletonInline} />
          </div>
          <span className={styles.externalLink} />
        </div>
        {showSearchForm ? (
          <div className={styles.form}>
            {FORM_FIELDS.map((field) => (
              <span key={field} className={styles.input} />
            ))}
            <span className={styles.button} />
          </div>
        ) : null}
      </section>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader} />
          <div className={styles.tree}>
            <SkeletonRows widths={SIDEBAR_ROW_WIDTHS} />
          </div>
        </aside>
        <div className={styles.main}>
          <section className={styles.panel}>
            <div className={styles.breadcrumb} />
            <div className={styles.fileList}>
              <SkeletonRows widths={PANEL_ROW_WIDTHS} />
            </div>
          </section>
          <section className={styles.viewer}>
            <div className={styles.viewerHeader} />
            <div className={styles.codeScroll}>
              <SkeletonRows widths={VIEWER_ROW_WIDTHS} />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
