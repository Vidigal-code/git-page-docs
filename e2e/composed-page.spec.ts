import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const COMPOSED_PAGE_ID = "39";
const NARROW_VIEWPORT = { width: 320, height: 882 };
const OVERFLOW_TOLERANCE = 2;
const MARKDOWN_FILES = ["getting-started.md", "project-overview.md", "html-containers.md"];
const BLOCK_MARKERS = 'article h1[id], iframe[title="HTML content"], [data-testid="route-video"], [data-testid="audio-route-toggle"], button[aria-label="Download PDF"]';

async function openComposition(page: Page, version: string): Promise<Locator> {
  await page.goto(`/v/${version}/?menu=en&id=${COMPOSED_PAGE_ID}`, { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  await expect(main.getByRole("button", { name: "Copy markdown", exact: true })).toHaveCount(3);
  await expect(main.locator('iframe[title="Project guide PDF (English)"]')).toHaveCount(3);
  await expect.poll(() => {
    const url = new URL(page.url());
    return url.pathname.includes(`/v/${version}`) && url.searchParams.get("id") === COMPOSED_PAGE_ID;
  }).toBe(true);
  return main;
}

async function expectNoOverflow(region: Locator): Promise<void> {
  await expect.poll(() => region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(OVERFLOW_TOLERANCE);
}

test.beforeEach(async ({ page }) => {
  const pdf = await readFile("cli/content/assets/gitpagedocs-project-guide.pdf");
  await page.route("**/gitpagedocs-project-guide.pdf", (route) => route.fulfill({ contentType: "application/pdf", body: pdf }));
  await page.route("https://v8.js-dos.com/latest/js-dos.css", (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await page.route("https://v8.js-dos.com/latest/js-dos.js", (route) => route.fulfill({
    contentType: "text/javascript", body: "window.Dos = () => ({ stop: () => Promise.resolve(), setNoCloud: () => undefined });",
  }));
});

for (const version of ["0.0.10", "0.0.11"]) {
  test(`version ${version} keeps all twelve blocks ordered on one narrow page with independent Markdown anchors`, async ({ page }) => {
    await page.setViewportSize(NARROW_VIEWPORT);
    const main = await openComposition(page, version);
    const markers = main.locator(BLOCK_MARKERS);
    await expect(markers).toHaveCount(12);
    const order = await markers.evaluateAll((elements) => elements.map((element) => {
      if (element.tagName === "H1") return element.textContent;
      if (element.getAttribute("title") === "HTML content") return "HTML";
      if (element.getAttribute("data-testid") === "route-video") return "Video";
      return element.getAttribute("aria-label") === "Download PDF" ? "PDF" : "Audio";
    }));
    expect(order).toEqual([
      "Getting Started", "Project Overview", "HTML containers and interactive examples",
      "HTML", "HTML", "Video", "Video", "Audio", "Audio", "PDF", "PDF", "PDF",
    ]);
    const headings = main.locator("article :is(h1,h2,h3,h4,h5,h6)[id]");
    const ids = await headings.evaluateAll((elements) => elements.map((element) => element.id));
    expect(ids.length).toBeGreaterThan(3);
    expect(new Set(ids).size).toBe(ids.length);
    const tables = main.getByRole("navigation", { name: "Table of contents", exact: true });
    await expect(tables).toHaveCount(3);
    const sectionLink = tables.last().getByRole("link").first();
    const sectionTitle = await sectionLink.innerText();
    await sectionLink.click();
    const heading = main.locator("article").getByRole("heading", { name: sectionTitle, exact: true });
    await expect(heading).toBeInViewport();
    const headingId = await heading.getAttribute("id");
    await expect.poll(() => {
      const url = new URL(page.url());
      return { pageId: url.searchParams.get("id"), headingId: decodeURIComponent(url.hash.slice(1)) };
    }).toEqual({ pageId: COMPOSED_PAGE_ID, headingId });
    await page.evaluate(() => document.fonts.ready);
    await expectNoOverflow(main);
    await expectNoOverflow(page.locator("html"));
  });
}

test("focus reads the complete Markdown composition and stays open while navigating sections and documents", async ({ page, isMobile }) => {
  const version = "0.0.11";
  const main = await openComposition(page, version);
  const finalSection = await main.locator("article :is(h1,h2,h3,h4,h5,h6)[id]").last().innerText();
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator('button[aria-label="Focus mode"][title="Focus mode"]:visible').click();
  const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
  await expect(focus.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await focus.getByRole("button", { name: "Download .md", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("page-39.md");
  const sources = await Promise.all(MARKDOWN_FILES.map((file) => readFile(`gitpagedocs/docs/versions/${version}/en/${file}`, "utf8")));
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  expect(await readFile(downloadedPath!, "utf8")).toBe(sources.join("\n\n"));
  await focus.getByRole("button", { name: "Last section", exact: true }).click();
  await expect(focus.getByRole("heading", { name: finalSection, exact: true })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("id")).toBe(COMPOSED_PAGE_ID);
  await focus.getByRole("button", { name: "First section", exact: true }).click();
  await expect(focus.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await focus.getByRole("button", { name: "Next document", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("id")).not.toBe(COMPOSED_PAGE_ID);
  await expect(focus).toBeVisible();
  await focus.getByRole("button", { name: "Previous document", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("id")).toBe(COMPOSED_PAGE_ID);
  await expect(focus.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
});
