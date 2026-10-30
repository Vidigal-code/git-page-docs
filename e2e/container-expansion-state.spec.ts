import { expect, test, type Locator, type Page } from "@playwright/test";

const DEMO_URL = "/v/0.0.17/?lang=en&menu=en&id=50";
const GEOMETRY_TOLERANCE = 2;

async function openExample(page: Page): Promise<Locator> {
  await page.goto(DEMO_URL, { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Lesson 1: try the controls", exact: true })).toBeVisible();
  return main;
}

async function expectExpandedViewport(page: Page, dialog: Locator): Promise<void> {
  await expect.poll(() => dialog.evaluate((element) => document.fullscreenElement === element)).toBe(true);
  await expect(dialog).toBeInViewport();
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeInViewport();
  await expect.poll(() => dialog.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return Math.max(Math.abs(bounds.x), Math.abs(bounds.y), Math.abs(bounds.width - innerWidth), Math.abs(bounds.height - innerHeight));
  })).toBeLessThanOrEqual(GEOMETRY_TOLERANCE);
  expect(await page.locator("html").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE);
}

test("expanded HTML keeps its selected file and embedded form state", async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 882 });
  const main = await openExample(page);
  await main.getByRole("navigation", { name: "Pages", exact: true }).nth(1).getByRole("button", { name: "Next page", exact: true }).click();
  const frame = main.frameLocator('iframe[title="HTML content"]');
  await expect(frame.getByRole("heading", { name: "Second HTML file", exact: true })).toBeVisible();
  await frame.locator("body").evaluate((body) => {
    const label = document.createElement("label");
    label.textContent = "Lesson answer";
    label.append(document.createElement("input"));
    body.append(label);
  });
  await frame.getByRole("textbox", { name: "Lesson answer" }).fill("Resposta ação 42");
  const expand = main.getByRole("button", { name: "Show menu", exact: true }).nth(1);
  await expand.click();
  const dialog = page.getByRole("region", { name: "Close", exact: true });
  await expectExpandedViewport(page, dialog);
  await expect(page.locator('iframe[title="HTML content"]')).toHaveCount(1);
  await expect(dialog.frameLocator('iframe[title="HTML content"]').getByRole("textbox", { name: "Lesson answer" })).toHaveValue("Resposta ação 42");
  await dialog.getByRole("button", { name: "Close", exact: true }).press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(expand).toBeFocused();
  await expect(frame.getByRole("textbox", { name: "Lesson answer" })).toHaveValue("Resposta ação 42");
  await expect(main.getByRole("navigation", { name: "Pages", exact: true }).nth(1).getByRole("status")).toHaveText("Pages 2 / 2");
});

test("expanded video keeps its selected source and playback position", async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 882 });
  const main = await openExample(page);
  await main.getByRole("navigation", { name: "Pages", exact: true }).nth(2).getByRole("button", { name: "Next page", exact: true }).click();
  const video = main.getByTestId("route-video");
  await expect(video).toHaveAttribute("src", /flower\.webm$/);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
  await video.evaluate((element: HTMLVideoElement) => { element.currentTime = 1; });
  await main.getByRole("button", { name: "Show menu", exact: true }).nth(2).click();
  const dialog = page.getByRole("region", { name: "Close", exact: true });
  await expectExpandedViewport(page, dialog);
  await expect(page.getByTestId("route-video")).toHaveCount(1);
  const expanded = dialog.getByTestId("route-video");
  await expect(expanded).toHaveAttribute("src", /flower\.webm$/);
  expect(await expanded.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeCloseTo(1, 1);
  await expanded.evaluate((element: HTMLVideoElement) => { element.currentTime = 2; });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeCloseTo(2, 1);
});

test("expanded audio keeps its selected source, playback and loop state", async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 882 });
  const main = await openExample(page);
  await main.getByRole("navigation", { name: "Pages", exact: true }).nth(3).getByRole("button", { name: "Next page", exact: true }).click();
  const audio = main.locator("audio");
  await expect(audio).toHaveAttribute("src", /pagination-high\.wav$/);
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.readyState)).toBeGreaterThanOrEqual(2);
  const loop = main.getByRole("button", { name: /loop/i }).last();
  await loop.click();
  await main.getByTestId("audio-route-toggle").click();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await main.getByRole("button", { name: "Show menu", exact: true }).nth(3).click();
  const dialog = page.getByRole("region", { name: "Close", exact: true });
  await expectExpandedViewport(page, dialog);
  await expect(page.locator("main audio")).toHaveCount(1);
  const expanded = dialog.locator("audio");
  await expect(expanded).toHaveAttribute("src", /pagination-high\.wav$/);
  expect(await expanded.evaluate((element: HTMLAudioElement) => ({ paused: element.paused, loop: element.loop }))).toEqual({ paused: false, loop: true });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  expect(await audio.evaluate((element: HTMLAudioElement) => ({ paused: element.paused, loop: element.loop }))).toEqual({ paused: false, loop: true });
});
