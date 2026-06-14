import type { CryptoService, EncryptedPayload, KeyDerivationParams } from "../ports/crypto";
import { SecurityError } from "../errors/app-error";

const KEY_BITS = 256;
const IV_LENGTH = 12;
const DEFAULT_ITERATIONS = 210_000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

// Web Crypto args must be ArrayBuffer-backed (BufferSource) under DOM lib; the
// cast keeps this file valid under both the Node-typed and DOM-typed programs.
function enc(text: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(text) as Uint8Array<ArrayBuffer>;
}

/**
 * Web Crypto (SubtleCrypto) implementation of CryptoService for the browser.
 * Also runs under Node 22 (globalThis.crypto). AES-GCM keeps the auth tag inside
 * the ciphertext, so a payload encrypted here is decrypted here.
 */
export class WebCryptoService implements CryptoService {
  constructor(private readonly iterations: number = DEFAULT_ITERATIONS) {}

  // Return type is inferred (SubtleCrypto) to avoid pulling DOM lib type names
  // into this Node-typed package.
  private get subtle() {
    const c = globalThis.crypto;
    if (!c?.subtle) throw new SecurityError("Web Crypto API is unavailable in this runtime.");
    return c.subtle;
  }

  async sha256(input: string): Promise<string> {
    const digest = await this.subtle.digest("SHA-256", enc(input));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async deriveKey(password: string, params: KeyDerivationParams): Promise<Uint8Array> {
    const bits = await this.deriveBits(password, params);
    return new Uint8Array(bits);
  }

  private async deriveBits(password: string, params: KeyDerivationParams): Promise<ArrayBuffer> {
    const baseKey = await this.subtle.importKey("raw", enc(password), "PBKDF2", false, ["deriveBits"]);
    return this.subtle.deriveBits(
      { name: "PBKDF2", salt: fromBase64(params.salt), iterations: params.iterations, hash: "SHA-256" },
      baseKey,
      KEY_BITS,
    );
  }

  // Returns an AES-GCM CryptoKey (type inferred to avoid DOM lib names).
  private async aesKey(password: string, params: KeyDerivationParams) {
    const bits = await this.deriveBits(password, params);
    return this.subtle.importKey("raw", bits, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }

  async encrypt(plaintext: string, password: string): Promise<EncryptedPayload> {
    const kdf: KeyDerivationParams = {
      salt: toBase64(globalThis.crypto.getRandomValues(new Uint8Array(16))),
      iterations: this.iterations,
    };
    const iv: Uint8Array<ArrayBuffer> = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await this.aesKey(password, kdf);
    const encrypted = await this.subtle.encrypt({ name: "AES-GCM", iv }, key, enc(plaintext));
    return { ciphertext: toBase64(new Uint8Array(encrypted)), iv: toBase64(iv), kdf };
  }

  async decrypt(payload: EncryptedPayload, password: string): Promise<string> {
    const key = await this.aesKey(password, payload.kdf);
    try {
      const decrypted = await this.subtle.decrypt(
        { name: "AES-GCM", iv: fromBase64(payload.iv) },
        key,
        fromBase64(payload.ciphertext),
      );
      return new TextDecoder().decode(decrypted);
    } catch (cause) {
      throw new SecurityError("Failed to decrypt payload (wrong password or corrupted data).", { cause });
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
