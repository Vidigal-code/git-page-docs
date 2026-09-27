import { test, expect } from "@playwright/test";

/** Critical frontend flows: the docs shell renders and is responsive. */
test.describe("docs site", () => {
  test("home renders without crashing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // The docs shell mounts a main region for documentation content once the
    // app has hydrated; waiting for it is the readiness signal.
    await expect(page.getByRole("main")).toBeVisible();
    await page.waitForLoadState("load");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    // Fonts swap in after hydration and can widen the layout, so wait for
    // them before measuring.
    await page.evaluate(() => (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready);
    const measureOverflow = () =>
      page.evaluate(() =>
        Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      );
    // Poll until the layout has settled instead of sleeping for a fixed time:
    // a transient cold-compile state clears within the assertion timeout.
    // Small tolerance for sub-pixel scrollbar/rounding differences.
    await expect.poll(measureOverflow, { timeout: 10_000 }).toBeLessThanOrEqual(2);
  });
});
