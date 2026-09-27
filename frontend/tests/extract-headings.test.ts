import { describe, it, expect } from "vitest";
import { extractHeadingsFromHtml } from "@/entities/docs/lib/markdown/extract-headings";

describe("extractHeadingsFromHtml", () => {
  it("returns an empty list for empty, heading-less or out-of-range HTML", () => {
    expect(extractHeadingsFromHtml("")).toEqual([]);
    expect(extractHeadingsFromHtml("<p>no headings</p>")).toEqual([]);
    expect(extractHeadingsFromHtml('<h7 id="x">not a heading</h7>')).toEqual([]);
  });

  it("extracts every level from h1 to h6 in document order", () => {
    const html = [1, 2, 3, 4, 5, 6]
      .map((level) => `<h${level} id="h${level}">Level ${level}</h${level}>`)
      .join("\n");
    expect(extractHeadingsFromHtml(html)).toEqual([
      { id: "h1", text: "Level 1", level: 1 },
      { id: "h2", text: "Level 2", level: 2 },
      { id: "h3", text: "Level 3", level: 3 },
      { id: "h4", text: "Level 4", level: 4 },
      { id: "h5", text: "Level 5", level: 5 },
      { id: "h6", text: "Level 6", level: 6 },
    ]);
  });

  it("reads the id from double- and single-quoted attributes regardless of position", () => {
    const html = `<h2 class="a" id="double">Double</h2><h3 id='single' class="b">Single</h3>`;
    expect(extractHeadingsFromHtml(html)).toEqual([
      { id: "double", text: "Double", level: 2 },
      { id: "single", text: "Single", level: 3 },
    ]);
  });

  it("slugifies the text when no id attribute is present", () => {
    expect(extractHeadingsFromHtml("<h2>Hello World!</h2>")).toEqual([
      { id: "hello-world", text: "Hello World!", level: 2 },
    ]);
    expect(extractHeadingsFromHtml("<h2>  Multiple   spaces -- and_underscores </h2>")).toEqual([
      { id: "multiple-spaces-and_underscores", text: "Multiple   spaces -- and_underscores", level: 2 },
    ]);
  });

  it("falls back to the slug when the id attribute is empty", () => {
    expect(extractHeadingsFromHtml('<h2 id="">Empty Id</h2>')).toEqual([
      { id: "empty-id", text: "Empty Id", level: 2 },
    ]);
  });

  it("strips nested inline tags from the text", () => {
    const html = `<h2 id="x">Title <code>code</code> <em>em</em></h2>`;
    expect(extractHeadingsFromHtml(html)).toEqual([{ id: "x", text: "Title code em", level: 2 }]);
  });

  it("keeps a literal '<>' verbatim", () => {
    expect(extractHeadingsFromHtml(`<h2 id="x">a <> b</h2>`)).toEqual([{ id: "x", text: "a <> b", level: 2 }]);
  });

  it("keeps an unclosed '<' verbatim", () => {
    expect(extractHeadingsFromHtml(`<h2 id="x">1 < 2 and 3 < 4</h2>`)).toEqual([
      { id: "x", text: "1 < 2 and 3 < 4", level: 2 },
    ]);
  });

  it("drops a '<' run through the next '>' exactly like the legacy /<[^>]+>/g regex", () => {
    expect(extractHeadingsFromHtml(`<h2 id="x">a < b <em>c</em></h2>`)).toEqual([
      { id: "x", text: "a c", level: 2 },
    ]);
  });

  it("preserves inner whitespace and newlines while trimming the ends", () => {
    expect(extractHeadingsFromHtml(`<h2 id="x">\n  Line one\nLine two  \n</h2>`)).toEqual([
      { id: "x", text: "Line one\nLine two", level: 2 },
    ]);
  });

  it("filters by specificIds (explicit or slugified) keeping document order", () => {
    const html = `<h2 id="a">A</h2><h2>Hello World</h2><h3 id="c">C</h3>`;
    expect(extractHeadingsFromHtml(html, ["c", "hello-world"])).toEqual([
      { id: "hello-world", text: "Hello World", level: 2 },
      { id: "c", text: "C", level: 3 },
    ]);
    expect(extractHeadingsFromHtml(html, ["missing"])).toEqual([]);
    expect(extractHeadingsFromHtml(html, [])).toHaveLength(3);
  });

  it("skips headings that have neither an id nor slug-able text", () => {
    const html = `<h2></h2><h2>   </h2><h2>!!!</h2><h2><em></em></h2><h2 id="keep"></h2>`;
    expect(extractHeadingsFromHtml(html)).toEqual([{ id: "keep", text: "", level: 2 }]);
  });

  it("does not match mismatched closing tags", () => {
    expect(extractHeadingsFromHtml(`<h2 id="x">Mismatch</h3>`)).toEqual([]);
    expect(extractHeadingsFromHtml(`<h2 id="x">Mismatch</h3><h3 id="y">Ok</h3>`)).toEqual([
      { id: "y", text: "Ok", level: 3 },
    ]);
  });

  it("matches heading tags and the id attribute case-insensitively", () => {
    expect(extractHeadingsFromHtml(`<H2 ID="Upper">Upper</H2><h3 Id='Mixed'>Mixed</H3>`)).toEqual([
      { id: "Upper", text: "Upper", level: 2 },
      { id: "Mixed", text: "Mixed", level: 3 },
    ]);
  });

  it("handles a heading containing 50k '<' characters quickly", () => {
    const run = "<".repeat(50_000);
    const started = performance.now();
    const headings = extractHeadingsFromHtml(`<h2 id="x">${run}</h2>`);
    expect(performance.now() - started).toBeLessThan(1_000);
    expect(headings).toEqual([{ id: "x", text: run, level: 2 }]);
  });
});
