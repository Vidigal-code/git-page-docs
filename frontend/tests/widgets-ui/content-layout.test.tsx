// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PdfContainer } from "@/widgets/docs-shell/ui/content-type-containers/pdf-container";
import { MdContainer } from "@/widgets/docs-shell/ui/content-type-containers/md-container";
import { HtmlContainer } from "@/widgets/docs-shell/ui/content-type-containers/html-container";
import type { ContentMetadataLayout } from "@/entities/docs";

afterEach(cleanup);

it("places a media title and description after the document inside its card", () => {
  render(<PdfContainer pathPdf="" language="en" fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={{
    id: 23, titleIsVisible: true, title: { en: "Document title" }, descriptionIsVisible: true, description: { en: "Document description" },
    layout: { title: { placement: "inside", position: "after" }, description: { placement: "inside", position: "after" } },
  }} />);
  const title = screen.getByRole("heading", { name: "Document title" });
  const description = screen.getByRole("heading", { name: "Document description" });
  const document = screen.getByRole("status");
  expect(title.closest("article")).toBe(document.closest("article"));
  expect(description.closest("article")).toBe(document.closest("article"));
  expect(document.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(title.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

const missingPdf = "PDF unavailable. Open or download a valid document.";
const mediaLayouts: { name: string; layout?: ContentMetadataLayout; order: string[]; insideTitle: boolean; insideDescription: boolean }[] = [
  { name: "legacy defaults", order: ["Title", missingPdf, "Description"], insideTitle: true, insideDescription: true },
  { name: "outside title after and outside description before", layout: { title: { placement: "outside", position: "after" }, description: { placement: "outside", position: "before" } }, order: ["Description", missingPdf, "Title"], insideTitle: false, insideDescription: false },
  { name: "both inside before", layout: { description: { position: "before" } }, order: ["Title", "Description", missingPdf], insideTitle: true, insideDescription: true },
  { name: "both outside after", layout: { title: { placement: "outside", position: "after" }, description: { placement: "outside", position: "after" } }, order: [missingPdf, "Title", "Description"], insideTitle: false, insideDescription: false },
];

it.each(mediaLayouts)("preserves visibility, text styling and $name", ({ layout, order, insideTitle, insideDescription }) => {
  const { container, rerender } = render(<PdfContainer pathPdf="" language="en" fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={{
    id: 23, titleIsVisible: true, title: { en: "Title" }, descriptionIsVisible: true, description: { en: "Description" }, layout,
    titlePosition: "left", descriptionPosition: "right", titleCss: "color: red", descriptionCss: "color: blue",
  }} />);
  expect(Array.from(container.querySelectorAll("h1,h3,output"), (element) => element.textContent)).toEqual(order);
  const title = screen.getByRole("heading", { name: "Title" });
  const description = screen.getByRole("heading", { name: "Description" });
  expect(Boolean(title.closest("article"))).toBe(insideTitle);
  expect(Boolean(description.closest("article"))).toBe(insideDescription);
  expect(title.style.textAlign).toBe("left");
  expect(description.style.textAlign).toBe("right");
  expect(title.style.color).toBe("red");
  expect(description.style.color).toBe("blue");
  rerender(<PdfContainer pathPdf="" language="en" fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={{ id: 23, title: { en: "Title" }, description: { en: "Description" }, layout }} />);
  expect(screen.queryByRole("heading")).toBeNull();
});

it("places HTML title inside after the embed and description outside before it independently", () => {
  render(<HtmlContainer html="<p>HTML document</p>" language="en" fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={{
    id: 2, titleIsVisible: true, title: { en: "HTML title" }, descriptionIsVisible: true, description: { en: "HTML description" },
    layout: { title: { placement: "inside", position: "after" }, description: { placement: "outside", position: "before" } },
  }} />);
  const title = screen.getByRole("heading", { name: "HTML title" });
  const description = screen.getByRole("heading", { name: "HTML description" });
  const iframe = screen.getByTitle("HTML content");
  expect(title.closest("article")).toBe(iframe.closest("article"));
  expect(description.closest("article")).toBeNull();
  expect(description.compareDocumentPosition(iframe) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(iframe.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("keeps Markdown metadata outside its source while moving description after the document", () => {
  render(<MdContainer html="<h2>Original heading</h2><p>Original document</p>" language="en" fullscreenCloseLabel="Close" fullscreenExpandLabel="Expand" config={{
    id: 1, titleIsVisible: true, title: { en: "Route title" }, descriptionIsVisible: true, description: { en: "Route description" },
    layout: { title: { placement: "inside", position: "before" }, description: { placement: "inside", position: "after" } },
  }} />);
  const title = screen.getByRole("heading", { name: "Route title" });
  const description = screen.getByRole("heading", { name: "Route description" });
  const original = screen.getByRole("heading", { name: "Original heading" });
  expect(title.closest("article")).toBeNull();
  expect(description.closest("article")).toBeNull();
  expect(title.compareDocumentPosition(original) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(original.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
