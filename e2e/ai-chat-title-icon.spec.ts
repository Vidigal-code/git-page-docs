import { expect, test } from "@playwright/test";

const THEMES = [
  { id: "github-dark", mode: "dark", text: "rgb(230, 237, 243)" },
  { id: "github-light", mode: "light", text: "rgb(31, 35, 40)" },
];

for (const theme of THEMES) {
  test(`chat title uses a bare theme-colored icon in ${theme.id}`, async ({ page }, testInfo) => {
    await page.goto(`/?lang=en&menu=en&id=1&theme=${theme.id}&modetheme=${theme.mode}`, { waitUntil: "domcontentloaded" });
    if ((page.viewportSize()?.width ?? 1280) < 1024) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
    } else {
      await page.locator('[data-testid="sidebar-expand"]:visible').click();
    }
    await page.locator('[data-testid="ai-chat-open"]:visible').click();
    const title = page.getByRole("heading", { name: "AI Assistant", exact: true });
    await expect(title).toBeVisible();
    const titleIcon = title.locator("..").locator(":scope > div");
    const icon = titleIcon.locator("svg");
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(titleIcon).toHaveCSS("background-image", "none");
    await expect(titleIcon).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(titleIcon).toHaveCSS("box-shadow", "none");
    await expect(titleIcon).toHaveCSS("border-top-width", "0px");
    await expect(icon).toHaveCSS("color", theme.text);
    await expect(icon).toHaveCSS("width", "22px");
    await expect(page.getByTestId("drawer-password-input")).toBeVisible();
    await expect(page.getByTestId("ai-chat-info")).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath("chat-title-icon.png") });
  });
}
