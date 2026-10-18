import { expect, test, type Locator } from "@playwright/test";

const ALIGNMENT_TOLERANCE = 1;
const CONTROL_GAP = 12;
const MINIMUM_TARGET_SIZE = 44;

async function getBox(control: Locator) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("The footer control must have a visible box");
  return box;
}

test("keeps previous, next and back to top adjacent and centered by default", async ({ page, isMobile }, testInfo) => {
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
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE);
  const heights = boxes.map((box) => box.height);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TARGET_SIZE);
    expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TARGET_SIZE);
  }
  const previousToNextGap = boxes[1].x - boxes[0].x - boxes[0].width;
  const nextToTopGap = boxes[2].x - boxes[1].x - boxes[1].width;
  expect(Math.abs(previousToNextGap - CONTROL_GAP)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE);
  expect(Math.abs(nextToTopGap - CONTROL_GAP)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE);
  const mainBox = await getBox(main);
  const groupCenter = (boxes[0].x + boxes[2].x + boxes[2].width) / 2;
  expect(Math.abs(groupCenter - mainBox.x - mainBox.width / 2)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("footer-navigation-row.png") });
  await arrow.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE);
  await expect(main).toBeFocused();
});
