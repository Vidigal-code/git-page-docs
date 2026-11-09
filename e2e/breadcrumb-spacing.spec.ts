import { expect, test } from "@playwright/test";

const MINIMUM_SEPARATION_PX = 24;
const MAX_OVERFLOW_PX = 1;
const VIEWPORT_HEIGHT = 900;

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
