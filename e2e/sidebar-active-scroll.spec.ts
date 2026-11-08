import { expect, test, type Locator } from "@playwright/test";

const DESKTOP_WIDTHS = [1280, 1920];
const MOBILE_WIDTHS = [280, 320, 344, 390, 768];
const VIEWPORT_HEIGHT = 480;
const ALIGNMENT_TOLERANCE_PX = 1;
const DOCUMENTS = { current: "CLI reference", next: "MCP server", routeId: 18 };

async function expectCurrentItemVisible(sidebar: Locator): Promise<void> {
  await expect.poll(async () => sidebar.evaluate((element) => {
    const current = element.querySelector('[aria-current="page"]');
    if (!current) return Number.POSITIVE_INFINITY;
    const item = current.getBoundingClientRect();
    const panel = element.getBoundingClientRect();
    return Math.max(panel.top - item.top, item.bottom - panel.bottom, 0);
  })).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
}

async function expectCurrentItemCentered(sidebar: Locator): Promise<void> {
  await expect.poll(async () => sidebar.evaluate((element) => {
    const current = element.querySelector('[aria-current="page"]');
    if (!current) return Number.POSITIVE_INFINITY;
    const item = current.getBoundingClientRect();
    const panel = element.getBoundingClientRect();
    const distance = item.top + item.height / 2 - panel.top - element.clientTop - element.clientHeight / 2;
    const atStart = element.scrollTop <= 1;
    const atEnd = element.scrollHeight - element.clientHeight - element.scrollTop <= 1;
    if ((atStart && distance <= 0) || (atEnd && distance >= 0)) return 0;
    return Math.abs(distance);
  })).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
}

for (const width of DESKTOP_WIDTHS) {
  test(`unlocked desktop navigation follows the current item in both directions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto(`/?menu=en&id=${DOCUMENTS.routeId}&theme=github-dark&modetheme=dark`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("sidebar-expand").click();
    const sidebar = page.getByRole("complementary").filter({
      has: page.getByRole("button", { name: "Close", exact: true }),
    });
    await expect(sidebar).toBeVisible();
    expect(await sidebar.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0);
    const current = sidebar.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(DOCUMENTS.current);
    await expectCurrentItemVisible(sidebar);
    await expectCurrentItemCentered(sidebar);

    const main = page.getByRole("main");
    const next = main.getByRole("button", { name: "Next", exact: true });
    const previous = main.getByRole("button", { name: "Previous", exact: true });
    await sidebar.evaluate((element) => { element.scrollTop = 0; });
    await expect(sidebar.getByRole("button", { name: DOCUMENTS.next, exact: true })).not.toBeInViewport();
    await next.press("Enter");
    await expect(current).toHaveText(DOCUMENTS.next);
    await expectCurrentItemVisible(sidebar);
    await expectCurrentItemCentered(sidebar);
    expect(await sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    const bottom = await sidebar.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    });
    await expect(sidebar.getByRole("button", { name: DOCUMENTS.current, exact: true })).not.toBeInViewport();
    await previous.press("Enter");
    await expect(current).toHaveText(DOCUMENTS.current);
    await expectCurrentItemVisible(sidebar);
    await expectCurrentItemCentered(sidebar);
    expect(await sidebar.evaluate((element) => element.scrollTop)).toBeLessThan(bottom);

    await sidebar.getByRole("button", { name: "Allow menu on navigation", exact: true }).click();
    await sidebar.evaluate((element) => { element.scrollTop = 0; });
    await next.press("Enter");
    await expect(current).toHaveText(DOCUMENTS.next);
    await expect(current).not.toBeInViewport();
    expect(await sidebar.evaluate((element) => element.scrollTop)).toBe(0);
  });
}

for (const width of MOBILE_WIDTHS) {
  test(`mobile navigation centers the current document after Next and Previous at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto(`/?menu=en&id=${DOCUMENTS.routeId}&theme=github-dark&modetheme=dark`, { waitUntil: "domcontentloaded" });
    const menu = page.getByRole("banner").getByRole("button", { name: "Menu", exact: true });
    const drawer = page.getByRole("complementary").filter({
      has: page.getByRole("button", { name: "Close", exact: true }), visible: true,
    });
    await menu.click();
    await expect(drawer.locator('[aria-current="page"]')).toHaveText(DOCUMENTS.current);
    await expectCurrentItemCentered(drawer);
    await drawer.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("main").getByRole("button", { name: "Next", exact: true }).press("Enter");
    await menu.click();
    await expect(drawer.locator('[aria-current="page"]')).toHaveText(DOCUMENTS.next);
    await expectCurrentItemCentered(drawer);
    await page.setViewportSize({ width: width === 768 ? 344 : 768, height: 360 });
    await expectCurrentItemCentered(drawer);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
    await drawer.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("main").getByRole("button", { name: "Previous", exact: true }).press("Enter");
    await menu.click();
    await expect(drawer.locator('[aria-current="page"]')).toHaveText(DOCUMENTS.current);
    await expectCurrentItemCentered(drawer);
  });
}
