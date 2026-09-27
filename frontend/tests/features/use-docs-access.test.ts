// @vitest-environment jsdom
import { webcrypto } from "node:crypto";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { WebCryptoService, deriveDocAccessKeys, type DocAccessKeys } from "@gitpagedocs/tools/crypto/web";
import { useDocsAccess } from "@/features/docs-access/model/use-docs-access";

// jsdom may expose a window.crypto without SubtleCrypto; the hook only needs
// the standard Web Crypto surface, which Node's implementation provides.
if (!globalThis.crypto?.subtle) {
  vi.stubGlobal("crypto", webcrypto);
}

const PASSWORD = "hunter2";
const STORAGE_KEY = "git-page-docs:docs-access:my-docs";
let keys: DocAccessKeys;

beforeAll(async () => {
  keys = await deriveDocAccessKeys(PASSWORD, new WebCryptoService());
});

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderGate(config: Parameters<typeof useDocsAccess>[0]) {
  return renderHook(({ cfg }) => useDocsAccess(cfg, "My Docs"), { initialProps: { cfg: config } });
}

describe("useDocsAccess", () => {
  it("is open when the gate is not configured", async () => {
    const { result } = renderGate(undefined);
    expect(result.current.enabled).toBe(false);
    expect(result.current.state).toBe("unlocked");
    await expect(result.current.unlock("anything")).resolves.toBe(false);
  });

  it("is open when enabled without a public key (backward compatible)", () => {
    const { result } = renderGate({ enabled: true, publicKey: "   " });
    expect(result.current.enabled).toBe(false);
    expect(result.current.state).toBe("unlocked");
  });

  it("locks when enabled with a key and nothing is cached", () => {
    const { result } = renderGate({ enabled: true, publicKey: keys.publicKey });
    expect(result.current.enabled).toBe(true);
    expect(result.current.state).toBe("locked");
  });

  it("stays unlocked only while the cached hash matches the configured key", () => {
    window.localStorage.setItem(STORAGE_KEY, keys.publicKey);
    const fresh = renderGate({ enabled: true, publicKey: keys.publicKey });
    expect(fresh.result.current.state).toBe("unlocked");

    window.localStorage.setItem(STORAGE_KEY, "stale-hash");
    const stale = renderGate({ enabled: true, publicKey: keys.publicKey });
    expect(stale.result.current.state).toBe("locked");
  });

  it("rejects a wrong credential without touching the cache", async () => {
    const { result } = renderGate({ enabled: true, publicKey: keys.publicKey });
    let ok = true;
    await act(async () => {
      ok = await result.current.unlock("wrong");
    });
    expect(ok).toBe(false);
    expect(result.current.state).toBe("locked");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("unlocks with the password and caches only the public hash", async () => {
    const { result } = renderGate({ enabled: true, publicKey: keys.publicKey });
    let ok = false;
    await act(async () => {
      ok = await result.current.unlock(`  ${PASSWORD} `);
    });
    expect(ok).toBe(true);
    expect(result.current.state).toBe("unlocked");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(keys.publicKey);
    expect(JSON.stringify(window.localStorage)).not.toContain(PASSWORD);
  });

  it("unlocks with the shareable private key as well", async () => {
    const { result } = renderGate({ enabled: true, publicKey: keys.publicKey });
    await act(async () => {
      await result.current.unlock(keys.privateKey);
    });
    expect(result.current.state).toBe("unlocked");
  });

  it("re-locks and clears the cache on lockAgain", async () => {
    window.localStorage.setItem(STORAGE_KEY, keys.publicKey);
    const { result } = renderGate({ enabled: true, publicKey: keys.publicKey });
    expect(result.current.state).toBe("unlocked");
    act(() => result.current.lockAgain());
    expect(result.current.state).toBe("locked");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("re-evaluates when the configured key changes", () => {
    window.localStorage.setItem(STORAGE_KEY, keys.publicKey);
    const { result, rerender } = renderGate({ enabled: true, publicKey: keys.publicKey });
    expect(result.current.state).toBe("unlocked");
    rerender({ cfg: { enabled: true, publicKey: "rotated" } });
    expect(result.current.state).toBe("locked");
  });

  it("treats blocked storage as no cache and still unlocks in memory", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderGate({ enabled: true, publicKey: keys.publicKey });
    expect(result.current.state).toBe("locked");
    await act(async () => {
      await result.current.unlock(PASSWORD);
    });
    expect(result.current.state).toBe("unlocked");
    act(() => result.current.lockAgain());
    expect(result.current.state).toBe("locked");
  });
});
