import { test, expect, type FrameLocator, type Locator, type Page } from "@playwright/test";

/**
 * `site.mediaExclusivePlayback` (default true): a route video and the header
 * "radio" never sound together. The Introduction to Git page shows a YouTube
 * route video above its markdown; the radio plays through a YouTube embed, so
 * "radio playing" is observable as its mounted iframe and the video state as
 * the YouTube player's `playing-mode` / `paused-mode` class. Needs network
 * access to youtube.com.
 */
const VIDEO_PAGE_ID = 5;
const YOUTUBE_TIMEOUT_MS = 30_000;

const backgroundMedia = 'iframe[title="Background audio"]';
const routeVideo = '[data-testid="route-video"]';

async function startBackgroundRadio(page: Page): Promise<void> {
  await page.locator('[data-testid="audio-player-toggle"]:visible').first().click();
  const option = page.getByTestId("audio-track-option").first();
  if (await option.isVisible()) await option.click();
}

function youtubePlayer(page: Page): Locator {
  const frame: FrameLocator = page.frameLocator(routeVideo);
  return frame.locator(".html5-video-player");
}

// Embedded players start from script calls, which headless Chromium blocks without this policy.
test.use({ launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] } });

test.describe("media playback", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("playing the video pauses the radio, and playing the radio pauses the video", async ({ page }) => {
    await page.goto(`/?menu=en&id=${VIDEO_PAGE_ID}`);
    // The origin arrives after hydration; then the IFrame API attaches and renames the iframe.
    await expect(page.locator(routeVideo)).toHaveAttribute("src", /enablejsapi=1&origin=/);
    await expect(page.locator(routeVideo)).not.toHaveAttribute("title", "Video embed", { timeout: YOUTUBE_TIMEOUT_MS });
    await expect(youtubePlayer(page)).toBeVisible({ timeout: YOUTUBE_TIMEOUT_MS });

    await startBackgroundRadio(page);
    await expect(page.locator(backgroundMedia)).toHaveCount(1);

    await page.locator(routeVideo).click();
    await expect(youtubePlayer(page)).toHaveClass(/playing-mode/, { timeout: YOUTUBE_TIMEOUT_MS });
    await expect(page.locator(backgroundMedia)).toHaveCount(0);

    await startBackgroundRadio(page);
    await expect(page.locator(backgroundMedia)).toHaveCount(1);
    await expect(youtubePlayer(page)).toHaveClass(/paused-mode/, { timeout: YOUTUBE_TIMEOUT_MS });
  });
});
