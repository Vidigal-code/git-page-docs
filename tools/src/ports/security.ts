/**
 * Security ports: password gate + credential vault. Implemented in Phase 5.
 * Sensitive operations (generate/update docs, analyze, run AI, deploy, run MCP)
 * must pass through the gate before executing.
 */
import type { EncryptedPayload } from "./crypto";

export type SensitiveOperation =
  | "generate-docs"
  | "update-docs"
  | "analyze-project"
  | "run-ai"
  | "deploy"
  | "run-mcp";

export interface StoredCredential {
  readonly providerId: string;
  /** Encrypted secret; plaintext is never persisted. */
  readonly secret: EncryptedPayload;
  readonly updatedAtIso?: string;
}

export interface CredentialVault {
  isInitialized(): Promise<boolean>;
  /** Establish the local password (first run) and create an empty vault. */
  initialize(password: string): Promise<void>;
  unlock(password: string): Promise<boolean>;
  setCredential(password: string, providerId: string, secret: string): Promise<void>;
  /** Returns the decrypted secret only when the password is correct. */
  getCredential(password: string, providerId: string): Promise<string | undefined>;
  listProviders(): Promise<readonly string[]>;
  removeCredential(password: string, providerId: string): Promise<void>;
}

export interface PasswordGate {
  /**
   * Authorize a sensitive operation. Implementations prompt for / verify the
   * local password (one unlock-per-session policy) and throw SecurityError on
   * failure. Returns the unlock token/password handle for downstream vault use.
   */
  authorize(operation: SensitiveOperation): Promise<string>;
}
