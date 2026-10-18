// @vitest-environment jsdom
import { expect, it } from "vitest";
import { prepareMarkdownContent } from "@/entities/docs/lib/markdown/prepare-markdown-content";
import type { MarkdownContentOptions } from "@/entities/docs/lib/markdown/prepare-markdown-content";
import { markdownToHtml } from "@/entities/docs/api/utils/markdown";

it("highlights a localized phrase across inline formatting and adds its navigation target", () => {
  const result = prepareMarkdownContent({
    html: '<h2 id="setup">Setup</h2><p>Leia a <strong>configuração</strong> completa.</p>',
    language: "pt",
    config: {
      id: 1, RouteguideBrand: true, RouteGuideSpeciFicbrand: ["setup"],
      markdownMarkers: { items: [{ id: "reading", text: { pt: "a configuração completa", en: "the complete configuration" }, label: { pt: "Configuração importante", en: "Important configuration" } }] },
    },
  });
  const root = document.createElement("div");
  root.innerHTML = result.html;
  expect([...root.querySelectorAll("mark")].map((mark) => mark.textContent).join("")).toBe("a configuração completa");
  expect(root.querySelector("strong mark")?.textContent).toBe("configuração");
  expect(root.querySelector("p")?.textContent).toBe("Leia a configuração completa.");
  expect(result.headings).toEqual([
    { id: "setup", text: "Setup", level: 2 },
    { id: "markdown-marker-reading", text: "Configuração importante", level: 2 },
  ]);
  expect(root.querySelector('[id="markdown-marker-reading"]')?.tagName).toBe("MARK");
  expect(result.issues).toEqual([]);
});

it("matches visible spaces across line breaks and adjacent blocks without joining separate words", () => {
  const html = markdownToHtml("Ação<br>rápida\n\n<table><tr><td>First</td><td>Second</td></tr></table>");
  const result = prepareMarkdownContent({ html, language: "pt", config: { id: 1, markdownMarkers: { items: [
    { id: "break", text: "Ação rápida" }, { id: "cells", text: "First Second" },
    { id: "joined", text: "Açãorápida" },
  ] } } });
  expect(result.headings.map((heading) => heading.id)).toEqual(["markdown-marker-break", "markdown-marker-cells"]);
  expect(result.issues).toHaveLength(1);
  expect(result.html).toContain("<br>");
});

it("avoids duplicate targets, preserves existing fragment links and reports invalid item identifiers", () => {
  const result = prepareMarkdownContent({
    html: '<h2 id="résumé">Summary</h2><a href="#r%C3%A9sum%C3%A9">Jump</a><p id="markdown-marker-note">Text</p>',
    language: "en", instanceId: "second",
    config: { id: 1, RouteguideBrand: true, markdownMarkers: { items: [
      { id: "heading", selector: "h2", label: "Marked summary" },
      { id: "note", text: "Text" }, { id: "note", text: "Jump" }, { id: "", text: "Jump" },
    ] } },
  });
  const root = document.createElement("div"); root.innerHTML = result.html;
  const ids = [...root.querySelectorAll("[id]")].map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(result.headings.map((heading) => heading.text)).toEqual(["Marked summary", "note"]);
  expect(root.querySelector("a")?.getAttribute("href")).toBe("#second--r%C3%A9sum%C3%A9");
  expect(result.issues).toHaveLength(2);
});

it("merges theme colors from site, document and marker while rejecting invalid colors", () => {
  const result = prepareMarkdownContent({
    html: "<p>Important</p>", language: "en",
    defaults: { style: { background: "var(--accent)", color: "var(--text)" } },
    config: { id: 1, markdownMarkers: { style: { color: "white" }, items: [
      { id: "notice", text: "Important", style: { background: "gold", outlineColor: "url(https://example.com/image)" } },
    ] } },
  });
  const root = document.createElement("div");
  root.innerHTML = result.html;
  const mark = root.querySelector("mark");
  expect(mark?.style.getPropertyValue("--markdown-marker-background")).toBe("gold");
  expect(mark?.style.getPropertyValue("--markdown-marker-color")).toBe("white");
  expect(mark?.style.getPropertyValue("--markdown-marker-outline")).toBe("");
  expect(result.issues).toHaveLength(1);
});

it("selects the second Unicode phrase across whitespace without changing visible text", () => {
  const result = prepareMarkdownContent({
    html: '<p>Ação &amp; café</p><p>Ação\n <em>&amp;</em> café!</p>', language: "pt",
    config: { id: 1, markdownMarkers: { items: [{ id: "second", text: "Ação & café".normalize("NFD"), occurrence: 2 }] } },
  });
  const root = document.createElement("div");
  root.innerHTML = result.html;
  expect(root.querySelector("p mark")).not.toBeNull();
  expect(root.querySelector("p:first-child mark")).toBeNull();
  expect(root.querySelector("p:last-child")?.textContent).toBe("Ação\n & café!");
  expect(root.querySelector("em mark")?.textContent).toBe("&");
  expect(result.headings[0]?.id).toBe("markdown-marker-second");
});

it("reports invalid or missing targets without creating dead links or marking executable content", () => {
  const result = prepareMarkdownContent({
    html: '<script>secret()</script><p>Visible</p><p hidden>Hidden</p>', language: "en",
    config: { id: 1, markdownMarkers: { items: [
      { id: "syntax", selector: "[" }, { id: "missing", text: "Absent" },
      { id: "script", selector: "script" }, { id: "hidden", text: "Hidden" },
      { id: "bad-occurrence", text: "Visible", occurrence: 0 },
      { id: "ambiguous", text: "Visible", selector: "p" },
    ] } },
  });
  expect(result.headings).toEqual([]);
  expect(result.html).not.toContain("data-markdown-marker");
  expect(result.issues).toHaveLength(6);
});

it("keeps headings unchanged when markers are disabled and ignores individually disabled items", () => {
  const options: MarkdownContentOptions & { config: NonNullable<MarkdownContentOptions["config"]> } = {
    html: '<h2 id="heading">Heading</h2><p>Keep this.</p>', language: "en",
    config: { id: 1, RouteguideBrand: true, markdownMarkers: { items: [{ id: "keep", text: "Keep" }] } },
    defaults: { enabled: false },
  };
  expect(prepareMarkdownContent(options).html).toBe(options.html);
  expect(prepareMarkdownContent(options).headings).toHaveLength(1);
  options.config.markdownMarkers = { items: [{ id: "keep", text: "Keep", enabled: false }] };
  expect(prepareMarkdownContent({ ...options, defaults: { enabled: true } }).html).toBe(options.html);
});

it("marks the requested table occurrence, retains existing anchors and orders the index by document position", () => {
  const result = prepareMarkdownContent({
    html: '<p>Before</p><table><tr><td>First</td><td id="price">Second</td></tr></table><h2 id="after">After</h2>',
    language: "en", instanceId: "page-1-details",
    config: { id: 1, RouteguideBrand: true, markdownMarkers: { items: [
      { id: "table", selector: "td", occurrence: 2, label: "Price" },
    ] } },
  });
  const root = document.createElement("div");
  root.innerHTML = result.html;
  const target = root.querySelector('[id="page-1-details--price"]');
  expect(target?.getAttribute("data-markdown-marker")).toBe("table");
  expect(target?.textContent).toBe("Second");
  expect(result.headings).toEqual([
    { id: "page-1-details--price", text: "Price", level: 2 },
    { id: "page-1-details--after", text: "After", level: 2 },
  ]);
});
