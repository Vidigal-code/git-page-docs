import { expect, test, type Locator, type Page } from "@playwright/test";
import { LEGACY_LINKS_VERSION, LEGACY_REPOSITORY_LINKS, NAMED_REPOSITORY_LINKS } from "./fixtures/repository-links-config";

const MOBILE_VIEWPORT = { width: 320, height: 640 };
const MAX_OVERFLOW_PX = 2;
const MIN_TOUCH_TARGET_PX = 44;
const THEMES = [
  { id: "github-light", mode: "light", text: "rgb(31, 35, 40)" },
  { id: "github-dark", mode: "dark", text: "rgb(230, 237, 243)" },
] as const;

async function openRepositoryLinks(page: Page): Promise<{ dialog: Locator; trigger: Locator }> {
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
  }
  const trigger = page.getByRole("button", { name: "Repository links", exact: true }).filter({ visible: true }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Repository links", exact: true });
  await expect(dialog).toBeVisible();
  return { dialog, trigger };
}

async function expectNoHorizontalOverflow(region: Locator): Promise<void> {
  const dimensions = await region.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      left: bounds.left,
      right: bounds.right,
      viewport: document.documentElement.clientWidth,
      overflow: element.scrollWidth - element.clientWidth,
    };
  });
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.overflow).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") await page.setViewportSize(MOBILE_VIEWPORT);
});

test("shows every named destination in its category and opens the selected URL in a new tab", async ({ page, context }) => {
  const firstLink = NAMED_REPOSITORY_LINKS.branch[0];
  await context.route(firstLink.url, (route) => route.fulfill({ contentType: "text/html", body: "<title>Repository destination</title>" }));
  await page.goto("/?menu=en&id=1&lang=en&theme=github-dark&modetheme=dark");
  const { dialog, trigger } = await openRepositoryLinks(page);

  for (const [category, entries] of Object.entries(NAMED_REPOSITORY_LINKS)) {
    const label = category[0].toUpperCase() + category.slice(1);
    const region = dialog.getByRole("region", { name: label, exact: true });
    await expect(region.getByRole("link")).toHaveCount(entries.length);
    for (const entry of entries) {
      const link = region.getByRole("link", { name: entry.name, exact: true });
      await expect(link).toHaveAttribute("href", entry.url);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      await expect(link).toContainText(entry.name);
    }
  }
  const popupPromise = page.waitForEvent("popup");
  await dialog.getByRole("link", { name: firstLink.name, exact: true }).press("Enter");
  const popup = await popupPromise;
  await expect(popup).toHaveURL(firstLink.url);
  await popup.close();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("contains keyboard navigation and restores the opener after Escape and Close", async ({ page }) => {
  await page.goto("/?menu=en&id=1&lang=en");
  const { dialog, trigger } = await openRepositoryLinks(page);
  const close = dialog.getByRole("button", { name: "Close", exact: true });
  const lastLink = dialog.getByRole("link").last();
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();
  await lastLink.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link").nth(await dialog.getByRole("link").count() - 2)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.press("Enter");
  await expect(close).toBeFocused();
  await close.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const theme of THEMES) {
  test(`keeps long names, URLs and the final destination usable in ${theme.id}`, async ({ page }, testInfo) => {
    await page.goto(`/?menu=en&id=1&lang=en&theme=${theme.id}&modetheme=${theme.mode}`);
    const { dialog } = await openRepositoryLinks(page);
    await page.evaluate(() => document.fonts.ready);
    await expect(dialog).toHaveCSS("color", theme.text);
    await expect(dialog).toHaveCSS("color-scheme", theme.mode);
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    const closeBounds = await close.boundingBox();
    expect(closeBounds).not.toBeNull();
    expect(closeBounds!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    expect(closeBounds!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);

    const longName = dialog.getByRole("link", { name: NAMED_REPOSITORY_LINKS.release[0].name, exact: true });
    await longName.focus();
    await expect(longName).toBeInViewport({ ratio: 1 });
    await expectNoHorizontalOverflow(longName);
    const lastLink = dialog.getByRole("link").last();
    await lastLink.focus();
    await expect(lastLink).toBeInViewport({ ratio: 1 });
    await expect(close).toBeInViewport({ ratio: 1 });
    const afterScrollBounds = await close.boundingBox();
    expect(Math.abs(afterScrollBounds!.y - closeBounds!.y)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    await expectNoHorizontalOverflow(dialog);
    for (const link of await dialog.getByRole("link").all()) {
      await expectNoHorizontalOverflow(link);
    }
    await page.screenshot({ path: testInfo.outputPath(`repository-links-${theme.id}.png`) });
  });
}

test("keeps legacy URL strings accessible with their category labels", async ({ page }) => {
  await page.goto(`/v/${LEGACY_LINKS_VERSION}/?menu=en&id=1&lang=en`);
  const { dialog } = await openRepositoryLinks(page);
  await expect(dialog.getByRole("link")).toHaveCount(3);
  await expect(dialog.getByRole("link", { name: "Branch", exact: true })).toHaveAttribute("href", LEGACY_REPOSITORY_LINKS.branch);
  await expect(dialog.getByRole("link", { name: "Release", exact: true })).toHaveAttribute("href", LEGACY_REPOSITORY_LINKS.release);
  await expect(dialog.getByRole("link", { name: "Commit", exact: true })).toHaveAttribute("href", LEGACY_REPOSITORY_LINKS.commit);
});
