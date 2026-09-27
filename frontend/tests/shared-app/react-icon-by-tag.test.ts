import { describe, expect, it, vi } from "vitest";

// A tiny stand-in for the Font Awesome 6 set proves longest-prefix matching
// ("Fa6" must win over "Fa") and the non-function export guard.
vi.mock("react-icons/fa6", () => ({ Fa6Probe: () => null, Fa6NotAComponent: "nope" }));
// A set whose loader fails must degrade to "no icon", not throw.
vi.mock("react-icons/wi", () => {
  throw new Error("icon set unavailable");
});

import { FiSearch } from "react-icons/fi";
import { resolveReactIconByTag } from "@/shared/lib/react-icon-tag/resolve-react-icon-by-tag";

describe("resolveReactIconByTag", () => {
  it("returns null for empty or blank tags", async () => {
    expect(await resolveReactIconByTag(undefined)).toBeNull();
    expect(await resolveReactIconByTag("")).toBeNull();
    expect(await resolveReactIconByTag("   ")).toBeNull();
  });

  it("returns null for a tag whose prefix is not a known icon set", async () => {
    expect(await resolveReactIconByTag("ZzUnknownIcon")).toBeNull();
    expect(await resolveReactIconByTag("search")).toBeNull();
  });

  it("lazily loads the matching set and returns the icon component", async () => {
    expect(await resolveReactIconByTag("FiSearch")).toBe(FiSearch);
    expect(await resolveReactIconByTag("  FiSearch  ")).toBe(FiSearch);
  });

  it("returns null for an icon missing from a known set", async () => {
    expect(await resolveReactIconByTag("FiDefinitelyNotAnIcon")).toBeNull();
  });

  it("prefers the longest prefix and rejects non-function exports", async () => {
    const icon = await resolveReactIconByTag("Fa6Probe");
    expect(typeof icon).toBe("function");
    expect(await resolveReactIconByTag("Fa6NotAComponent")).toBeNull();
  });

  it("degrades to null when the icon set fails to load", async () => {
    expect(await resolveReactIconByTag("WiDaySunny")).toBeNull();
  });

  it("serves repeated lookups from the cache", async () => {
    const first = await resolveReactIconByTag("FiSearch");
    const second = await resolveReactIconByTag("FiSearch");
    expect(second).toBe(first);
    expect(await resolveReactIconByTag("ZzUnknownIcon")).toBeNull();
  });
});
