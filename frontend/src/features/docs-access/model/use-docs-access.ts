import { useCallback, useEffect, useState } from "react";
import { WebCryptoService, verifyDocAccess } from "@gitpagedocs/tools/crypto/web";

export type DocsAccessState = "loading" | "locked" | "unlocked";

export interface DocsAccessConfigInput {
  enabled?: boolean;
  publicKey?: string;
}

export interface UseDocsAccessResult {
  /** Whether the gate is enabled at all (config has enabled + publicKey). */
  enabled: boolean;
  state: DocsAccessState;
  /** Verify a password OR private key; persists + unlocks on success. */
  unlock: (input: string) => Promise<boolean>;
  /** Clear the cached unlock so the next visit re-blocks. */
  lockAgain: () => void;
}

/** Same convention as use-docs-preferences buildStorageKey, scoped to this site. */
function buildStorageKey(siteName: string): string {
  return `git-page-docs:docs-access:${siteName.toLowerCase().replaceAll(" ", "-")}`;
}

function readCache(storageKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeCache(storageKey: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Ignore storage failures (private mode, blocked storage).
  }
}

function clearCache(storageKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Documentation-wide access gate state. Backward compatible: when the gate is
 * disabled or no public key is configured, the state is "unlocked" (docs open).
 * The cache stores ONLY the public hash; the password/private key is never
 * persisted, and a changed config public key invalidates a stale cache.
 */
export function useDocsAccess(
  config: DocsAccessConfigInput | undefined,
  siteName: string,
): UseDocsAccessResult {
  const enabled = Boolean(config?.enabled);
  const publicKey = (config?.publicKey ?? "").trim();
  const gateActive = enabled && publicKey.length > 0;
  const storageKey = buildStorageKey(siteName);
  const [state, setState] = useState<DocsAccessState>("loading");

  useEffect(() => {
    if (!gateActive) {
      setState("unlocked");
      return;
    }
    const cached = readCache(storageKey);
    setState(cached && cached === publicKey ? "unlocked" : "locked");
  }, [gateActive, publicKey, storageKey]);

  const unlock = useCallback(
    async (input: string): Promise<boolean> => {
      if (!publicKey) return false;
      const ok = await verifyDocAccess(input.trim(), publicKey, new WebCryptoService());
      if (!ok) return false;
      writeCache(storageKey, publicKey);
      setState("unlocked");
      return true;
    },
    [publicKey, storageKey],
  );

  const lockAgain = useCallback(() => {
    clearCache(storageKey);
    setState("locked");
  }, [storageKey]);

  return { enabled: gateActive, state, unlock, lockAgain };
}
