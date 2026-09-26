import { test, expect, type Page } from "@playwright/test";

/**
 * The in-docs AI chat drawer: password gate + encrypted credential storage,
 * mirroring the /ai console guarantees. A desktop-width viewport is forced so
 * the sidebar's AI button is reachable under both the desktop and mobile
 * projects — the gate/vault logic is viewport-independent.
 */
test.describe("AI chat drawer", () => {
  const openButton = '[data-testid="ai-chat-open"]:visible';

  /** The desktop sidebar starts collapsed; its AI button lives in the expanded overlay. */
  async function openAiChat(page: Page): Promise<void> {
    await page.locator('[data-testid="sidebar-expand"]:visible').first().click();
    await page.locator(openButton).first().click();
  }

  test("password gate, encrypted key storage, and persistence across reload", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await openAiChat(page);

    // First run → create-password gate inside the drawer.
    await expect(page.getByTestId("ai-chat-gate")).toBeVisible();
    await page.getByTestId("drawer-password-input").fill("hunter2");
    await page.getByTestId("drawer-unlock-button").click();

    // Unlocked → the API-key form (no key yet for the default provider).
    await expect(page.getByTestId("drawer-apikey-input")).toBeVisible();
    await page.getByTestId("drawer-apikey-input").fill("sk-openai-drawer-secret");
    await page.getByTestId("drawer-save-key").click();

    // The plaintext key must never appear in the persisted vault, and the
    // legacy plaintext slot must be empty.
    const vault = await page.evaluate(() => window.localStorage.getItem("gitpagedocs:vault"));
    expect(vault).toBeTruthy();
    expect(vault).not.toContain("sk-openai-drawer-secret");
    const legacy = await page.evaluate(() => window.localStorage.getItem("gitpagedocs_ai_key"));
    expect(legacy).toBeFalsy();

    // Reload → vault persists → reopening the drawer requires the password.
    await page.reload();
    await openAiChat(page);
    await expect(page.getByTestId("drawer-password-input")).toBeVisible();

    // Wrong password is rejected.
    await page.getByTestId("drawer-password-input").fill("wrong");
    await page.getByTestId("drawer-unlock-button").click();
    await expect(page.getByText("Incorrect password.")).toBeVisible();

    // Correct password decrypts → gate disappears (saved key is found).
    await page.getByTestId("drawer-password-input").fill("hunter2");
    await page.getByTestId("drawer-unlock-button").click();
    await expect(page.getByTestId("ai-chat-gate")).toHaveCount(0);
  });
});
