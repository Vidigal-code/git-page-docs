import { test, expect, type Page } from "@playwright/test";

/**
 * Audio surfaces of the docs shell: the audio route's fullscreen view sits in
 * the middle of the viewport, and the route player and the header "radio"
 * (background music) never sound at the same time. Both media are YouTube
 * embeds in the shipped docs, so "playing" is observable as a mounted iframe.
 * A desktop viewport is forced so the header radio button is visible under
 * both projects; the arbitration logic is viewport-independent.
 */
const AUDIO_ROUTE_ID = 12;
const CENTER_TOLERANCE_PX = 48;

const routeMedia = 'iframe[title="Route audio"]';
const backgroundMedia = 'iframe[title="Background audio"]';

async function startBackgroundRadio(page: Page): Promise<void> {
  await page.locator('[data-testid="audio-player-toggle"]:visible').first().click();
  await page.getByTestId("audio-track-option").first().click();
}

test.describe("audio playback", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("audio fullscreen is centered in the viewport", async ({ page }) => {
    await page.goto(`/?audiofull=en&id=${AUDIO_ROUTE_ID}`);

    const dialog = page.getByRole("dialog");
    const card = dialog.locator("article").first();
    await expect(card.getByTestId("audio-route-toggle")).toBeVisible();

    const box = await card.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    const cardCenterY = box!.y + box!.height / 2;
    expect(Math.abs(cardCenterY - viewport!.height / 2)).toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
  });

  test("route audio and background radio never play together", async ({ page }) => {
    await page.goto(`/?menu=en&id=${AUDIO_ROUTE_ID}`);
    const routeToggle = page.locator('[data-testid="audio-route-toggle"]:visible').first();
    await expect(routeToggle).toBeVisible();

    await routeToggle.click();
    await expect(page.locator(routeMedia)).toHaveCount(1);

    await startBackgroundRadio(page);
    await expect(page.locator(backgroundMedia)).toHaveCount(1);
    await expect(page.locator(routeMedia)).toHaveCount(0);

    await routeToggle.click();
    await expect(page.locator(routeMedia)).toHaveCount(1);
    await expect(page.locator(backgroundMedia)).toHaveCount(0);
  });
});
