import { ReactIconByTag } from "@/shared/ui/react-icon-by-tag";
import type { GuideHero as GuideHeroModel } from "../model/types";
import styles from "./introduction-guide-page.module.css";

/** Landing hero: eyebrow, title, subtitle, an install command and two calls to action. */
export function GuideHero({
  hero,
  projectUrl,
  onPrimary,
}: {
  hero: GuideHeroModel;
  projectUrl: string;
  onPrimary: () => void;
}) {
  return (
    <header className={styles.hero}>
      <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
      <h1 className={styles.heroTitle}>{hero.title}</h1>
      <p className={styles.heroSubtitle}>{hero.subtitle}</p>
      <div className={styles.heroInstall}>
        <span className={styles.heroPrompt} aria-hidden>$</span>
        <code className={styles.heroCommand}>{hero.install}</code>
      </div>
      <div className={styles.heroActions}>
        <button type="button" className={styles.primaryButton} onClick={onPrimary}>
          {hero.ctaPrimary}
        </button>
        <a className={styles.secondaryButton} href={projectUrl} target="_blank" rel="noreferrer">
          <span className={styles.buttonIcon} aria-hidden>
            <ReactIconByTag tag="FaGithubAlt" />
          </span>
          {hero.ctaSecondary}
        </a>
      </div>
    </header>
  );
}
