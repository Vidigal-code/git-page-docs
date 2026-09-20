import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveShikiLanguage } from "@/features/source-code-highlight/lib/resolve-shiki-language";
import {
  FALLBACK_SHIKI_THEME_BY_MODE,
  SHIKI_THEME_BY_LAYOUT_ID,
  resolveShikiTheme,
} from "@/features/source-code-highlight/lib/resolve-shiki-theme";
import { toTokenStyle } from "@/features/source-code-highlight/lib/token-style";
import { bundledThemes, type ThemedToken } from "shiki";

describe("resolveShikiLanguage", () => {
  it("maps divergent extensions to their grammar ids", () => {
    expect(resolveShikiLanguage("src/index.mjs")).toBe("javascript");
    expect(resolveShikiLanguage("src/app.tsx")).toBe("tsx");
    expect(resolveShikiLanguage("main.rs")).toBe("rust");
    expect(resolveShikiLanguage("scripts/build.sh")).toBe("shellscript");
    expect(resolveShikiLanguage("config.yml")).toBe("yaml");
    expect(resolveShikiLanguage("README.md")).toBe("markdown");
  });

  it("passes through extensions that already equal their grammar id", () => {
    expect(resolveShikiLanguage("styles/site.css")).toBe("css");
    expect(resolveShikiLanguage("data.json")).toBe("json");
    expect(resolveShikiLanguage("main.go")).toBe("go");
  });

  it("resolves well-known special file names", () => {
    expect(resolveShikiLanguage("docker/Dockerfile")).toBe("dockerfile");
    expect(resolveShikiLanguage("Makefile")).toBe("make");
    expect(resolveShikiLanguage("CMakeLists.txt")).toBe("cmake");
    expect(resolveShikiLanguage(".gitignore")).toBe("ini");
  });

  it("returns undefined when there is no usable hint", () => {
    expect(resolveShikiLanguage("LICENSE")).toBeUndefined();
    expect(resolveShikiLanguage("notes.txt")).toBeUndefined();
    expect(resolveShikiLanguage("archive.")).toBeUndefined();
    expect(resolveShikiLanguage("")).toBeUndefined();
  });

  it("is case-insensitive on names and extensions", () => {
    expect(resolveShikiLanguage("SRC/App.TSX")).toBe("tsx");
    expect(resolveShikiLanguage("DOCKERFILE")).toBe("dockerfile");
  });
});

describe("resolveShikiTheme", () => {
  it("maps layouts to a palette from the same color family", () => {
    expect(resolveShikiTheme("nord-dark", "dark")).toBe("nord");
    expect(resolveShikiTheme("github-dark", "dark")).toBe("github-dark");
    expect(resolveShikiTheme("cyberpunk-dark", "dark")).toBe("synthwave-84");
    expect(resolveShikiTheme("sand-light", "light")).toBe("solarized-light");
    expect(resolveShikiTheme("vscode-dark", "dark")).toBe("dark-plus");
    expect(resolveShikiTheme("vscode-light", "light")).toBe("light-plus");
  });

  it("falls back to the VS Code default palette by mode", () => {
    expect(resolveShikiTheme("some-custom-layout", "dark")).toBe("dark-plus");
    expect(resolveShikiTheme("some-custom-layout", "light")).toBe("light-plus");
    expect(resolveShikiTheme(undefined, "dark")).toBe("dark-plus");
    expect(resolveShikiTheme(undefined, "light")).toBe("light-plus");
  });

  it("only references themes that Shiki actually bundles", () => {
    const known = new Set(Object.keys(bundledThemes));
    for (const theme of [
      ...Object.values(SHIKI_THEME_BY_LAYOUT_ID),
      ...Object.values(FALLBACK_SHIKI_THEME_BY_MODE),
    ]) {
      expect(known.has(theme), `unknown Shiki theme: ${theme}`).toBe(true);
    }
  });

  it("covers every shipped layout template", () => {
    const templatesDir = path.resolve(__dirname, "../../gitpagelayouts/templates");
    const layoutIds = readdirSync(templatesDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""));
    expect(layoutIds.length).toBeGreaterThan(0);
    for (const layoutId of layoutIds) {
      expect(SHIKI_THEME_BY_LAYOUT_ID[layoutId], `layout without a mapped palette: ${layoutId}`).toBeDefined();
    }
  });
});

describe("toTokenStyle", () => {
  function token(overrides: Partial<ThemedToken>): ThemedToken {
    return { content: "x", offset: 0, ...overrides } as ThemedToken;
  }

  it("maps color and the TextMate font-style bitmask", () => {
    expect(toTokenStyle(token({ color: "#569CD6" }))).toEqual({ color: "#569CD6" });
    expect(toTokenStyle(token({ color: "#fff", fontStyle: 1 }))).toEqual({
      color: "#fff",
      fontStyle: "italic",
    });
    expect(toTokenStyle(token({ fontStyle: 2 | 4 }))).toEqual({
      fontWeight: 600,
      textDecoration: "underline",
    });
  });

  it("returns undefined for an unstyled token", () => {
    expect(toTokenStyle(token({}))).toBeUndefined();
    expect(toTokenStyle(token({ fontStyle: 0 }))).toBeUndefined();
  });
});
