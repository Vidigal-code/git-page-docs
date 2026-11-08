// @vitest-environment jsdom
import { expect, it } from "vitest";
import { markdownToHtml } from "@/entities/docs/api/utils/markdown";
import { MARKDOWN_GFM_FIXTURE } from "../../../e2e/fixtures/markdown-gfm";

function renderFixture(): HTMLDivElement {
  const element = document.createElement("div");
  element.innerHTML = markdownToHtml(MARKDOWN_GFM_FIXTURE);
  return element;
}

it("renders readable Markdown while removing active HTML and author styles", () => {
  const element = document.createElement("div");
  element.innerHTML = markdownToHtml([
    "# Safe heading",
    '<script>alert("xss")</script>',
    '<style>p { color: transparent }</style>',
    '<p style="color: transparent" hidden>Visible content</p>',
    '<img src="https://example.com/image.png" onerror="alert(1)" alt="Image">',
    '<a href="javascript:alert(1)" onclick="alert(1)">Readable link</a>',
  ].join("\n\n"));
  expect(element.querySelector("script, style, [style], [hidden], [onerror], [onclick]")).toBeNull();
  expect(element.querySelector("h1")?.id).toBe("safe-heading");
  expect(element.querySelector("p")?.textContent).toBe("Visible content");
  expect(element.querySelector("img")?.getAttribute("src")).toBe("https://example.com/image.png");
  expect(element.querySelector("a")?.hasAttribute("href")).toBe(false);
});

it("preserves all heading levels, Setext headings and safe author anchors", () => {
  const element = renderFixture();
  expect([...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) => [heading.tagName, heading.id])).toEqual([
    ["H1", "markdown-rendering"], ["H2", "second-level"], ["H3", "third-level"],
    ["H4", "fourth-level"], ["H5", "fifth-level"], ["H6", "sixth-level"],
    ["H2", "setext-heading"], ["H2", "custom-anchor"],
  ]);
  expect(element.querySelector("p strong")?.textContent).toBe("strong");
  expect(element.querySelector("p em")?.textContent).toBe("emphasis");
  expect(element.querySelector("p del")?.textContent).toBe("deleted");
});

it("renders nested lists, ordered starts, disabled task boxes and block quotations", () => {
  const element = renderFixture();
  expect(element.querySelector("ul ul li")?.textContent).toBe("Nested item");
  expect(element.querySelector("ol")?.getAttribute("start")).toBe("3");
  const tasks = [...element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
  expect(tasks.map((task) => ({ checked: task.checked, disabled: task.disabled }))).toEqual([
    { checked: false, disabled: true }, { checked: true, disabled: true },
  ]);
  expect(element.querySelector("blockquote blockquote")?.textContent?.trim()).toBe("A nested quotation.");
  expect(element.querySelectorAll("hr")).toHaveLength(1);
});

it("renders fenced, indented and inline code as literal text", () => {
  const element = renderFixture();
  expect(element.querySelector("pre code.language-typescript")?.textContent).toBe('const greeting = "Hello <world>";\nconsole.log(greeting);\n');
  expect([...element.querySelectorAll("pre code")].at(1)?.textContent).toBe("Indented code <example>\n");
  expect(element.querySelector("p code")?.textContent).toBe("inline <code>");
  expect(element.querySelector("pre world, pre example, p code code")).toBeNull();
});

it("preserves links, references, autolinks, images and table alignment", () => {
  const element = renderFixture();
  expect(element.querySelector('a[href="https://example.com/reference"]')?.getAttribute("title")).toBe("Reference title");
  expect(element.querySelector('a[href="https://example.com/autolink"]')?.textContent).toBe("https://example.com/autolink");
  expect(element.querySelector('a[href="https://example.com/plain"]')?.textContent).toBe("https://example.com/plain");
  expect(element.querySelector("img")?.getAttribute("alt")).toBe("Example image");
  expect(element.querySelector("img")?.getAttribute("title")).toBe("Image title");
  expect([...element.querySelectorAll("th")].map((cell) => cell.getAttribute("align"))).toEqual(["left", "center", "right"]);
  expect(element.querySelector("td strong")?.textContent).toBe("Strong cell");
  expect(element.querySelector("td code")?.textContent).toBe("code cell");
});

it("preserves escaped characters, entities, hard breaks and safe disclosure markup", () => {
  const element = renderFixture();
  expect(element.textContent).toContain("Escaped *asterisks* & entities © 🚀.");
  const paragraph = [...element.querySelectorAll("p")].find((item) => item.textContent?.startsWith("Hard line break"));
  expect(paragraph?.querySelectorAll("br")).toHaveLength(1);
  expect(paragraph?.textContent).toContain("Second line with a soft\nline break.");
  expect(element.querySelector("details")?.hasAttribute("open")).toBe(true);
  expect(element.querySelector("summary")?.textContent).toBe("More information");
  expect([...element.querySelectorAll("kbd")].map((key) => key.textContent)).toEqual(["Ctrl", "C"]);
  expect(element.querySelector("sub")?.textContent).toBe("2");
  expect(element.querySelector("sup")?.textContent).toBe("2");
  expect(element.querySelector("[style], [hidden]")).toBeNull();
});

it.each([
  '<a href="java&#x00000073;cript:alert(1)">Link</a>',
  '<a href="javascript&#x3a;alert(1)">Link</a>',
  '[Link](javascript:alert%281%29)',
])("removes executable link protocols (%s)", (markdown) => {
  const element = document.createElement("div");
  element.innerHTML = markdownToHtml(markdown);
  expect(element.querySelector("a")?.textContent).toBe("Link");
  expect(element.querySelector("a")?.hasAttribute("href")).toBe(false);
});

it("does not let malformed raw-text elements reintroduce active markup", () => {
  const element = document.createElement("div");
  element.innerHTML = markdownToHtml('<textarea></textarea/><img src=x onerror=alert(1)><xmp></xmp/><script>alert(1)</script>');
  expect(element.querySelector("textarea, xmp, script, [onerror]")).toBeNull();
});
