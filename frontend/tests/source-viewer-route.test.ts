import { describe, it, expect } from "vitest";
import {
  DEFAULT_SOURCE_VIEWER_BRANCH,
  DEFAULT_SOURCE_VIEWER_OWNER,
  DEFAULT_SOURCE_VIEWER_REPO,
  SOURCE_VIEWER_BASE_PATH,
  buildGithubTreeUrl,
  buildSourceViewerPath,
  parseGithubTreeUrl,
  parseSourceViewerRoute,
} from "@/entities/source-viewer/model/route";
import type { SourceViewerRoute } from "@/entities/source-viewer/model/types";

const DEFAULT_ROUTE: SourceViewerRoute = {
  owner: DEFAULT_SOURCE_VIEWER_OWNER,
  repo: DEFAULT_SOURCE_VIEWER_REPO,
  branch: DEFAULT_SOURCE_VIEWER_BRANCH,
  path: "",
};

/** Turns a built source-viewer path back into the catch-all segments Next hands to the page. */
function segmentsOf(path: string): string[] {
  expect(path.startsWith(`${SOURCE_VIEWER_BASE_PATH}/`)).toBe(true);
  return path.slice(SOURCE_VIEWER_BASE_PATH.length + 1).split("/").map(decodeURIComponent);
}

describe("source viewer constants", () => {
  it("pins the official repository defaults and entry path", () => {
    expect(DEFAULT_SOURCE_VIEWER_OWNER).toBe("Vidigal-code");
    expect(DEFAULT_SOURCE_VIEWER_REPO).toBe("git-page-docs");
    expect(DEFAULT_SOURCE_VIEWER_BRANCH).toBe("main");
    expect(SOURCE_VIEWER_BASE_PATH).toBe("/source-viewer");
  });
});

describe("parseSourceViewerRoute", () => {
  it("returns the default route for undefined or empty segments", () => {
    expect(parseSourceViewerRoute(undefined)).toEqual(DEFAULT_ROUTE);
    expect(parseSourceViewerRoute([])).toEqual(DEFAULT_ROUTE);
  });

  it("reads owner and repo with the default branch and an empty path", () => {
    expect(parseSourceViewerRoute(["o", "r"])).toEqual({ owner: "o", repo: "r", branch: "main", path: "" });
  });

  it("reads branch and path after the tree segment", () => {
    expect(parseSourceViewerRoute(["o", "r", "tree", "dev", "src", "a.ts"])).toEqual({
      owner: "o",
      repo: "r",
      branch: "dev",
      path: "src/a.ts",
    });
  });

  it("returns an empty path when the tree segment has a branch but no path", () => {
    expect(parseSourceViewerRoute(["o", "r", "tree", "dev"])).toEqual({ owner: "o", repo: "r", branch: "dev", path: "" });
  });

  it("falls back to the default branch when the tree segment has no branch", () => {
    expect(parseSourceViewerRoute(["o", "r", "tree"])).toEqual({ owner: "o", repo: "r", branch: "main", path: "" });
    expect(parseSourceViewerRoute(["o", "r", "tree", ""])).toEqual({ owner: "o", repo: "r", branch: "main", path: "" });
  });

  it("ignores everything after owner/repo when the tree segment is missing", () => {
    expect(parseSourceViewerRoute(["o", "r", "src", "a.ts"])).toEqual({ owner: "o", repo: "r", branch: "main", path: "" });
    expect(parseSourceViewerRoute(["o", "r", "blob", "dev", "a.ts"])).toEqual({ owner: "o", repo: "r", branch: "main", path: "" });
  });

  it("sanitizes segments by trimming whitespace and surrounding slashes", () => {
    expect(parseSourceViewerRoute(["/o/", " r ", "tree", " /dev/ "])).toEqual({
      owner: "o",
      repo: "r",
      branch: "dev",
      path: "",
    });
    expect(parseSourceViewerRoute(["o", "r", "tree", "feat/x"])).toEqual({ owner: "o", repo: "r", branch: "feat/x", path: "" });
  });

  it("falls back to defaults for empty or slash-only segments", () => {
    expect(parseSourceViewerRoute(["", ""])).toEqual(DEFAULT_ROUTE);
    expect(parseSourceViewerRoute(["///", "   ", "tree", "///"])).toEqual(DEFAULT_ROUTE);
    expect(parseSourceViewerRoute(["", "r"])).toEqual({ owner: DEFAULT_SOURCE_VIEWER_OWNER, repo: "r", branch: "main", path: "" });
  });

  it("joins path parts verbatim (no sanitizing of path segments)", () => {
    expect(parseSourceViewerRoute(["o", "r", "tree", "main", "src", "", "a b.ts"]).path).toBe("src//a b.ts");
  });
});

describe("buildSourceViewerPath", () => {
  it("builds the tree path without a trailing segment when the path is empty", () => {
    expect(buildSourceViewerPath({ owner: "o", repo: "r", branch: "main", path: "" })).toBe("/source-viewer/o/r/tree/main");
  });

  it("appends the path, encoding each part separately", () => {
    expect(buildSourceViewerPath({ owner: "o", repo: "r", branch: "main", path: "src/a b.ts" })).toBe(
      "/source-viewer/o/r/tree/main/src/a%20b.ts",
    );
  });

  it("encodes owner, repo and branch (a slash in the branch stays one segment)", () => {
    expect(buildSourceViewerPath({ owner: "my org", repo: "r#1", branch: "feat/x", path: "" })).toBe(
      "/source-viewer/my%20org/r%231/tree/feat%2Fx",
    );
  });

  it("round-trips through parseSourceViewerRoute", () => {
    const routes: SourceViewerRoute[] = [
      DEFAULT_ROUTE,
      { owner: "o", repo: "r", branch: "dev", path: "src/a.ts" },
      { owner: "my org", repo: "r#1", branch: "feat/x", path: "src/a b.ts" },
      { owner: "o", repo: "r", branch: "main", path: "deep/nested/dir/file.md" },
    ];
    for (const route of routes) {
      expect(parseSourceViewerRoute(segmentsOf(buildSourceViewerPath(route)))).toEqual(route);
    }
  });
});

describe("buildGithubTreeUrl", () => {
  it("builds the GitHub tree URL without a path", () => {
    expect(buildGithubTreeUrl({ owner: "o", repo: "r", branch: "main", path: "" })).toBe("https://github.com/o/r/tree/main");
  });

  it("appends and encodes the path parts", () => {
    expect(buildGithubTreeUrl({ owner: "o", repo: "r", branch: "feat/x", path: "src/a b.ts" })).toBe(
      "https://github.com/o/r/tree/feat%2Fx/src/a%20b.ts",
    );
  });
});

describe("parseGithubTreeUrl", () => {
  it("returns null for missing, empty or unparsable input", () => {
    expect(parseGithubTreeUrl(undefined)).toBeNull();
    expect(parseGithubTreeUrl("")).toBeNull();
    expect(parseGithubTreeUrl("not a url")).toBeNull();
  });

  it("returns null for hosts other than github.com", () => {
    expect(parseGithubTreeUrl("https://gitlab.com/o/r/tree/main")).toBeNull();
    expect(parseGithubTreeUrl("https://www.github.com/o/r/tree/main")).toBeNull();
  });

  it("returns null when owner, repo, tree segment or branch are missing", () => {
    expect(parseGithubTreeUrl("https://github.com/")).toBeNull();
    expect(parseGithubTreeUrl("https://github.com/o")).toBeNull();
    expect(parseGithubTreeUrl("https://github.com/o/r")).toBeNull();
    expect(parseGithubTreeUrl("https://github.com/o/r/blob/main/a.ts")).toBeNull();
    expect(parseGithubTreeUrl("https://github.com/o/r/tree")).toBeNull();
  });

  it("parses a tree URL with and without a path", () => {
    expect(parseGithubTreeUrl("https://github.com/o/r/tree/main")).toEqual({ owner: "o", repo: "r", branch: "main", path: "" });
    expect(parseGithubTreeUrl("https://github.com/o/r/tree/main/src/a.ts")).toEqual({
      owner: "o",
      repo: "r",
      branch: "main",
      path: "src/a.ts",
    });
  });

  it("round-trips a route built by buildGithubTreeUrl", () => {
    const route: SourceViewerRoute = { owner: "o", repo: "r", branch: "dev", path: "src/lib" };
    expect(parseGithubTreeUrl(buildGithubTreeUrl(route))).toEqual(route);
  });
});
