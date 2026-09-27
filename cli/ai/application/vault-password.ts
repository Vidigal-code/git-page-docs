import { SecurityError } from "@gitpagedocs/tools";
import type { AiKeyVault } from "../infrastructure/ai-key-vault";

/** Non-interactive runs (CI, pipes) supply the vault password through this variable. */
export const VAULT_PASSWORD_ENV = "GITPAGEDOCS_VAULT_PASSWORD";

const DEFAULT_MAX_ATTEMPTS = 3;

/** How the host asks for the password (terminal prompt, test double, ...). */
export interface VaultPasswordPrompt {
  /** First run: let the user choose (and confirm) the password. */
  create(): Promise<string>;
  /** Later runs: ask for the existing password; `attempt` starts at 1. */
  unlock(attempt: number): Promise<string>;
}

export type PasswordVault = Pick<AiKeyVault, "isInitialized" | "initialize" | "unlock">;

export interface ResolveVaultPasswordInput {
  readonly vault: PasswordVault;
  /** Defaults to process.env. */
  readonly env?: Readonly<Record<string, string | undefined>>;
  /** Absent when no terminal is available. */
  readonly prompt?: VaultPasswordPrompt;
  readonly maxAttempts?: number;
}

/**
 * The verified vault password for this run. Order: the environment variable
 * (initializing the vault on first use), otherwise the prompt — create on first
 * run, unlock afterwards with up to three attempts. The password is asked on
 * every command run; it is never persisted.
 */
export async function resolveVaultPassword(input: ResolveVaultPasswordInput): Promise<string> {
  const env = input.env ?? process.env;
  const initialized = await input.vault.isInitialized();

  const fromEnv = env[VAULT_PASSWORD_ENV]?.trim();
  if (fromEnv) {
    if (!initialized) {
      await input.vault.initialize(fromEnv);
      return fromEnv;
    }
    if (await input.vault.unlock(fromEnv)) return fromEnv;
    throw new SecurityError(`${VAULT_PASSWORD_ENV} does not match the vault password.`);
  }

  if (!input.prompt) {
    throw new SecurityError(
      `A password is required to read the encrypted API key. Run the command in a terminal or set ${VAULT_PASSWORD_ENV}.`,
    );
  }

  if (!initialized) {
    const password = await input.prompt.create();
    await input.vault.initialize(password);
    return password;
  }

  const maxAttempts = input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const password = await input.prompt.unlock(attempt);
    if (await input.vault.unlock(password)) return password;
  }
  throw new SecurityError(`Vault password rejected after ${maxAttempts} attempts.`);
}
