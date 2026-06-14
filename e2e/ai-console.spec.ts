import { test, expect } from "@playwright/test";

/** The /ai console: password gate + encrypted credential persistence. */
test.describe("AI console", () => {
  test("password gate, key storage, and persistence across reload", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByTestId("ai-console")).toBeVisible();

    // First run → create-password gate.
    await expect(page.getByTestId("password-input")).toBeVisible();
    await page.getByTestId("password-input").fill("hunter2");
    await page.getByTestId("unlock-button").click();

    // Unlocked → provider/model/key form.
    await expect(page.getByTestId("provider-select")).toBeVisible();
    await page.getByTestId("provider-select").selectOption("anthropic");
    await page.getByTestId("apikey-input").fill("sk-ant-secret-key");
    await page.getByTestId("save-key").click();

    // The plaintext key must not be present in the persisted vault.
    const vault = await page.evaluate(() => window.localStorage.getItem("gitpagedocs:vault"));
    expect(vault).toBeTruthy();
    expect(vault).not.toContain("sk-ant-secret-key");

    // Reload → vault persists → gate requires the password again.
    await page.reload();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await page.getByTestId("password-input").fill("wrong");
    await page.getByTestId("unlock-button").click();
    await expect(page.getByText("Incorrect password.")).toBeVisible();

    await page.getByTestId("password-input").fill("hunter2");
    await page.getByTestId("unlock-button").click();
    await expect(page.getByTestId("provider-select")).toBeVisible();
  });

  test("no horizontal overflow on the console", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByTestId("ai-console")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
