import { expect, test, type Locator } from "@playwright/test";

const DESKTOP_WIDTHS = [1280, 1920];
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

for (const width of DESKTOP_WIDTHS) {
  test(`unlocked desktop navigation follows the current item in both directions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto(`/?menu=en&id=${DOCUMENTS.routeId}&theme=github-dark&modetheme=dark`);
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

    const main = page.getByRole("main");
    const next = main.getByRole("button", { name: "Next", exact: true });
    const previous = main.getByRole("button", { name: "Previous", exact: true });
    await sidebar.evaluate((element) => { element.scrollTop = 0; });
    await expect(sidebar.getByRole("button", { name: DOCUMENTS.next, exact: true })).not.toBeInViewport();
    await next.press("Enter");
    await expect(current).toHaveText(DOCUMENTS.next);
    await expectCurrentItemVisible(sidebar);
    expect(await sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    const bottom = await sidebar.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    });
    await expect(sidebar.getByRole("button", { name: DOCUMENTS.current, exact: true })).not.toBeInViewport();
    await previous.press("Enter");
    await expect(current).toHaveText(DOCUMENTS.current);
    await expectCurrentItemVisible(sidebar);
    expect(await sidebar.evaluate((element) => element.scrollTop)).toBeLessThan(bottom);

    await sidebar.getByRole("button", { name: "Allow menu on navigation", exact: true }).click();
    await sidebar.evaluate((element) => { element.scrollTop = 0; });
    await next.press("Enter");
    await expect(current).toHaveText(DOCUMENTS.next);
    await expect(current).not.toBeInViewport();
    expect(await sidebar.evaluate((element) => element.scrollTop)).toBe(0);
  });
}
