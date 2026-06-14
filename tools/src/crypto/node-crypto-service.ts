import {
  createHash,
  pbkdf2Sync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from "node:crypto";
import type { CryptoService, EncryptedPayload, KeyDerivationParams } from "../ports/crypto";
import { SecurityError } from "../errors/app-error";

const KEY_LENGTH = 32; // AES-256
const IV_LENGTH = 12; // GCM nonce
const DEFAULT_ITERATIONS = 210_000; // OWASP PBKDF2-SHA256 guidance
const DIGEST = "sha256";

/** Node.js implementation of the CryptoService port (CLI + MCP). */
export class NodeCryptoService implements CryptoService {
  constructor(private readonly iterations: number = DEFAULT_ITERATIONS) {}

  async sha256(input: string): Promise<string> {
    return createHash("sha256").update(input, "utf8").digest("hex");
  }

  async deriveKey(password: string, params: KeyDerivationParams): Promise<Uint8Array> {
    const salt = Buffer.from(params.salt, "base64");
    return new Uint8Array(pbkdf2Sync(password, salt, params.iterations, KEY_LENGTH, DIGEST));
  }

  async encrypt(plaintext: string, password: string): Promise<EncryptedPayload> {
    const kdf: KeyDerivationParams = {
      salt: randomBytes(16).toString("base64"),
      iterations: this.iterations,
    };
    const key = await this.deriveKey(password, kdf);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    this.wipe(key);
    return {
      ciphertext: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      kdf,
    };
  }

  async decrypt(payload: EncryptedPayload, password: string): Promise<string> {
    if (!payload.authTag) {
      throw new SecurityError("Missing authentication tag for AES-256-GCM payload.");
    }
    const key = await this.deriveKey(password, payload.kdf);
    try {
      const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(payload.iv, "base64"));
      decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(payload.ciphertext, "base64")),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    } catch (cause) {
      // Wrong password or tampered ciphertext both surface here.
      throw new SecurityError("Failed to decrypt payload (wrong password or corrupted data).", { cause });
    } finally {
      this.wipe(key);
    }
  }

  mask(secret: string): string {
    if (!secret) return "";
    if (secret.length <= 8) return "…";
    return `${secret.slice(0, 3)}…${secret.slice(-4)}`;
  }

  wipe(buffer: Uint8Array): void {
    buffer.fill(0);
  }
}

/** Constant-time comparison of two hex digests. */
export function safeHexEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
