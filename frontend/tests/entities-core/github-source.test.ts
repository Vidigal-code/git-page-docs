import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GithubRequestError,
  loadSourceFile,
  loadSourceRepository,
  resolveSourceRepository,
} from "@/entities/source-viewer/api/github-source";

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function statusResponse(status: number): Response {
  return new Response(null, { status });
}

let fetchMock: FetchMock;

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function requestedUrl(call = 0): string {
  return String(fetchMock.mock.calls[call][0]);
}

function requestInit(call = 0): RequestInit {
  return fetchMock.mock.calls[call][1] ?? {};
}

describe("loadSourceRepository", () => {
  it("requests the recursive tree for the ref and normalizes the entries", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        tree: [
          { path: "src/b.ts", type: "blob", size: 12 },
          { path: "README.md", type: "blob", size: 3 },
          { path: "src", type: "tree" },
          { path: "ghost", type: "commit" },
          { type: "blob" },
          { path: "", type: "blob" },
        ],
      }),
    );

    const repository = await loadSourceRepository("my org", "r#1", "feat/x");

    expect(requestedUrl()).toBe("https://api.github.com/repos/my%20org/r%231/git/trees/feat%2Fx?recursive=1");
    expect(requestInit().headers).toEqual({ Accept: "application/vnd.github+json" });
    expect(requestInit().signal).toBeInstanceOf(AbortSignal);
    expect(repository).toEqual({
      owner: "my org",
      repo: "r#1",
      branch: "feat/x",
      entries: [
        { path: "src", name: "src", type: "tree", size: undefined },
        { path: "README.md", name: "README.md", type: "blob", size: 3 },
        { path: "src/b.ts", name: "b.ts", type: "blob", size: 12 },
      ],
    });
  });

  it("returns no entries when the response has no tree", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    expect((await loadSourceRepository("o", "r", "main")).entries).toEqual([]);
  });

  it("throws a GithubRequestError carrying the HTTP status", async () => {
    fetchMock.mockResolvedValueOnce(statusResponse(403));
    const failure = loadSourceRepository("o", "r", "main");
    await expect(failure).rejects.toBeInstanceOf(GithubRequestError);
    await expect(failure).rejects.toMatchObject({
      name: "GithubRequestError",
      status: 403,
      message: "GitHub request failed with status 403",
    });
  });
});

describe("resolveSourceRepository", () => {
  const route = { owner: "o", repo: "r", branch: "release", path: "v2/src/a.ts" };

  it("returns the repository and the route untouched when the ref resolves first time", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ tree: [] }));
    await expect(resolveSourceRepository(route)).resolves.toEqual({
      repository: { owner: "o", repo: "r", branch: "release", entries: [] },
      route,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("folds leading path segments into the branch until a ref resolves", async () => {
    fetchMock
      .mockResolvedValueOnce(statusResponse(404))
      .mockResolvedValueOnce(statusResponse(404))
      .mockResolvedValueOnce(jsonResponse({ tree: [] }));

    const result = await resolveSourceRepository(route);

    expect(result.route).toEqual({ owner: "o", repo: "r", branch: "release/v2/src", path: "a.ts" });
    expect(result.repository.branch).toBe("release/v2/src");
    expect([0, 1, 2].map((call) => requestedUrl(call))).toEqual([
      "https://api.github.com/repos/o/r/git/trees/release?recursive=1",
      "https://api.github.com/repos/o/r/git/trees/release%2Fv2?recursive=1",
      "https://api.github.com/repos/o/r/git/trees/release%2Fv2%2Fsrc?recursive=1",
    ]);
  });

  it("gives up with the 404 once every path segment has been folded", async () => {
    fetchMock.mockImplementation(async () => statusResponse(404));
    await expect(resolveSourceRepository(route)).rejects.toMatchObject({ status: 404 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("does not fold on a 404 when the route has no path", async () => {
    fetchMock.mockResolvedValueOnce(statusResponse(404));
    await expect(resolveSourceRepository({ ...route, path: "" })).rejects.toMatchObject({ status: 404 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces non-404 failures and network errors immediately", async () => {
    fetchMock.mockResolvedValueOnce(statusResponse(403));
    await expect(resolveSourceRepository(route)).rejects.toMatchObject({ status: 403 });

    fetchMock.mockRejectedValueOnce(new TypeError("network down"));
    await expect(resolveSourceRepository(route)).rejects.toThrow("network down");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("loadSourceFile", () => {
  it("fetches the raw file with cache disabled, encoding every segment", async () => {
    fetchMock.mockResolvedValueOnce(new Response("export {};\n", { status: 200 }));

    await expect(loadSourceFile("my org", "r#1", "feat/x", "src/a b.ts")).resolves.toEqual({
      path: "src/a b.ts",
      content: "export {};\n",
    });
    expect(requestedUrl()).toBe("https://raw.githubusercontent.com/my%20org/r%231/feat%2Fx/src/a%20b.ts");
    expect(requestInit().cache).toBe("no-store");
    expect(requestInit().signal).toBeInstanceOf(AbortSignal);
  });

  it("strips a UTF-8 byte order mark", async () => {
    fetchMock.mockResolvedValueOnce(new Response(new TextEncoder().encode("﻿hello"), { status: 200 }));
    expect((await loadSourceFile("o", "r", "main", "a.txt")).content).toBe("hello");
  });

  it("throws a GithubRequestError for a missing file", async () => {
    fetchMock.mockResolvedValueOnce(statusResponse(404));
    await expect(loadSourceFile("o", "r", "main", "missing.txt")).rejects.toMatchObject({ status: 404 });
  });
});
