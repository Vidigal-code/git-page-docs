import { describe, it, expect } from "vitest";
import { NodeCryptoService } from "../src/crypto/node-crypto-service";
import { deriveDocAccessKeys, verifyDocAccess } from "../src/crypto/doc-access";

const crypto = new NodeCryptoService();

describe("doc access key pair (docs password gate)", () => {
  it("derives a deterministic double-hash key pair", async () => {
    const first = await deriveDocAccessKeys("hunter2", crypto);
    const second = await deriveDocAccessKeys("hunter2", crypto);
    expect(first).toEqual(second);
    expect(first.privateKey).toMatch(/^[0-9a-f]{64}$/);
    expect(first.publicKey).toMatch(/^[0-9a-f]{64}$/);
    expect(first.publicKey).not.toBe(first.privateKey);
  });

  it("accepts the password against the committed public key", async () => {
    const { publicKey } = await deriveDocAccessKeys("hunter2", crypto);
    expect(await verifyDocAccess("hunter2", publicKey, crypto)).toBe(true);
    expect(await verifyDocAccess("wrong-password", publicKey, crypto)).toBe(false);
  });

  it("accepts the private key as an alternative credential", async () => {
    const { privateKey, publicKey } = await deriveDocAccessKeys("hunter2", crypto);
    expect(await verifyDocAccess(privateKey, publicKey, crypto)).toBe(true);
  });

  it("rejects malformed inputs without throwing", async () => {
    const { publicKey } = await deriveDocAccessKeys("hunter2", crypto);
    expect(await verifyDocAccess("", publicKey, crypto)).toBe(false);
    expect(await verifyDocAccess("hunter2", "not-a-hash", crypto)).toBe(false);
  });
});
