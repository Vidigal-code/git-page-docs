import { describe, it, expect } from "vitest";
import { parseAiPages, slugify } from "../ai/application/docs-pattern";

describe("slugify", () => {
  it("lowercases, strips accents and collapses separators", () => {
    expect(slugify("Getting Started!")).toBe("getting-started");
    expect(slugify("  Olá, Mundo  ")).toBe("ola-mundo");
    expect(slugify("--a--b--")).toBe("a-b");
  });

  it("falls back to 'page' when nothing survives", () => {
    expect(slugify("")).toBe("page");
    expect(slugify("!!!")).toBe("page");
    expect(slugify("文档")).toBe("page");
  });

  it("caps the slug at 60 characters", () => {
    expect(slugify("x".repeat(80))).toHaveLength(60);
  });
});

describe("parseAiPages", () => {
  it("splits pages on the delimiter line and trims slug and title", () => {
    const pages = parseAiPages(
      "=== PAGE:   getting-started   |   Getting Started   ===\r\nBody one\r\n\r\n===PAGE:api|API===\nBody two\n",
    );
    expect(pages).toEqual([
      { slug: "getting-started", title: "Getting Started", body: "Body one" },
      { slug: "api", title: "API", body: "Body two" },
    ]);
  });

  it("keeps pipes and === inside the title and falls back to the slug when the title is empty", () => {
    const pages = parseAiPages(
      "=== PAGE: a | Title with | pipe and === inside ===\nx\n=== PAGE: b | ===\ny\n=== PAGE: c | Title ====\nz",
    );
    expect(pages.map((page) => [page.slug, page.title])).toEqual([
      ["a", "Title with | pipe and === inside"],
      ["b", "b"],
      ["c", "Title ="],
    ]);
  });

  it("treats malformed delimiters as body text", () => {
    const pages = parseAiPages(
      "=== PAGE: real | Real ===\n=== PAGE: no-pipe ===\n  === PAGE: indented | X ===\n=== PAGE: open | X\nbody",
    );
    expect(pages).toHaveLength(1);
    expect(pages[0].body).toBe("=== PAGE: no-pipe ===\n  === PAGE: indented | X ===\n=== PAGE: open | X\nbody");
  });

  it("returns the whole response as an overview when no delimiter is found", () => {
    expect(parseAiPages("just text")).toEqual([{ slug: "ai-overview", title: "Overview", body: "just text" }]);
    expect(parseAiPages("")).toEqual([]);
  });

  it("suffixes duplicate slugs", () => {
    const pages = parseAiPages("=== PAGE: a | A ===\nx\n=== PAGE: a | A again ===\ny");
    expect(pages.map((page) => page.slug)).toEqual(["a", "a-2"]);
  });
});
