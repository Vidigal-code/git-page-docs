import { describe, it, expect } from "vitest";
import { trimSlashes } from "../contracts/path-segments.mjs";

describe("trimSlashes", () => {
  it.each([
    ["", ""],
    ["/", ""],
    ["///", ""],
    ["docs", "docs"],
    ["/docs", "docs"],
    ["docs/", "docs"],
    ["/docs/", "docs"],
    ["///a//b///", "a//b"],
    [" /a/ ", " /a/ "],
    ["/ünï/", "ünï"],
    ["\\docs\\", "\\docs\\"],
  ])("trims %j to %j", (input, expected) => {
    expect(trimSlashes(input)).toBe(expected);
  });

  it("keeps inner slashes and returns the same characters as the legacy regex", () => {
    const legacy = (value: string) => value.replace(/^\/+|\/+$/g, "");
    for (const value of ["/a/b/c/", "a/b", "//x", "x//", "/", "", "///y///z///"]) {
      expect(trimSlashes(value)).toBe(legacy(value));
    }
  });

  it("handles very long slash runs in linear time", () => {
    const value = `${"/".repeat(200_000)}a${"/".repeat(200_000)}`;
    const started = performance.now();
    expect(trimSlashes(value)).toBe("a");
    expect(performance.now() - started).toBeLessThan(1000);
  });
});
