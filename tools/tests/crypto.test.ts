import { describe, it, expect } from "vitest";
import { NodeCryptoService, safeHexEqual } from "../src/crypto/node-crypto-service";
import { WebCryptoService } from "../src/crypto/web-crypto-service";
import { SecurityError } from "../src/errors/app-error";

const SHA_ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

describe.each([
  ["NodeCryptoService", new NodeCryptoService(50_000)],
  ["WebCryptoService", new WebCryptoService(50_000)],
])("%s", (_name, crypto) => {
  it("sha256 matches known vector", async () => {
    expect(await crypto.sha256("abc")).toBe(SHA_ABC);
  });

  it("encrypt/decrypt round trips", async () => {
    const sealed = await crypto.encrypt("super-secret", "pw");
    expect(JSON.stringify(sealed)).not.toContain("super-secret");
    expect(await crypto.decrypt(sealed, "pw")).toBe("super-secret");
  });

  it("rejects wrong password with SecurityError", async () => {
    const sealed = await crypto.encrypt("x", "pw");
    await expect(crypto.decrypt(sealed, "bad")).rejects.toBeInstanceOf(SecurityError);
  });

  it("masks secrets without revealing them", () => {
    expect(crypto.mask("sk-1234567890")).not.toContain("1234567890");
    expect(crypto.mask("short")).toBe("…");
    expect(crypto.mask("")).toBe("");
  });

  it("wipe zeroes the buffer", () => {
    const buf = new Uint8Array([1, 2, 3]);
    crypto.wipe(buf);
    expect([...buf]).toEqual([0, 0, 0]);
  });

  it("deriveKey is deterministic for same salt", async () => {
    const params = { salt: Buffer.from("salt").toString("base64"), iterations: 1000 };
    const a = await crypto.deriveKey("pw", params);
    const b = await crypto.deriveKey("pw", params);
    expect([...a]).toEqual([...b]);
  });
});

describe("NodeCryptoService extras", () => {
  it("decrypt throws when authTag missing", async () => {
    const crypto = new NodeCryptoService(1000);
    const sealed = await crypto.encrypt("x", "pw");
    const broken = { ...sealed, authTag: undefined };
    await expect(crypto.decrypt(broken, "pw")).rejects.toBeInstanceOf(SecurityError);
  });

  it("safeHexEqual compares constant-time", async () => {
    const crypto = new NodeCryptoService(1000);
    const h = await crypto.sha256("a");
    expect(safeHexEqual(h, h)).toBe(true);
    expect(safeHexEqual(h, h.replace(/.$/, "0"))).toBe(false);
    expect(safeHexEqual("aa", "aabb")).toBe(false);
  });
});
