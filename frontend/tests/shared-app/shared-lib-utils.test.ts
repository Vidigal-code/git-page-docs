import { afterEach, describe, expect, it, vi } from "vitest";
import { describeAiBrowserError, isBrowserNetworkError } from "@/shared/lib/ai-error";
import { isFrameBlockedUrl } from "@/shared/lib/is-frame-blocked-url";
import {
  AUDIO_EMBED_TYPES,
  NATIVE_AUDIO_TYPES,
  NATIVE_VIDEO_AS_AUDIO_TYPES,
  NATIVE_VIDEO_TYPES,
  isAudioEmbed,
  isNativeAudio,
  isNativeVideo,
  isNativeVideoAsAudio,
} from "@/shared/lib/media-types";
import { parseJsonSafely } from "@/shared/lib/parse-json-safely";
import { parseRepoPathFromLocation, type SupportedLanguage } from "@/shared/lib/parse-repo-path";
import { isLocalRuntime, parseOwnerRepoFromUrl, parseRepoAndVersion } from "@/shared/lib/runtime";
import { isLocalRuntime as isLocalRuntimeDirect } from "@/shared/lib/runtime/is-local-runtime";
import { parseOwnerRepoFromUrl as parseOwnerRepoDirect } from "@/shared/lib/runtime/parse-owner-repo";
import { isGithubPagesBuild, isRepositorySearchEnabled } from "@/shared/lib/repository-search";
import { isRepositorySearchEnabled as isRepositorySearchEnabledDirect } from "@/shared/lib/repository-search/is-repository-search-enabled";
import { buildGithubRawCandidates, ensureTrailingSlash, toRawGithubUrl } from "@/shared/lib/remote/github-url";

const BASE_PATH_ENV = "NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH";

const env = (vars: Record<string, string>): NodeJS.ProcessEnv => vars as unknown as NodeJS.ProcessEnv;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("ai-error", () => {
  it("treats TypeErrors and CORS-style messages as browser network failures", () => {
    expect(isBrowserNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isBrowserNetworkError(new Error("NetworkError when attempting to fetch resource."))).toBe(true);
    expect(isBrowserNetworkError(new Error("Load failed"))).toBe(true);
    expect(isBrowserNetworkError("blocked by CORS policy")).toBe(true);
  });

  it("does not flag ordinary errors", () => {
    expect(isBrowserNetworkError(new Error("HTTP 401 Unauthorized"))).toBe(false);
    expect(isBrowserNetworkError(42)).toBe(false);
    expect(isBrowserNetworkError("corsair")).toBe(false);
  });

  it("describes network failures with an actionable provider hint", () => {
    const message = describeAiBrowserError("OpenAI", new TypeError("Failed to fetch"));
    expect(message).toContain("Could not reach OpenAI");
    expect(message).toContain("CORS");
  });

  it("passes other error messages through", () => {
    expect(describeAiBrowserError("Claude", new Error("Invalid API key"))).toBe("Invalid API key");
    expect(describeAiBrowserError("Claude", "plain string")).toBe("plain string");
  });
});

describe("isFrameBlockedUrl", () => {
  it.each([
    "https://github.com/owner/repo",
    "https://www.github.com/owner/repo",
    "https://x.com/someone",
    "https://TWITTER.com/someone",
    "https://www.linkedin.com/in/x",
    "https://instagram.com/x",
    "https://m.facebook.com/x",
  ])("blocks %s", (url) => {
    expect(isFrameBlockedUrl(url)).toBe(true);
  });

  it.each(["https://example.com/embed", "https://notgithub.com/x", "https://github.com.evil.io/x"])(
    "allows %s",
    (url) => {
      expect(isFrameBlockedUrl(url)).toBe(false);
    },
  );

  it("is false for empty, undefined or unparsable input", () => {
    expect(isFrameBlockedUrl(undefined)).toBe(false);
    expect(isFrameBlockedUrl("")).toBe(false);
    expect(isFrameBlockedUrl("not a url")).toBe(false);
    expect(isFrameBlockedUrl(123 as unknown as string)).toBe(false);
  });
});

describe("media-types", () => {
  it("classifies formats case-insensitively", () => {
    expect(isNativeAudio("MP3")).toBe(true);
    expect(isNativeAudio("mp4")).toBe(false);
    expect(isNativeVideoAsAudio("WebM")).toBe(true);
    expect(isNativeVideoAsAudio("mp3")).toBe(false);
    expect(isAudioEmbed("YouTube")).toBe(true);
    expect(isAudioEmbed("vimeo")).toBe(true);
    expect(isAudioEmbed("mp3")).toBe(false);
    expect(isNativeVideo("AVI")).toBe(true);
    expect(isNativeVideo("mkv")).toBe(false);
  });

  it("exposes the underlying sets", () => {
    expect(NATIVE_AUDIO_TYPES.has("flac")).toBe(true);
    expect(NATIVE_VIDEO_AS_AUDIO_TYPES).toEqual(new Set(["mp4", "webm"]));
    expect(AUDIO_EMBED_TYPES.has("spotify")).toBe(true);
    expect(NATIVE_VIDEO_TYPES.has("webm")).toBe(true);
  });
});

describe("parseJsonSafely", () => {
  it("parses valid JSON and returns null otherwise", () => {
    expect(parseJsonSafely<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonSafely("{ nope")).toBeNull();
    expect(parseJsonSafely("")).toBeNull();
  });
});

describe("parseRepoPathFromLocation", () => {
  const parseLanguage = vi.fn((lang: string | null): SupportedLanguage => (lang === "pt" || lang === "es" ? lang : "en"));

  function stubLocation(pathname: string, search = "") {
    vi.stubGlobal("window", { location: { pathname, search } });
  }

  it("returns null on the server", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    expect(typeof window).toBe("undefined");
    expect(parseRepoPathFromLocation(parseLanguage)).toBeNull();
  });

  it("parses owner and repo from the pathname", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    stubLocation("/owner/repo/");
    expect(parseRepoPathFromLocation(parseLanguage)).toEqual({
      owner: "owner",
      repo: "repo",
      version: undefined,
      language: "en",
    });
    expect(parseLanguage).toHaveBeenLastCalledWith(null);
  });

  it("reads the version from the /v/ segment and the language from the query", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    stubLocation("/owner/repo/v/2.0.0/", "?lang=pt");
    expect(parseRepoPathFromLocation(parseLanguage)).toEqual({
      owner: "owner",
      repo: "repo",
      version: "2.0.0",
      language: "pt",
    });
  });

  it("falls back to the ?version= query param", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    stubLocation("/owner/repo", "?version=1.0.0&lang=es");
    expect(parseRepoPathFromLocation(parseLanguage)).toMatchObject({ version: "1.0.0", language: "es" });
  });

  it("strips the configured base path first", () => {
    vi.stubEnv(BASE_PATH_ENV, "/git-page-docs");
    stubLocation("/git-page-docs/owner/repo/");
    expect(parseRepoPathFromLocation(parseLanguage)).toMatchObject({ owner: "owner", repo: "repo" });
  });

  it("returns null when the path has fewer than two segments", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    stubLocation("/only-owner");
    expect(parseRepoPathFromLocation(parseLanguage)).toBeNull();
  });
});

describe("runtime helpers", () => {
  it("re-exports the same implementations through the barrel", () => {
    expect(isLocalRuntime).toBe(isLocalRuntimeDirect);
    expect(parseOwnerRepoFromUrl).toBe(parseOwnerRepoDirect);
    expect(isRepositorySearchEnabled).toBe(isRepositorySearchEnabledDirect);
  });

  it("treats non-production and Vercel development as local", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(isLocalRuntime()).toBe(true);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "development");
    expect(isLocalRuntime()).toBe(true);
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isLocalRuntime()).toBe(false);
  });

  it("parses owner/repo out of the usual repository URL spellings", () => {
    expect(parseOwnerRepoFromUrl(undefined)).toEqual({});
    expect(parseOwnerRepoFromUrl("")).toEqual({});
    expect(parseOwnerRepoFromUrl("git+https://github.com/acme/site.git")).toEqual({ owner: "acme", repo: "site" });
    expect(parseOwnerRepoFromUrl("git@github.com:acme/site.git")).toEqual({ owner: "acme", repo: "site" });
    expect(parseOwnerRepoFromUrl("https://github.com/acme")).toEqual({});
    expect(parseOwnerRepoFromUrl("not a url")).toEqual({});
  });

  it("splits a route slug into owner, repo and version", () => {
    expect(parseRepoAndVersion(undefined)).toEqual({});
    expect(parseRepoAndVersion([])).toEqual({});
    expect(parseRepoAndVersion(["v", "1.0.0"])).toEqual({ version: "1.0.0" });
    expect(parseRepoAndVersion(["o", "r", "v", "2.0.0"])).toEqual({ owner: "o", repo: "r", version: "2.0.0" });
    expect(parseRepoAndVersion(["o", "r"])).toEqual({ owner: "o", repo: "r" });
    expect(parseRepoAndVersion(["o", "r", "extra"])).toEqual({ owner: "o", repo: "r" });
    expect(parseRepoAndVersion(["o"])).toEqual({});
    // A blank version id is not a version route; the segments fall through as owner/repo.
    expect(parseRepoAndVersion(["v", ""])).toEqual({ owner: "v", repo: "" });
  });

  it("enables repository search on GitHub Pages or by explicit flag", () => {
    expect(isRepositorySearchEnabled(env({ GITHUB_ACTIONS: "true" }))).toBe(true);
    expect(isRepositorySearchEnabled(env({ GITPAGEDOCS_REPOSITORY_SEARCH: "true" }))).toBe(true);
    expect(isRepositorySearchEnabled(env({ GITPAGEDOCS_REPOSITORY_SEARCH: "false" }))).toBe(false);
    expect(isRepositorySearchEnabled(env({}))).toBe(false);
    expect(isGithubPagesBuild(env({ GITHUB_ACTIONS: "true" }))).toBe(true);
    expect(isGithubPagesBuild(env({ GITPAGEDOCS_REPOSITORY_SEARCH: "true" }))).toBe(false);
  });

  it("reads process.env by default", () => {
    vi.stubEnv("GITHUB_ACTIONS", "false");
    vi.stubEnv("GITPAGEDOCS_REPOSITORY_SEARCH", "true");
    expect(isRepositorySearchEnabled()).toBe(true);
    expect(isGithubPagesBuild()).toBe(false);
  });
});

describe("github-url", () => {
  it("rewrites github.com blob/tree URLs to raw.githubusercontent", () => {
    expect(toRawGithubUrl("https://github.com/o/r/blob/main/dir/file.json")).toBe(
      "https://raw.githubusercontent.com/o/r/main/dir/file.json",
    );
    expect(toRawGithubUrl("https://github.com/o/r/tree/dev/a/b.md")).toBe(
      "https://raw.githubusercontent.com/o/r/dev/a/b.md",
    );
  });

  it("leaves non-file GitHub pages, other hosts and garbage untouched", () => {
    expect(toRawGithubUrl("https://github.com/o/r")).toBe("https://github.com/o/r");
    expect(toRawGithubUrl("https://example.com/o/r/blob/main/x")).toBe("https://example.com/o/r/blob/main/x");
    expect(toRawGithubUrl("not a url")).toBe("not a url");
  });

  it("ensures exactly one trailing slash", () => {
    expect(ensureTrailingSlash("a/b")).toBe("a/b/");
    expect(ensureTrailingSlash("a/b/")).toBe("a/b/");
  });

  it("builds the raw and jsDelivr mirror candidates in order", () => {
    expect(buildGithubRawCandidates("o", "r", "/dir/file.json")).toEqual([
      "https://raw.githubusercontent.com/o/r/HEAD/dir/file.json",
      "https://raw.githubusercontent.com/o/r/main/dir/file.json",
      "https://raw.githubusercontent.com/o/r/master/dir/file.json",
      "https://cdn.jsdelivr.net/gh/o/r@HEAD/dir/file.json",
      "https://cdn.jsdelivr.net/gh/o/r@main/dir/file.json",
      "https://cdn.jsdelivr.net/gh/o/r@master/dir/file.json",
    ]);
  });
});
