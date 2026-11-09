import { expect, test } from "@playwright/test";

const MINIMUM_SEPARATION_PX = 28;
const MAX_OVERFLOW_PX = 1;
const VIEWPORT_HEIGHT = 900;
const MINIMUM_HEADING_CONTENT_GAP_PX = 24;

test("project overview separates accessibility, navigation and content when the viewport changes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.goto("/?lang=pt&menu=pt&id=2", { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  const header = main.locator("header").filter({ has: page.getByRole("heading", { name: "Visão geral do projeto", exact: true }) });
  const reading = main.locator("details").filter({ has: page.locator("summary", { hasText: "Acessibilidade e leitura" }) });
  const breadcrumb = main.getByRole("navigation", { name: "Breadcrumb", exact: true });
  const guide = main.getByRole("navigation", { name: "Table of contents", exact: true });
  await expect(header).toBeVisible();
  await reading.locator("summary").click();
  await expect(reading).toHaveAttribute("open", "");
  await page.evaluate(() => document.fonts.ready);

  for (const viewport of [{ width: 1280, accessibilityOffset: 40 }, { width: 344, accessibilityOffset: 32 }, { width: 280, accessibilityOffset: 32 }]) {
    await page.setViewportSize({ width: viewport.width, height: VIEWPORT_HEIGHT });
    const mainBox = await main.boundingBox();
    const readingBox = await reading.boundingBox();
    const breadcrumbBox = await breadcrumb.boundingBox();
    const headerBox = await header.boundingBox();
    const articleBox = await main.locator("article").first().boundingBox();
    const guideBox = await guide.boundingBox();
    expect(readingBox!.y - mainBox!.y).toBeGreaterThanOrEqual(viewport.accessibilityOffset);
    expect(breadcrumbBox!.y - readingBox!.y - readingBox!.height).toBeGreaterThanOrEqual(MINIMUM_SEPARATION_PX);
    expect(headerBox!.y - breadcrumbBox!.y - breadcrumbBox!.height).toBeGreaterThanOrEqual(MINIMUM_SEPARATION_PX);
    expect(Math.min(articleBox!.y, guideBox!.y) - headerBox!.y - headerBox!.height).toBeGreaterThanOrEqual(MINIMUM_HEADING_CONTENT_GAP_PX);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    await page.screenshot({ path: test.info().outputPath(`overview-spacing-${viewport.width}.png`) });
  }
});

for (const width of [280, 320, 344, 390, 768, 1280]) {
  test(`development breadcrumb separates reading controls and title at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto("/?menu=pt&lang=pt&id=37", { waitUntil: "domcontentloaded" });
    const main = page.getByRole("main");
    const breadcrumb = main.getByRole("navigation", { name: "Breadcrumb", exact: true });
    const heading = main.locator("header").getByRole("heading", { name: "Desenvolva o projeto", exact: true });
    const reading = main.locator("details").filter({
      has: page.locator("summary", { hasText: "Acessibilidade e leitura" }),
    });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Operação e desenvolvimento");
    await expect(heading).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await reading.locator("summary").click();
    await expect(reading).toHaveAttribute("open", "");
    const readingBounds = await reading.boundingBox();
    const breadcrumbBounds = await breadcrumb.boundingBox();
    const headingBounds = await heading.boundingBox();
    expect(readingBounds).not.toBeNull();
    expect(breadcrumbBounds).not.toBeNull();
    expect(headingBounds).not.toBeNull();
    expect(breadcrumbBounds!.y - readingBounds!.y - readingBounds!.height).toBeGreaterThanOrEqual(MINIMUM_SEPARATION_PX);
    expect(headingBounds!.y - breadcrumbBounds!.y - breadcrumbBounds!.height).toBeGreaterThanOrEqual(MINIMUM_SEPARATION_PX);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    await page.screenshot({ path: test.info().outputPath(`breadcrumb-${width}.png`), fullPage: false });
  });
}
