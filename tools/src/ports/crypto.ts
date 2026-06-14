/**
 * Crypto port. Implemented in Phase 4/5 with Node `crypto` and Web Crypto
 * adapters. Powers the password-gated, encrypted credential vault.
 */
export interface KeyDerivationParams {
  /** Base64/hex salt. Generated per vault, persisted alongside the ciphertext. */
  readonly salt: string;
  /** Iteration count (PBKDF2) or cost parameter (scrypt). */
  readonly iterations: number;
}

export interface EncryptedPayload {
  /** Base64 ciphertext. */
  readonly ciphertext: string;
  /** Base64 initialization vector / nonce. */
  readonly iv: string;
  /** Authentication tag for AEAD ciphers (base64). */
  readonly authTag?: string;
  readonly kdf: KeyDerivationParams;
}

export interface CryptoService {
  /** Hex-encoded SHA-256 digest of the input. */
  sha256(input: string): Promise<string>;
  /** Derive a symmetric key from a password + KDF params. */
  deriveKey(password: string, params: KeyDerivationParams): Promise<Uint8Array>;
  encrypt(plaintext: string, password: string): Promise<EncryptedPayload>;
  decrypt(payload: EncryptedPayload, password: string): Promise<string>;
  /** Non-reversible display mask, e.g. "sk-…a1b2" — never reveals the secret. */
  mask(secret: string): string;
  /** Best-effort secure wipe of an in-memory buffer. */
  wipe(buffer: Uint8Array): void;
}
