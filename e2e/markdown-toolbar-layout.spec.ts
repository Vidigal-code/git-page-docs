import { expect, test, type Locator, type Page } from "@playwright/test";
import { MARKDOWN_ROUTE_ID } from "./fixtures/markdown-site-config";

const VIEWPORT_HEIGHT = 1000;
const MAX_OVERFLOW_PX = 1;
const SOURCE_ACTIONS = ["Copy markdown", "Download .md"];
const DOCUMENT_ACTIONS = [...SOURCE_ACTIONS, "Show menu"];
const DOCUMENTS = [
  { id: 43, title: "Configure the document guide", guideCount: 1 },
  { id: MARKDOWN_ROUTE_ID, title: "Markdown rendering", guideCount: 0 },
];

async function expectActionsAboveContent(container: Locator, heading: Locator, names: readonly string[]): Promise<void> {
  await expect(heading).toBeVisible();
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).not.toBeNull();
  for (const name of names) {
    const button = container.getByRole("button", { name, exact: true });
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y + bounds!.height, `${name} overlaps the first heading`).toBeLessThanOrEqual(headingBounds!.y);
  }
}

async function expectNoOverflow(container: Locator): Promise<void> {
  expect(await container.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
}

async function openFocus(page: Page): Promise<Locator> {
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.locator('button[aria-label="Focus mode"]:visible').click();
  return page.getByRole("dialog", { name: "Focus mode", exact: true });
}

test.beforeEach(async ({ page }) => {
  await page.route("https://example.com/**", route => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="gray"/></svg>',
  }));
});

for (const width of [280, 320, 344, 390, 768, 1280]) {
  test(`Markdown actions reserve space in document, fullscreen and focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    for (const document of DOCUMENTS) {
      await test.step(document.title, async () => {
        await page.goto(`/?menu=en&id=${document.id}&theme=aurora-dark&modetheme=dark`, { waitUntil: "domcontentloaded" });
        const main = page.getByRole("main");
        const heading = main.getByRole("article").getByRole("heading", { name: document.title, exact: true });
        await expectActionsAboveContent(main, heading, DOCUMENT_ACTIONS);
        await expect(main.getByRole("navigation", { name: "Table of contents", exact: true })).toHaveCount(document.guideCount);
        await expectNoOverflow(page.locator("html"));
        await heading.scrollIntoViewIfNeeded();
        await page.screenshot({ path: test.info().outputPath(`document-${document.id}.png`) });

        await main.getByRole("button", { name: "Show menu", exact: true }).click();
        const fullscreen = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: document.title, exact: true }) });
        await expectActionsAboveContent(fullscreen, fullscreen.getByRole("heading", { name: document.title, exact: true }), SOURCE_ACTIONS);
        await expectNoOverflow(fullscreen);
        await fullscreen.getByRole("button", { name: "Close", exact: true }).click();

        const focus = await openFocus(page);
        await expectActionsAboveContent(focus, focus.getByRole("heading", { name: document.title, exact: true }), SOURCE_ACTIONS);
        await expectNoOverflow(focus);
        await page.keyboard.press("Escape");
        await expect(focus).toBeHidden();
      });
    }
  });
}
