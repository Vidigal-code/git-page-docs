import { test, expect } from "@playwright/test";

/** Critical frontend flows: the docs shell renders and is responsive. */
test.describe("docs site", () => {
  test("home renders without crashing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // The app mounts a main/article region for documentation content.
    await page.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Let fonts + hydration settle so we measure the stable layout, not a
    // transient cold-compile state.
    await page.evaluate(() => (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready);
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );
    // Small tolerance for sub-pixel scrollbar/rounding differences.
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
