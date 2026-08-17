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

  it("fetches non-GitHub URLs directly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, text: async () => JSON.stringify({ custom: true }) })),
    );
    expect(await fetchUrlJson("https://example.com/config.json")).toEqual({ custom: true });
  });
});
