// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { markdownToHtml } from "@/entities/docs";
import { MdContainer } from "@/widgets/docs-shell/ui/content-type-containers/md-container";
import type { ContentTypeRouteConfig } from "@/entities/docs";

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe = vi.fn();
    disconnect = vi.fn();
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("indexes only the configured Markdown heading tags while keeping every heading in the document", () => {
  render(<MdContainer language="en" html={markdownToHtml("# Overview\n\n## Setup\n\n### Install\n\n#### Detail\n\n##### Note\n\n###### Footnote")}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["h1", "h2", "h3"] }} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Overview", "Setup", "Install"]);
  expect(screen.getAllByRole("heading")).toHaveLength(6);
});

it("indexes configured content tags and creates working anchors without changing their content", () => {
  render(<MdContainer language="en" html={markdownToHtml("Read **this** paragraph.\n\n> A quote.\n\n![Architecture](https://example.com/diagram.png)")}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p", "img"] }} />);
  const links = screen.getAllByRole("link");
  expect(links.map(link => link.textContent)).toEqual(["Read this paragraph.", "A quote.", "Architecture"]);
  expect(links.map(link => document.getElementById(decodeURIComponent((link.getAttribute("href") ?? "").slice(1)))?.tagName)).toEqual(["P", "P", "IMG"]);
  expect(screen.getByRole("img", { name: "Architecture" }).getAttribute("src")).toBe("https://example.com/diagram.png");
});

it("normalizes safe tag names and diagnoses unsafe selectors or malformed configuration entries", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const config = JSON.parse('{"id":1,"RouteguideBrand":true,"RouteGuideTags":["H2","p","script","p:hover",42]}') as ContentTypeRouteConfig;
  render(<MdContainer language="en" html={markdownToHtml("## Setup\n\nA paragraph.\n\n<script>bad()</script>")}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={config} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Setup", "A paragraph."]);
  expect(warn.mock.calls.flat().join(" ")).toContain("RouteGuideTags");
  expect(document.querySelector("script")).toBeNull();
});

it("keeps repeated content targets unique across Markdown blocks and preserves their local links", () => {
  const html = '<p id="note">First note</p><p>Repeated</p><p>Repeated</p><a href="#note">Read note</a>';
  for (const instanceId of ["first", "second"]) {
    render(<MdContainer language="en" html={html} instanceId={instanceId}
      fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
      config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p"] }} />);
  }
  const targets = [...document.querySelectorAll("article p")];
  expect(new Set(targets.map(target => target.id)).size).toBe(6);
  for (const link of screen.getAllByRole("link")) {
    const target = document.getElementById(decodeURIComponent((link.getAttribute("href") ?? "").slice(1)));
    expect(target?.textContent).toBe(link.textContent === "Read note" ? "First note" : link.textContent);
  }
  expect(screen.getAllByRole("link", { name: "Read note" }).map(link => link.getAttribute("href"))).toEqual(["#first--note", "#second--note"]);
});

it("resolves duplicate authored IDs and collisions with generated anchors to the correct content", () => {
  render(<MdContainer language="en" html={'<p id="repeat">First</p><p id="repeat">Second</p><p id="route-guide-p-third">Existing</p><p>Third</p>'}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p"] }} />);
  const links = screen.getAllByRole("link");
  expect(new Set(links.map(link => link.getAttribute("href"))).size).toBe(4);
  expect(links.map(link => document.getElementById((link.getAttribute("href") ?? "").slice(1))?.textContent)).toEqual(["First", "Second", "Existing", "Third"]);
});

it("scopes targets and local links when quoted HTML attributes contain greater-than characters", () => {
  const html = '<p title="a>b" id="note">A comparison</p><a title="Read a>b" href="#note">Read comparison</a>';
  for (const instanceId of ["first", "second"]) {
    render(<MdContainer language="en" html={html} instanceId={instanceId}
      fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
      config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p"] }} />);
  }
  expect([...document.querySelectorAll("article p")].map(element => element.id)).toEqual(["first--note", "second--note"]);
  for (const link of screen.getAllByRole("link")) {
    const target = document.getElementById(decodeURIComponent((link.getAttribute("href") ?? "").slice(1)));
    expect(target?.textContent).toBe("A comparison");
  }
});

it("reveals a selected paragraph inside collapsed details before navigating to it", () => {
  render(<MdContainer language="en" html={'<details><summary>More</summary><details><summary>Nested</summary><p id="detail">Hidden detail</p></details></details>'}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p"] }} />);
  const target = document.getElementById("detail");
  if (!target) throw new Error("The configured target must be rendered");
  target.scrollIntoView = vi.fn();
  fireEvent.click(screen.getByRole("link", { name: "Hidden detail" }));
  expect([...document.querySelectorAll("details")].every(details => details.open)).toBe(true);
  expect(window.location.hash).toBe("#detail");
});

it("preserves legacy heading levels when the tag setting is omitted", () => {
  render(<MdContainer language="en" html={markdownToHtml("# Overview\n\n###### Detail\n\nA paragraph.")}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={{ id: 1, RouteguideBrand: true }} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Overview", "Detail"]);
});

it("allows an empty tag list while retaining explicit markers and their labels", () => {
  render(<MdContainer language="en" html={markdownToHtml("# Overview\n\nAn important note.")}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: [], markdownMarkers: { items: [
      { id: "note", text: "important note", label: "Read this note" },
    ] } }} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Read this note"]);
  expect(document.querySelector("mark")?.textContent).toBe("important note");
});

it("intersects selected tags with the existing ID filter and lets explicit markers override labels", () => {
  render(<MdContainer language="en" html={'<h2 id="title">Title</h2><p id="first">First</p><p id="second">Second</p>'}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p"], RouteGuideSpeciFicbrand: ["first"], markdownMarkers: { items: [
      { id: "chosen", selector: "#first", label: "Chosen paragraph" },
    ] } }} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Chosen paragraph"]);
  expect(document.querySelector("[data-markdown-marker]")?.id).toBe("first");
});

it("diagnoses a malformed tag list and retains the legacy readable guide", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const config = JSON.parse('{"id":1,"RouteguideBrand":true,"RouteGuideTags":"h2"}') as ContentTypeRouteConfig;
  render(<MdContainer language="en" html={markdownToHtml("# Overview\n\n###### Detail")}
    fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={config} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Overview", "Detail"]);
  expect(warn.mock.calls.flat().join(" ")).toContain("RouteGuideTags must be an array");
});

it("normalizes whitespace and limits labels without splitting Unicode characters or losing image alternatives", () => {
  const html = `<p>${" ".repeat(110)}<strong>Readable</strong></p><p>${"😀".repeat(100)}</p><img title="  " alt="Diagram" src="diagram.png">`;
  render(<MdContainer language="en" html={html} fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand"
    config={{ id: 1, RouteguideBrand: true, RouteGuideTags: ["p", "img"] }} />);
  expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Readable", `${"😀".repeat(96)}…`, "Diagram"]);
});
