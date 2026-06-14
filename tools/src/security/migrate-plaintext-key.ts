import type { CredentialVault } from "../ports/security";

export interface PlaintextMigrationInput {
  readonly vault: CredentialVault;
  readonly password: string;
  /** Catalog provider id the key belongs to (e.g. "anthropic"). */
  readonly providerId: string;
  /** The legacy plaintext secret to import. */
  readonly plaintextKey: string;
  /** Clears the legacy plaintext store once the key is sealed. */
  readonly clearPlaintext: () => void | Promise<void>;
}

export interface PlaintextMigrationResult {
  readonly migrated: boolean;
  readonly initializedVault: boolean;
}

/**
 * Move a legacy plaintext API key into the encrypted vault, then wipe the
 * plaintext source. Initializes the vault on first run. Idempotent: a blank key
 * is a no-op.
 */
export async function migratePlaintextKey(
  input: PlaintextMigrationInput,
): Promise<PlaintextMigrationResult> {
  if (!input.plaintextKey) {
    return { migrated: false, initializedVault: false };
  }
  let initializedVault = false;
  if (!(await input.vault.isInitialized())) {
    await input.vault.initialize(input.password);
    initializedVault = true;
  }
  await input.vault.setCredential(input.password, input.providerId, input.plaintextKey);
  await input.clearPlaintext();
  return { migrated: true, initializedVault };
}
