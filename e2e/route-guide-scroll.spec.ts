import { expect, test } from "@playwright/test";

const VIEWPORT_HEIGHT = 900;
const MINIMUM_SCROLLBAR_GAP = 8;
const MAXIMUM_HORIZONTAL_OVERFLOW = 1;

for (const width of [390, 1280]) {
  test(`document guide leaves room for its scrollbar at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto("/?menu=en&id=13&theme=rose-dark&modetheme=dark", { waitUntil: "domcontentloaded" });
    const guide = page.getByRole("navigation", { name: "Table of contents", exact: true });
    await expect(guide).toBeVisible();
    const geometry = await guide.evaluate(navigation => {
      const scrollport = navigation.parentElement!;
      const rightEdge = scrollport.getBoundingClientRect().left + scrollport.clientLeft + scrollport.clientWidth;
      const linkEdges = [...navigation.querySelectorAll("a")].map(link => link.getBoundingClientRect().right);
      return {
        gap: rightEdge - Math.max(...linkEdges),
        verticalOverflow: scrollport.scrollHeight - scrollport.clientHeight,
        horizontalOverflow: scrollport.scrollWidth - scrollport.clientWidth,
      };
    });
    expect(geometry.verticalOverflow).toBeGreaterThan(0);
    expect(geometry.gap).toBeGreaterThanOrEqual(MINIMUM_SCROLLBAR_GAP);
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(MAXIMUM_HORIZONTAL_OVERFLOW);

    const lastLink = guide.getByRole("link").last();
    await lastLink.focus();
    await expect(lastLink).toBeInViewport();
    const target = await lastLink.getAttribute("href");
    await lastLink.press("Enter");
    await expect(page).toHaveURL(url => url.hash === target);
    await page.screenshot({ path: test.info().outputPath(`route-guide-scroll-${width}.png`) });
  });
}
