import { describe, expect, it } from "vitest";
import {
  buildRepositoryPath,
  isRepositoryResolving,
  pickNotFoundText,
  resolveLoadingProgressWidth,
  resolveNotFoundCopy,
  type RepoStatus,
} from "@/app/not-found-state";
import {
  INSTALLED_NOT_PRERENDERED,
  INSTALLED_PROMPT,
  NOT_INSTALLED,
  SEARCH_PROMPT,
} from "@/shared/config/i18n/not-found-dict";

const ALL_STATUSES: RepoStatus[] = ["unknown", "checking", "installed", "not_installed"];

describe("pickNotFoundText", () => {
  it("returns the entry for the requested language", () => {
    expect(pickNotFoundText(NOT_INSTALLED, "pt")).toBe(NOT_INSTALLED.pt);
    expect(pickNotFoundText(NOT_INSTALLED, "es")).toBe(NOT_INSTALLED.es);
  });

  it("falls back to English when the entry is blank", () => {
    expect(pickNotFoundText({ en: "EN", pt: "", es: "ES" }, "pt")).toBe("EN");
  });
});

describe("resolveLoadingProgressWidth", () => {
  it.each([
    [1, "34%"],
    [2, "68%"],
    [3, "100%"],
    [0, "100%"],
    [9, "100%"],
  ])("maps %i dot(s) to %s", (dots, width) => {
    expect(resolveLoadingProgressWidth(dots)).toBe(width);
  });
});

describe("isRepositoryResolving", () => {
  it("is false without a repository path whatever the status", () => {
    for (const status of ALL_STATUSES) {
      expect(isRepositoryResolving(false, status, true)).toBe(false);
    }
  });

  it("resolves while the repository is still being probed", () => {
    expect(isRepositoryResolving(true, "unknown", false)).toBe(true);
    expect(isRepositoryResolving(true, "checking", false)).toBe(true);
  });

  it("resolves while installed docs are loading, but not once loading finished", () => {
    expect(isRepositoryResolving(true, "installed", true)).toBe(true);
    expect(isRepositoryResolving(true, "installed", false)).toBe(false);
  });

  it("never resolves for a repository without gitpagedocs", () => {
    expect(isRepositoryResolving(true, "not_installed", true)).toBe(false);
  });
});

describe("resolveNotFoundCopy", () => {
  it("shows the plain 404 copy without a repository path", () => {
    expect(resolveNotFoundCopy(false, "unknown", "pt")).toEqual({
      message: "Page not found",
      prompt: "The requested page does not exist.",
      showCode: true,
    });
  });

  it("explains a non-prerendered URL for an installed repository, without the 404 code", () => {
    expect(resolveNotFoundCopy(true, "installed", "en")).toEqual({
      message: INSTALLED_NOT_PRERENDERED.en,
      prompt: INSTALLED_PROMPT.en,
      showCode: false,
    });
  });

  it("offers the search prompt with the 404 code when gitpagedocs is not installed", () => {
    expect(resolveNotFoundCopy(true, "not_installed", "en")).toEqual({
      message: NOT_INSTALLED.en,
      prompt: SEARCH_PROMPT.en,
      showCode: true,
    });
  });

  it("uses the search copy without the code while the status is still unknown", () => {
    expect(resolveNotFoundCopy(true, "unknown", "en").showCode).toBe(false);
    expect(resolveNotFoundCopy(true, "checking", "en").message).toBe(NOT_INSTALLED.en);
  });

  it("localizes the repository copy", () => {
    expect(resolveNotFoundCopy(true, "installed", "pt")).toEqual({
      message: INSTALLED_NOT_PRERENDERED.pt,
      prompt: INSTALLED_PROMPT.pt,
      showCode: false,
    });
    expect(resolveNotFoundCopy(true, "not_installed", "es").prompt).toBe(SEARCH_PROMPT.es);
  });
});

describe("buildRepositoryPath", () => {
  it("roots the path at / without a base path", () => {
    expect(buildRepositoryPath("", "owner", "repo")).toBe("/owner/repo/");
  });

  it("prefixes the base path", () => {
    expect(buildRepositoryPath("/git-page-docs", "owner", "repo")).toBe("/git-page-docs/owner/repo/");
  });
});
