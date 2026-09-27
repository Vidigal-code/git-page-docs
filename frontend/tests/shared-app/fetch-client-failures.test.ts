import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRepoJson, fetchUrlJson, fetchUrlText, fetchWithTimeout, tryFetchText } from "@/shared/api/fetch-client";

afterEach(() => vi.unstubAllGlobals());

describe("fetch-client failure handling", () => {
  it("turns a network error into null instead of throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));
    expect(await tryFetchText("https://example.com/a.json")).toBeNull();
    expect(await fetchUrlText("https://example.com/a.json")).toBeNull();
    expect(await fetchUrlJson("https://example.com/a.json")).toBeNull();
  });

  it("walks every mirror before giving up on a repository file", async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 503, text: async () => "" }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchRepoJson("owner", "repo", "gitpagedocs/config.json")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("returns null for content that is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => "<html>rate limited</html>" })));
    expect(await fetchRepoJson("owner", "repo", "x.json")).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => "" })));
    expect(await fetchUrlJson("https://example.com/empty.json")).toBeNull();
  });

  it("parses JSON served by the first healthy mirror", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => '{"hello":"world"}' })));
    expect(await fetchRepoJson<{ hello: string }>("owner", "repo", "/x.json")).toEqual({ hello: "world" });
  });

  it("aborts a request that outlives the timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new DOMException("The operation was aborted.", "AbortError")));
          }),
      ),
    );
    await expect(fetchWithTimeout("https://example.com/slow", undefined, 5)).rejects.toThrow(/aborted/i);
  });

  it("passes the caller's init through together with the abort signal", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => ({ ok: true, init }));
    vi.stubGlobal("fetch", fetchMock);
    const response = (await fetchWithTimeout("https://example.com/x", { cache: "no-store" })) as unknown as { init: RequestInit };
    expect(response.init.cache).toBe("no-store");
    expect(response.init.signal).toBeInstanceOf(AbortSignal);
    expect(response.init.signal?.aborted).toBe(false);
  });
});
