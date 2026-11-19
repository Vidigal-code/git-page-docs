import { expect, test } from "@playwright/test";

const VIEWPORT_HEIGHT = 900;
const MINIMUM_SCROLLBAR_GAP = 24;
const MAXIMUM_SCROLLBAR_WIDTH = 4;
const MAXIMUM_THUMB_OPACITY = 0.5;
const MAXIMUM_HORIZONTAL_OVERFLOW = 1;

for (const width of [390, 1280]) {
  test(`document guide has a spacious, subtle scrollbar at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto("/?menu=en&id=13&theme=rose-dark&modetheme=dark", { waitUntil: "domcontentloaded" });
    const guide = page.getByRole("navigation", { name: "Table of contents", exact: true });
    await expect(guide).toBeVisible();
    const geometry = await guide.evaluate(navigation => {
      const MAXIMUM_COLOR_CHANNEL = 255;
      const scrollport = navigation.parentElement!;
      const rightEdge = scrollport.getBoundingClientRect().left + scrollport.clientLeft + scrollport.clientWidth;
      const linkEdges = [...navigation.querySelectorAll("a")].map(link => link.getBoundingClientRect().right);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const getOpacity = (color: string): number => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data[3] / MAXIMUM_COLOR_CHANNEL;
      };
      return {
        gap: rightEdge - Math.max(...linkEdges),
        verticalOverflow: scrollport.scrollHeight - scrollport.clientHeight,
        horizontalOverflow: scrollport.scrollWidth - scrollport.clientWidth,
        scrollbarWidth: Number.parseFloat(getComputedStyle(scrollport, "::-webkit-scrollbar").width),
        scrollbarGutter: scrollport.offsetWidth - scrollport.clientWidth,
        thumbOpacity: getOpacity(getComputedStyle(scrollport, "::-webkit-scrollbar-thumb").backgroundColor),
        trackOpacity: getOpacity(getComputedStyle(scrollport, "::-webkit-scrollbar-track").backgroundColor),
      };
    });
    expect(geometry.verticalOverflow).toBeGreaterThan(0);
    expect(geometry.gap).toBeGreaterThanOrEqual(MINIMUM_SCROLLBAR_GAP);
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(MAXIMUM_HORIZONTAL_OVERFLOW);
    expect(geometry.scrollbarWidth).toBeGreaterThan(0);
    expect(geometry.scrollbarWidth).toBeLessThanOrEqual(MAXIMUM_SCROLLBAR_WIDTH);
    expect(geometry.scrollbarGutter).toBeLessThanOrEqual(MAXIMUM_SCROLLBAR_WIDTH);
    expect(geometry.thumbOpacity).toBeGreaterThan(0);
    expect(geometry.thumbOpacity).toBeLessThan(MAXIMUM_THUMB_OPACITY);
    expect(geometry.trackOpacity).toBe(0);

    const lastLink = guide.getByRole("link").last();
    await lastLink.focus();
    await expect(lastLink).toBeInViewport();
    const target = await lastLink.getAttribute("href");
    await lastLink.press("Enter");
    await expect(page).toHaveURL(url => url.hash === target);
    await page.screenshot({ path: test.info().outputPath(`route-guide-scroll-${width}.png`) });
  });
}
