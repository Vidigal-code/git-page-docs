import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchUrlJson } from "@/shared/api/fetch-client";
import { parseGithubResource } from "@/shared/lib/remote/github-url";

afterEach(() => vi.unstubAllGlobals());

describe("parseGithubResource", () => {
  it("identifies github.com blob URLs", () => {
    expect(
      parseGithubResource("https://github.com/owner/repo/blob/main/gitpagelayouts/layoutsConfig.json"),
    ).toEqual({ owner: "owner", repo: "repo", path: "gitpagelayouts/layoutsConfig.json" });
  });

  it("identifies raw.githubusercontent URLs", () => {
    expect(parseGithubResource("https://raw.githubusercontent.com/owner/repo/HEAD/dir/file.json")).toEqual({
      owner: "owner",
      repo: "repo",
      path: "dir/file.json",
    });
  });

  it("identifies jsDelivr gh URLs", () => {
    expect(parseGithubResource("https://cdn.jsdelivr.net/gh/owner/repo@main/dir/file.json")).toEqual({
      owner: "owner",
      repo: "repo",
      path: "dir/file.json",
    });
  });

  it("returns null for non-GitHub URLs and non-file GitHub pages", () => {
    expect(parseGithubResource("https://example.com/dir/file.json")).toBeNull();
    expect(parseGithubResource("https://github.com/owner/repo")).toBeNull();
    expect(parseGithubResource("not a url")).toBeNull();
  });
});

describe("fetchUrlJson mirror fallback", () => {
  it("recovers through jsDelivr when raw.githubusercontent is rate limited", async () => {
    const attempts: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        attempts.push(url);
        if (url.includes("raw.githubusercontent.com")) {
          return { ok: false, status: 429, text: async () => "" };
        }
        if (url.includes("cdn.jsdelivr.net")) {
          return { ok: true, text: async () => JSON.stringify({ layouts: ["ok"] }) };
        }
        return { ok: false, status: 404, text: async () => "" };
      }),
    );

    const result = await fetchUrlJson<{ layouts: string[] }>(
      "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagelayouts/layoutsConfig.json",
    );

    expect(result).toEqual({ layouts: ["ok"] });
    expect(attempts.some((url) => url.includes("raw.githubusercontent.com"))).toBe(true);
    expect(attempts.some((url) => url.includes("cdn.jsdelivr.net"))).toBe(true);
  });

  it("remembers the working mirror and tries it first on later fetches", async () => {
    let healthyHost = "raw.githubusercontent.com";
    let current: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        current.push(url);
        if (url.includes(healthyHost)) {
          return { ok: true, text: async () => JSON.stringify({ ok: true }) };
        }
        return { ok: false, status: 429, text: async () => "" };
      }),
    );

    // Anchor the sticky mirror on raw while only raw is healthy.
    await fetchUrlJson("https://github.com/owner/repo/blob/main/a.json");

    // Raw starts throttling and jsDelivr takes over: this call must walk...
    healthyHost = "cdn.jsdelivr.net";
    current = [];
    await fetchUrlJson("https://github.com/owner/repo/blob/main/b.json");
    expect(current.length).toBeGreaterThan(1);
    expect(current[current.length - 1]).toContain("cdn.jsdelivr.net");

    // ...and the next call goes straight to the mirror that worked.
    current = [];
    await fetchUrlJson("https://github.com/owner/repo/blob/main/c.json");
    expect(current[0]).toContain("cdn.jsdelivr.net");
    expect(current).toHaveLength(1);
  });

  it("fetches non-GitHub URLs directly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, text: async () => JSON.stringify({ custom: true }) })),
    );
    expect(await fetchUrlJson("https://example.com/config.json")).toEqual({ custom: true });
  });
});
