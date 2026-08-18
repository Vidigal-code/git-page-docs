import Link from "next/link";
import { FiCode } from "@/shared/ui/fallback-icons";
import styles from "./source-viewer-link.module.css";

interface SourceViewerLinkProps {
  /** Route to open, already resolved by the caller (defaults or a typed repository). */
  href: string;
  /** Short line explaining what the viewer offers. */
  hint: string;
  /** Call to action on the link itself. */
  actionLabel: string;
}

/**
 * Signpost from a search-style entry screen to the standalone source viewer.
 * Rendered as a link (not a button) so it keeps native open-in-new-tab and
 * copy-address behaviour, and Next.js applies the configured basePath.
 */
export function SourceViewerLink({ href, hint, actionLabel }: SourceViewerLinkProps) {
  return (
    <aside className={styles.container}>
      <p className={styles.hint}>{hint}</p>
      <Link className={styles.action} href={href}>
        <FiCode aria-hidden className={styles.icon} />
        <span>{actionLabel}</span>
      </Link>
    </aside>
  );
}
