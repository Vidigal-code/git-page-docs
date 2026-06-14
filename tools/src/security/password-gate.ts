import type { CredentialVault, PasswordGate, SensitiveOperation } from "../ports/security";
import { SecurityError } from "../errors/app-error";

/** Prompts the host environment for a password (CLI prompt, browser modal, …). */
export type PasswordPrompt = (context: {
  operation: SensitiveOperation;
  firstRun: boolean;
  attempt: number;
}) => Promise<string>;

export interface SessionPasswordGateOptions {
  readonly vault: CredentialVault;
  readonly prompt: PasswordPrompt;
  /** Max password attempts before authorize() throws. Default 3. */
  readonly maxAttempts?: number;
  /** Cache the verified password for the process lifetime. Default true. */
  readonly cacheForSession?: boolean;
}

/**
 * Authorizes sensitive operations behind the local password. On first run it
 * initializes the vault; subsequent calls verify (one unlock-per-session by
 * default). Returns the verified password so callers can read the vault.
 */
export class SessionPasswordGate implements PasswordGate {
  private cached?: string;

  constructor(private readonly options: SessionPasswordGateOptions) {}

  async authorize(operation: SensitiveOperation): Promise<string> {
    if (this.options.cacheForSession !== false && this.cached) {
      return this.cached;
    }

    const firstRun = !(await this.options.vault.isInitialized());
    const maxAttempts = this.options.maxAttempts ?? 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const password = await this.options.prompt({ operation, firstRun, attempt });

      if (firstRun) {
        await this.options.vault.initialize(password);
        return this.remember(password);
      }
      if (await this.options.vault.unlock(password)) {
        return this.remember(password);
      }
    }

    throw new SecurityError(`Authorization failed for "${operation}" after ${maxAttempts} attempts.`);
  }

  private remember(password: string): string {
    if (this.options.cacheForSession !== false) this.cached = password;
    return password;
  }

  /** Clears any cached password (e.g. on logout). */
  reset(): void {
    this.cached = undefined;
  }
}
