import { expect, test } from "@playwright/test";

test("header repository controls have visible icons while lazy icon chunks are pending", async ({ page, isMobile }) => {
  let releaseIcons: () => void = () => {};
  const pendingIcons = new Promise<void>(resolve => { releaseIcons = resolve; });
  let blockedIconRequests = 0;
  await page.route(/\/_next\/static\/chunks\/[^?]*react-icons_\d[^?]*\.js/, async route => {
    blockedIconRequests += 1;
    await pendingIcons;
    await route.continue();
  });
  try {
    await page.goto("/?lang=en&menu=en&id=1", { waitUntil: "domcontentloaded" });
    const header = page.locator("header").first();
    if (isMobile) await header.getByRole("button", { name: "Menu", exact: true }).click();
    const controls = [
      page.getByRole("link", { name: "Project", exact: true }),
      page.getByRole("button", { name: "Repository links", exact: true }),
    ];
    await expect(controls[0]).toBeVisible();
    await expect.poll(() => blockedIconRequests).toBeGreaterThan(0);
    for (const control of controls) {
      expect(await control.evaluate(element => {
        const icon = element.querySelector("svg");
        const bounds = icon?.getBoundingClientRect();
        return !!bounds && bounds.width > 0 && bounds.height > 0;
      })).toBe(true);
      await control.focus();
      await expect(control).toBeFocused();
    }
  } finally {
    releaseIcons();
  }
});
