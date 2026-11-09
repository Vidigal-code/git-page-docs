import { expect, test } from "@playwright/test";
import { MARKDOWN_GUIDE_ROUTE_ID } from "./fixtures/markdown-site-config";

const VIEWPORT_HEIGHT = 860;
const MAX_OVERFLOW_PX = 1;
const BREADCRUMB_SPACING = "24px";

for (const width of [280, 320, 344, 390, 768, 1280]) {
  test(`configured Markdown targets remain navigable without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.route("https://example.com/guide-image.svg", route => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><rect width="120" height="60" fill="teal"/></svg>',
    }));
    await page.goto(`/?menu=en&id=${MARKDOWN_GUIDE_ROUTE_ID}&theme=duet-dark&modetheme=dark`, { waitUntil: "domcontentloaded" });
    const guide = page.getByRole("navigation", { name: "Table of contents", exact: true });
    await expect(guide).toBeVisible();
    await expect(guide.getByRole("link", { name: "Useful detail", exact: true })).toBeVisible();
    await expect(guide.getByRole("link", { name: "Deeper heading stays in the document", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Deeper heading stays in the document", exact: true })).toHaveCount(1);
    for (const name of ["Important paragraph", "Guide table", "Guide code sample", "Guide illustration", "A target inside a collapsed disclosure.", "First repeated destination.", "Second repeated destination."]) {
      const link = guide.getByRole("link", { name, exact: true });
      const id = decodeURIComponent((await link.getAttribute("href") ?? "").slice(1));
      await link.click();
      await expect.poll(() => page.evaluate(targetId => {
        const target = document.getElementById(targetId);
        if (!target) return false;
        const rect = target.getBoundingClientRect();
        return rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
      }, id)).toBe(true);
      await expect(page).toHaveURL(url => decodeURIComponent(url.hash.slice(1)) === id);
    }
    await expect(page.locator("article details")).toHaveAttribute("open", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    const breadcrumb = page.getByRole("main").getByRole("navigation", { name: "Breadcrumb", exact: true });
    await expect(breadcrumb).toHaveCSS("margin-top", BREADCRUMB_SPACING);
    await expect(breadcrumb).toHaveCSS("margin-bottom", BREADCRUMB_SPACING);
  });
}
