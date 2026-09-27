import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  getBasePath,
  toFullPath,
  trimLeadingSlashes,
  trimSlashes,
  trimTrailingSlashes,
} from "@/shared/lib/base-path";

const BASE_PATH_ENV = "NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH";
const HUGE_SLASH_RUN = "/".repeat(100_000);

afterEach(() => vi.unstubAllEnvs());

describe("trimLeadingSlashes", () => {
  const cases: Array<[string, string]> = [
    ["", ""],
    ["/", ""],
    ["///", ""],
    ["/a/", "a/"],
    ["//a//b//", "a//b//"],
    ["a", "a"],
    ["/ünï/", "ünï/"],
    [" /a/ ", " /a/ "],
  ];

  it.each(cases)("trims %j to %j", (input, expected) => {
    expect(trimLeadingSlashes(input)).toBe(expected);
  });

  it("returns the same string instance when nothing is trimmed", () => {
    const input = "a/b";
    expect(trimLeadingSlashes(input)).toBe(input);
  });

  it("handles a 100k-slash run instantly", () => {
    const started = performance.now();
    expect(trimLeadingSlashes(HUGE_SLASH_RUN)).toBe("");
    expect(trimLeadingSlashes(`${HUGE_SLASH_RUN}a`)).toBe("a");
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});

describe("trimTrailingSlashes", () => {
  const cases: Array<[string, string]> = [
    ["", ""],
    ["/", ""],
    ["///", ""],
    ["/a/", "/a"],
    ["//a//b//", "//a//b"],
    ["a", "a"],
    ["/ünï/", "/ünï"],
    [" /a/ ", " /a/ "],
  ];

  it.each(cases)("trims %j to %j", (input, expected) => {
    expect(trimTrailingSlashes(input)).toBe(expected);
  });

  it("returns the same string instance when nothing is trimmed", () => {
    const input = "a/b";
    expect(trimTrailingSlashes(input)).toBe(input);
  });

  it("handles a 100k-slash run instantly", () => {
    const started = performance.now();
    expect(trimTrailingSlashes(HUGE_SLASH_RUN)).toBe("");
    expect(trimTrailingSlashes(`a${HUGE_SLASH_RUN}`)).toBe("a");
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});

describe("trimSlashes", () => {
  const cases: Array<[string, string]> = [
    ["", ""],
    ["/", ""],
    ["///", ""],
    ["/a/", "a"],
    ["//a//b//", "a//b"],
    ["a", "a"],
    ["/ünï/", "ünï"],
    [" /a/ ", " /a/ "],
  ];

  it.each(cases)("trims %j to %j", (input, expected) => {
    expect(trimSlashes(input)).toBe(expected);
  });

  it("handles a 100k-slash run on both sides instantly", () => {
    const started = performance.now();
    expect(trimSlashes(HUGE_SLASH_RUN)).toBe("");
    expect(trimSlashes(`${HUGE_SLASH_RUN}a${HUGE_SLASH_RUN}`)).toBe("a");
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});

describe("getBasePath", () => {
  it("returns an empty string when the env var is unset", () => {
    vi.stubEnv(BASE_PATH_ENV, undefined);
    expect(getBasePath()).toBe("");
  });

  it("returns an empty string when the env var is blank", () => {
    vi.stubEnv(BASE_PATH_ENV, "   ");
    expect(getBasePath()).toBe("");
  });

  it("trims surrounding whitespace from the configured base path", () => {
    vi.stubEnv(BASE_PATH_ENV, " /git-page-docs ");
    expect(getBasePath()).toBe("/git-page-docs");
  });
});

describe("toFullPath", () => {
  it("returns the app path unchanged when no base path is configured", () => {
    vi.stubEnv(BASE_PATH_ENV, "");
    expect(toFullPath("/docs")).toBe("/docs");
    expect(toFullPath("docs")).toBe("docs");
    expect(toFullPath("")).toBe("");
    expect(toFullPath("/docs///")).toBe("/docs///");
  });

  describe("with base path /git-page-docs", () => {
    beforeEach(() => vi.stubEnv(BASE_PATH_ENV, "/git-page-docs"));

    const cases: Array<[string, string]> = [
      ["/", "/git-page-docs/"],
      ["", "/git-page-docs/"],
      ["///", "/git-page-docs/"],
      ["docs", "/git-page-docs/docs"],
      ["/docs", "/git-page-docs/docs"],
      ["/docs///", "/git-page-docs/docs"],
      ["/docs/nested/", "/git-page-docs/docs/nested"],
    ];

    it.each(cases)("maps %j to %j", (input, expected) => {
      expect(toFullPath(input)).toBe(expected);
    });
  });
});
