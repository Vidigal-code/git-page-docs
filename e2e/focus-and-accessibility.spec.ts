import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function openFocus(page: Page, { isMobile }: { isMobile: boolean }): Promise<void> {
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator('button[aria-label="Focus mode"]:visible').click();
}

test("focus navigates sections and documents without closing and offers original Markdown actions", async ({ page, context, isMobile }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?menu=en&id=1");
  await expect(page.getByRole("main")).toBeVisible();
  await openFocus(page, { isMobile });
  const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
  await expect(focus).toBeVisible();
  const initialTitle = await focus.getByRole("heading").first().innerText();
  await expect(focus.getByRole("button", { name: "Previous section", exact: true })).toBeDisabled();
  await focus.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(focus.getByRole("button", { name: "Previous section", exact: true })).toBeEnabled();
  await focus.getByRole("button", { name: "Next document", exact: true }).click();
  await expect(page).toHaveURL(/id=2/);
  await expect(focus).toBeVisible();
  await expect(focus.getByRole("heading").first()).not.toHaveText(initialTitle);
  await expect(focus.getByRole("button", { name: "Previous section", exact: true })).toBeDisabled();
  await focus.getByRole("button", { name: "Previous document", exact: true }).click();
  await expect(page).toHaveURL(/id=1/);
  await expect(focus).toBeVisible();
  await expect(focus.getByRole("heading").first()).toHaveText(initialTitle);
  await focus.getByRole("button", { name: "Copy markdown", exact: true }).click();
  await expect(focus.getByRole("button", { name: "Copied!", exact: true })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain(`# ${initialTitle}`);
  const downloadPromise = page.waitForEvent("download");
  await focus.getByRole("button", { name: "Download .md", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.md$/);
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const downloaded = await readFile(downloadPath!, "utf8");
  expect(downloaded.replaceAll("\r\n", "\n")).toBe(copied.replaceAll("\r\n", "\n"));
  const overflow = await focus.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await focus.screenshot({ path: `test-results/focus-${test.info().project.name}.png` });
  await page.keyboard.press("Escape");
  await expect(focus).toBeHidden();
});

test("reading preferences carry into focus and Ctrl+K keeps opening navigation", async ({ page, isMobile }) => {
  await page.goto("/?menu=en&id=1");
  await expect(page.getByRole("main")).toBeVisible();
  const panel = page.getByRole("main").locator("details").filter({ has: page.locator("summary", { hasText: "Accessibility and reading" }) });
  await panel.locator("summary").click();
  const speed = panel.getByRole("slider", { name: /Speed/ });
  await expect(speed).toBeVisible();
  await speed.fill("1.5");
  await openFocus(page, { isMobile });
  const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
  await focus.locator("summary", { hasText: "Accessibility and reading" }).click();
  await expect(focus.getByRole("slider", { name: /Speed/ })).toHaveValue("1.5");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  await expect(page.getByPlaceholder("Type to navigate...")).toBeVisible();
});
