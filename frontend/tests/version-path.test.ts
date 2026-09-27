import { describe, it, expect } from "vitest";
import { buildVersionPath } from "@/entities/docs/lib/routing/version-path";

describe("buildVersionPath", () => {
  const cases: Array<[string | undefined, string]> = [
    [undefined, "/v/1.2"],
    ["", "/v/1.2"],
    ["///", "/v/1.2"],
    ["/base", "/base/v/1.2"],
    ["/base/", "/base/v/1.2"],
    ["/base///", "/base/v/1.2"],
    ["/a/b", "/a/b/v/1.2"],
  ];

  it.each(cases)("builds %j + 1.2 as %j", (basePath, expected) => {
    expect(buildVersionPath(basePath, "1.2")).toBe(expected);
  });

  it("keeps the version id verbatim", () => {
    expect(buildVersionPath("/base", "v1.0-beta")).toBe("/base/v/v1.0-beta");
    expect(buildVersionPath(undefined, "latest")).toBe("/v/latest");
  });

  it("only strips trailing slashes, never leading ones", () => {
    expect(buildVersionPath("base/", "1")).toBe("base/v/1");
    expect(buildVersionPath("//base//", "1")).toBe("//base/v/1");
  });
});
