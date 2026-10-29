import { describe, expect, it } from "vitest";
import { dedupeVersionEntriesById } from "@/entities/docs/lib/dedupe-version-entries";
import { buildVersionLinkOptions } from "@/entities/docs/lib/version-links";
import type { VersionEntry } from "@/entities/docs/model/types";

const version = (id: string, path = id): VersionEntry => ({ id, path });

describe("dedupeVersionEntriesById", () => {
  it("keeps the first entry for each id, comparing trimmed ids", () => {
    expect(dedupeVersionEntriesById([version("1.0", "a"), version(" 1.0 ", "b"), version("2.0"), version("1.0", "c")])).toEqual([
      version("1.0", "a"),
      version("2.0"),
    ]);
  });

  it("keeps every entry that has no usable id", () => {
    const blank = [version("", "a"), version("   ", "b"), { path: "c" } as VersionEntry];
    expect(dedupeVersionEntriesById(blank)).toEqual(blank);
  });

  it("returns a new array and leaves the input untouched", () => {
    const input = [version("1"), version("1")];
    const output = dedupeVersionEntriesById(input);
    expect(output).not.toBe(input);
    expect(output).toEqual([version("1")]);
    expect(input).toHaveLength(2);
    expect(dedupeVersionEntriesById([])).toEqual([]);
  });
});

describe("buildVersionLinkOptions", () => {
  it("returns nothing without an active version or without links", () => {
    expect(buildVersionLinkOptions(undefined)).toEqual([]);
    expect(buildVersionLinkOptions(version("1"))).toEqual([]);
    expect(buildVersionLinkOptions({ ...version("1"), branch: "  ", release: "", commit: undefined })).toEqual([]);
  });

  it("lists branch, release and commit in that order with trimmed urls", () => {
    expect(buildVersionLinkOptions({ ...version("1"), commit: " https://c ", branch: "https://b", release: "https://r " })).toEqual([
      { id: "branch", label: "Branch", url: "https://b" },
      { id: "release", label: "Release", url: "https://r" },
      { id: "commit", label: "Commit", url: "https://c" },
    ]);
    expect(buildVersionLinkOptions({ ...version("1"), release: "https://r" })).toEqual([{ id: "release", label: "Release", url: "https://r" }]);
  });

  it("keeps named repository links in category and configured order", () => {
    const activeVersion: VersionEntry = {
      id: "0.0.16", path: "docs/0.0.16/config.json",
      branch: [
        { name: " Main ", url: " https://github.com/demo/docs/tree/main " },
        { name: "Correções 日本", url: "/demo/docs/tree/fixes" },
      ],
      release: [{ name: "v0.0.16", url: "https://github.com/demo/docs/releases/tag/v0.0.16" }],
      commit: [{ name: "Fix scrolling", url: "https://github.com/demo/docs/commit/abc" }],
    };

    expect(buildVersionLinkOptions(activeVersion)).toEqual([
      { id: "branch", label: "Branch", name: "Main", url: "https://github.com/demo/docs/tree/main" },
      { id: "branch", label: "Branch", name: "Correções 日本", url: "/demo/docs/tree/fixes" },
      { id: "release", label: "Release", name: "v0.0.16", url: "https://github.com/demo/docs/releases/tag/v0.0.16" },
      { id: "commit", label: "Commit", name: "Fix scrolling", url: "https://github.com/demo/docs/commit/abc" },
    ]);
  });

  it("omits executable or malformed URLs while preserving safe relative legacy links", () => {
    expect(buildVersionLinkOptions({
      id: "0.0.16", path: "docs/config.json", branch: "javascript:alert(1)",
      release: [
        { name: "Bad scheme", url: "data:text/html,unsafe" },
        { name: "Invalid host", url: "https://[invalid" },
        { name: "Obfuscated scheme", url: "java\nscript:alert(1)" },
        { name: "Release", url: "../releases/v0.0.16" },
        { name: "HTTP", url: "http://example.com/release" },
      ],
      commit: " #commit-abc ",
    })).toEqual([
      { id: "release", label: "Release", name: "Release", url: "../releases/v0.0.16" },
      { id: "release", label: "Release", name: "HTTP", url: "http://example.com/release" },
      { id: "commit", label: "Commit", url: "#commit-abc" },
    ]);
  });

  it("ignores malformed JSON entries and removes only identical named links", () => {
    const activeVersion: VersionEntry = JSON.parse(`{
      "id":"0.0.16", "path":"docs/config.json", "release":false,
      "branch":[null,[],42,"https://example.com",{},
        {"name":42,"url":"https://example.com"},
        {"name":"Missing URL"},{"name":"Blank","url":" "},
        {"name":" ","url":"https://example.com"},
        {"name":"Wrong URL","url":[]},
        {"name":"Main","url":"https://example.com/main"},
        {"name":" Main ","url":" https://example.com/main "},
        {"name":"Mirror","url":"https://example.com/main"},
        {"name":"Main","url":"https://mirror.example.com/main"}],
      "commit":"/commits/abc"
    }`);

    expect(buildVersionLinkOptions(activeVersion)).toEqual([
      { id: "branch", label: "Branch", name: "Main", url: "https://example.com/main" },
      { id: "branch", label: "Branch", name: "Mirror", url: "https://example.com/main" },
      { id: "branch", label: "Branch", name: "Main", url: "https://mirror.example.com/main" },
      { id: "commit", label: "Commit", url: "/commits/abc" },
    ]);
  });
});
