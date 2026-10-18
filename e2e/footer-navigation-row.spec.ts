import { expect, test, type Locator } from "@playwright/test";

async function getBox(control: Locator) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("The footer control must have a visible box");
  return box;
}

test("aligns previous, next and back to top on one centered row", async ({ page, isMobile }, testInfo) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/?lang=en&menu=en&id=13&theme=github-dark", { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  const previous = main.getByRole("button", { name: "Previous", exact: true });
  const next = main.getByRole("button", { name: "Next", exact: true });
  const arrow = main.getByRole("button", { name: "Back to top", exact: true });
  await expect(arrow).toBeAttached();
  await arrow.scrollIntoViewIfNeeded();
  const boxes = await Promise.all([previous, next, arrow].map(getBox));
  const centers = boxes.map((box) => box.y + box.height / 2);
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(1);
  const heights = boxes.map((box) => box.height);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const mainBox = await getBox(main);
  const navigationCenter = (boxes[0].x + boxes[1].x + boxes[1].width) / 2;
  expect(Math.abs(navigationCenter - mainBox.x - mainBox.width / 2)).toBeLessThanOrEqual(1);
  expect(boxes[2].x).toBeGreaterThanOrEqual(boxes[1].x + boxes[1].width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("footer-navigation-row.png") });
  await arrow.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
  await expect(main).toBeFocused();
});
