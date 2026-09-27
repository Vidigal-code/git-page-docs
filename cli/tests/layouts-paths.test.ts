import { describe, it, expect } from "vitest";
import {
  DEFAULT_LAYOUTS_DIR,
  normalizeLayoutsDir,
  layoutsArtifactPaths,
} from "../contracts/layouts-paths.mjs";

describe("normalizeLayoutsDir", () => {
  it("returns the standalone home for empty input", () => {
    expect(normalizeLayoutsDir("")).toBe(DEFAULT_LAYOUTS_DIR);
    expect(normalizeLayoutsDir("   ")).toBe(DEFAULT_LAYOUTS_DIR);
  });

  it("converts Windows separators to POSIX", () => {
    expect(normalizeLayoutsDir("themes\\custom")).toBe("themes/custom");
  });

  it("strips leading and trailing separators", () => {
    expect(normalizeLayoutsDir("/gitpagelayouts/")).toBe("gitpagelayouts");
  });

  it("collapses repeated separators", () => {
    expect(normalizeLayoutsDir("a//b")).toBe("a/b");
  });

  it("strips runs of leading and trailing separators", () => {
    expect(normalizeLayoutsDir("///a/b///")).toBe("a/b");
    expect(normalizeLayoutsDir("\\\\themes\\")).toBe("themes");
    expect(normalizeLayoutsDir("////")).toBe(DEFAULT_LAYOUTS_DIR);
  });
});

describe("layoutsArtifactPaths", () => {
  it("derives every artifact path from the folder", () => {
    expect(layoutsArtifactPaths("gitpagelayouts")).toEqual({
      root: "gitpagelayouts",
      config: "gitpagelayouts/layoutsConfig.json",
      fallbackConfig: "gitpagelayouts/layoutsFallbackConfig.json",
      templates: "gitpagelayouts/templates",
    });
  });

  it("honours a custom folder", () => {
    expect(layoutsArtifactPaths("meus-temas").config).toBe("meus-temas/layoutsConfig.json");
  });
});
