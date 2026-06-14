import type { CredentialVault } from "../ports/security";
import type { CryptoService, EncryptedPayload } from "../ports/crypto";
import { SecurityError } from "../errors/app-error";

/** Pluggable persistence for the encrypted vault (file, web storage, …). */
export interface VaultStorage {
  load(): Promise<string | null>;
  save(serialized: string): Promise<void>;
  /** Permanently remove the stored vault (used by a password reset). */
  clear(): Promise<void>;
}

interface VaultFile {
  readonly version: 1;
  /** Encrypts a fixed sentinel so a password can be verified before use. */
  readonly verifier: EncryptedPayload;
  readonly credentials: Record<string, EncryptedPayload>;
}

const SENTINEL = "gitpagedocs::vault::v1";

/**
 * Password-encrypted credential store. Plaintext secrets are never persisted;
 * every secret is sealed with AES-256-GCM under a PBKDF2-derived key.
 */
export class EncryptedCredentialVault implements CredentialVault {
  private file?: VaultFile;

  constructor(
    private readonly storage: VaultStorage,
    private readonly crypto: CryptoService,
  ) {}

  private async read(): Promise<VaultFile | undefined> {
    if (this.file) return this.file;
    const raw = await this.storage.load();
    if (!raw) return undefined;
    this.file = JSON.parse(raw) as VaultFile;
    return this.file;
  }

  private async write(file: VaultFile): Promise<void> {
    this.file = file;
    await this.storage.save(JSON.stringify(file));
  }

  async isInitialized(): Promise<boolean> {
    return (await this.read()) !== undefined;
  }

  async initialize(password: string): Promise<void> {
    if (await this.isInitialized()) {
      throw new SecurityError("Vault is already initialized.");
    }
    const verifier = await this.crypto.encrypt(SENTINEL, password);
    await this.write({ version: 1, verifier, credentials: {} });
  }

  async unlock(password: string): Promise<boolean> {
    const file = await this.read();
    if (!file) throw new SecurityError("Vault is not initialized.");
    try {
      const value = await this.crypto.decrypt(file.verifier, password);
      return value === SENTINEL;
    } catch {
      return false;
    }
  }

  private async requireUnlocked(password: string): Promise<VaultFile> {
    const file = await this.read();
    if (!file) throw new SecurityError("Vault is not initialized.");
    if (!(await this.unlock(password))) {
      throw new SecurityError("Incorrect vault password.");
    }
    return file;
  }

  async setCredential(password: string, providerId: string, secret: string): Promise<void> {
    const file = await this.requireUnlocked(password);
    const sealed = await this.crypto.encrypt(secret, password);
    await this.write({
      ...file,
      credentials: { ...file.credentials, [providerId]: sealed },
    });
  }

  async getCredential(password: string, providerId: string): Promise<string | undefined> {
    const file = await this.requireUnlocked(password);
    const sealed = file.credentials[providerId];
    if (!sealed) return undefined;
    return this.crypto.decrypt(sealed, password);
  }

  async listProviders(): Promise<readonly string[]> {
    const file = await this.read();
    return file ? Object.keys(file.credentials) : [];
  }

  async removeCredential(password: string, providerId: string): Promise<void> {
    const file = await this.requireUnlocked(password);
    const next = { ...file.credentials };
    delete next[providerId];
    await this.write({ ...file, credentials: next });
  }

  /**
   * Wipe the whole vault — every stored credential and the password verifier.
   * Used by a "forgot password" reset: the user loses all saved keys and then
   * creates a fresh password. No password is required (the point is recovery
   * when the password is lost).
   */
  async reset(): Promise<void> {
    this.file = undefined;
    await this.storage.clear();
  }
}
