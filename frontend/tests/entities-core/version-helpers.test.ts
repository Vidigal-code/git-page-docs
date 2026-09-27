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
});
