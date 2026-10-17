import { expect, it } from "vitest";
import { resolvePageMarkdownHtml, type LoadedMdContent, type LoadedPage } from "@/entities/docs";
import { resolvePageMarkdownSource } from "@/entities/docs/lib/markdown/resolve-page-markdown";

function markdown(routeId: number, title: string): LoadedMdContent {
  return { routeId, config: { id: routeId, path: { en: `${title}.md` } }, markdownByLanguage: { en: `<h1>${title}</h1>` }, sourceByLanguage: { en: `# ${title}` } };
}

it("reads repeated Markdown blocks in the configured order without rendering other content types", () => {
  const first = markdown(1, "First");
  const last = markdown(2, "Last");
  const page: LoadedPage = { id: 39, blocks: [
    { id: "first", type: "md", content: first },
    { id: "html", type: "html", content: { routeId: 3, config: { id: 3 }, htmlByLanguage: { en: "<p>Embedded</p>" } } },
    { id: "last", type: "md", content: last },
    { id: "repeat", type: "md", content: first },
  ] };
  expect(resolvePageMarkdownHtml(page, { language: "en", pageIndex: 0, legacyDocs: [] })).toBe("<h1>First</h1>\n<h1>Last</h1>\n<h1>First</h1>");
});

it("combines only authorized translated source in order and isolates repeated focus anchors", () => {
  const first = { ...markdown(1, "First"), markdownByLanguage: { en: '<h1 id="intro">First</h1>' } };
  const page: LoadedPage = { id: 39, blocks: [
    { id: "one", type: "md", content: first },
    { id: "two", type: "md", content: first },
    { id: "secret", type: "md", content: { ...markdown(2, "Secret"), config: { id: 2, path: { en: "secret.md" }, authorization: { requiredRoles: ["editor"] } } } },
  ] };
  const options = { language: "en", pageIndex: 0, legacyDocs: [] };
  expect(resolvePageMarkdownSource(page, options)).toBe("# First\n\n# First");
  expect(resolvePageMarkdownHtml(page, options)).toBe('<h1 id="focus-39-one--intro">First</h1>\n<h1 id="focus-39-two--intro">First</h1>');
  expect(resolvePageMarkdownSource(page, { ...options, language: "pt" })).toBeUndefined();
});

it("excludes denied Markdown blocks and the entire denied page from focus and narration", () => {
  const hidden = { ...markdown(2, "Secret"), config: { id: 2, path: { en: "secret.md" }, authorization: { requiredRoles: ["editor"] } } };
  const page: LoadedPage = { id: 39, blocks: [
    { id: "public", type: "md", content: markdown(1, "Public") },
    { id: "private", type: "md", content: hidden },
  ] };
  const options = { language: "en", pageIndex: 0, legacyDocs: [] };
  expect(resolvePageMarkdownHtml(page, options)).toBe("<h1>Public</h1>");
  expect(resolvePageMarkdownHtml(page, { ...options, canAccessRoute: () => true })).toContain("Secret");
  expect(resolvePageMarkdownHtml({ ...page, authorization: { requiredRoles: ["editor"] } }, options)).toBe("");
});
