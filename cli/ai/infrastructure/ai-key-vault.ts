import path from "node:path";
import { existsSync } from "node:fs";
import {
  EncryptedCredentialVault,
  FileVaultStorage,
  NodeCryptoService,
  resolveUserConfigDir,
} from "@gitpagedocs/tools";

export const AI_KEY_VAULT_FILENAME = ".gitpagedocsvault";

export interface AiKeyVaultOptions {
  /** Directory of the vault file; defaults to the per-user OS config directory. */
  configDir?: string;
}

/**
 * Password-encrypted store for the CLI's AI API keys, kept next to
 * `.gitpagedocsconfig` in the per-user config directory. Every key is sealed
 * with AES-256-GCM under a key derived from the password by PBKDF2-HMAC-SHA-256
 * (210,000 iterations, random salt); the file never holds a key in clear and
 * only the password decrypts it.
 */
export class AiKeyVault {
  private readonly filePath: string;
  private readonly vault: EncryptedCredentialVault;

  constructor(options: AiKeyVaultOptions = {}) {
    this.filePath = path.join(options.configDir ?? resolveUserConfigDir(), AI_KEY_VAULT_FILENAME);
    this.vault = new EncryptedCredentialVault(new FileVaultStorage(this.filePath), new NodeCryptoService());
  }

  getVaultPath(): string {
    return this.filePath;
  }

  /** True once a password has been set (the vault file exists). */
  isInitialized(): Promise<boolean> {
    return this.vault.isInitialized();
  }

  initialize(password: string): Promise<void> {
    return this.vault.initialize(password);
  }

  /** Whether `password` opens the vault; never throws for a wrong password. */
  unlock(password: string): Promise<boolean> {
    return this.vault.unlock(password);
  }

  setKey(password: string, providerId: string, apiKey: string): Promise<void> {
    return this.vault.setCredential(password, providerId, apiKey);
  }

  getKey(password: string, providerId: string): Promise<string | undefined> {
    return this.vault.getCredential(password, providerId);
  }

  /** Deletes the vault file with every sealed key. Returns whether a file existed. */
  async clear(): Promise<boolean> {
    const existed = existsSync(this.filePath);
    await this.vault.reset();
    return existed;
  }
}
