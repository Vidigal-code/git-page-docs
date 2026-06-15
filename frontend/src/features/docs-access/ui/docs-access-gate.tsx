"use client";

import { useState, type FormEvent } from "react";
import styles from "./docs-access-gate.module.css";

export interface DocsAccessTexts {
  title: string;
  description: string;
  placeholder: string;
  unlockBtn: string;
  wrongCredential: string;
}

interface DocsAccessGateProps {
  texts: DocsAccessTexts;
  onUnlock: (input: string) => Promise<boolean>;
}

/** Full-page gate shown when the documentation is locked behind a password. */
export function DocsAccessGate({ texts, onUnlock }: DocsAccessGateProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !value.trim()) return;
    setBusy(true);
    const ok = await onUnlock(value);
    setBusy(false);
    setError(!ok);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={texts.title}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>{texts.title}</h1>
        <p className={styles.description}>{texts.description}</p>
        <input
          className={styles.input}
          type="password"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(false);
          }}
          placeholder={texts.placeholder}
          autoFocus
          autoComplete="off"
        />
        {error && <p className={styles.error}>{texts.wrongCredential}</p>}
        <button className={styles.button} type="submit" disabled={busy || !value.trim()}>
          {texts.unlockBtn}
        </button>
      </form>
    </div>
  );
}
