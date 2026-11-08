import { expect, test, type Locator } from "@playwright/test";

const MOBILE_WIDTHS = [280, 320, 344, 390, 768];
const VIEWPORT_HEIGHT = 882;
const ALIGNMENT_TOLERANCE_PX = 1;
const DESKTOP_CONTROL_SIZE_PX = 44;
const SELECTOR_NAMES = ["Theme selector", "Language selector"];

async function expectCenteredIcon(button: Locator): Promise<void> {
  await expect(button.locator("svg")).toBeVisible();
  const bounds = await button.boundingBox();
  const icon = await button.locator("svg").boundingBox();
  expect(bounds).not.toBeNull();
  expect(icon).not.toBeNull();
  expect(Math.abs(icon!.x + icon!.width / 2 - bounds!.x - bounds!.width / 2)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
  expect(Math.abs(icon!.y + icon!.height / 2 - bounds!.y - bounds!.height / 2)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
}

for (const width of MOBILE_WIDTHS) {
  test(`mobile menu controls fill their rows with centered icons at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto("/source-viewer/?theme=github-dark&modetheme=dark");
    const header = page.getByRole("banner");
    await header.getByRole("button", { name: "Open menu", exact: true }).click();
    const drawer = header.getByRole("complementary");
    const mode = drawer.getByRole("button", { name: /Light mode|Dark mode/ });
    const modeBounds = await mode.boundingBox();
    expect(modeBounds).not.toBeNull();
    expect(modeBounds!.width).toBeGreaterThan(Math.min(width, 320) / 2);
    await expectCenteredIcon(mode);

    for (const name of SELECTOR_NAMES) {
      const selector = drawer.getByRole("button", { name, exact: true });
      await expect.poll(async () => (await selector.boundingBox())?.width).toBeCloseTo(modeBounds!.width, 0);
      const bounds = await selector.boundingBox();
      expect(Math.abs(bounds!.x - modeBounds!.x)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
      await expectCenteredIcon(selector);
      await selector.click();
      const choices = page.getByRole(width <= 640 ? "dialog" : "list", { name, exact: true });
      await expect(choices).toBeVisible();
      await choices.getByRole("button").first().focus();
      await page.keyboard.press("Escape");
      await expect(choices).toHaveCount(0);
      await expect(selector).toBeFocused();
    }

    const overflow = await drawer.evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
    await drawer.screenshot({ path: `test-results/search-menu-${width}-${test.info().project.name}.png` });
  });
}

test("desktop header keeps compact selectors with centered icons", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
  await page.goto("/source-viewer/?theme=github-dark&modetheme=dark");
  const header = page.getByRole("banner");
  await expect(header.getByRole("button", { name: "Open menu", exact: true })).toBeHidden();
  for (const name of SELECTOR_NAMES) {
    const selector = header.getByRole("button", { name, exact: true });
    await expect(selector).toHaveCSS("width", `${DESKTOP_CONTROL_SIZE_PX}px`);
    await expectCenteredIcon(selector);
  }
});
