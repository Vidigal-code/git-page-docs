import { expect, test, type Locator } from "@playwright/test";

const THEMES = [
  { id: "github-light", mode: "light", text: "rgb(31, 35, 40)", surface: "rgb(255, 255, 255)" },
  { id: "github-dark", mode: "dark", text: "rgb(230, 237, 243)", surface: "rgb(22, 27, 34)" },
];

async function expectInsideViewport(control: Locator): Promise<void> {
  const dimensions = await control.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right, viewport: document.documentElement.clientWidth, overflow: element.scrollWidth - element.clientWidth };
  });
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.overflow).toBeLessThanOrEqual(2);
}

for (const theme of THEMES) {
  test(`selectors inherit ${theme.id} and stay aligned across screen sizes`, async ({ page }) => {
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?menu=en&id=13&theme=${theme.id}&modetheme=${theme.mode}`);
      await page.getByRole("main").waitFor();
      await page.locator("summary").filter({ hasText: "Accessibility and reading" }).click();
      const voice = page.getByRole("combobox", { name: "Browser voice" });
      await expect(voice).toHaveCSS("color", theme.text);
      await expect(voice).toHaveCSS("color-scheme", theme.mode);
      await expectInsideViewport(voice);
      const alignment = await voice.evaluate((element) => {
        const field = element.getBoundingClientRect();
        const arrow = element.parentElement!.querySelector("svg")!.getBoundingClientRect();
        return { height: field.height, delta: Math.abs(field.y + field.height / 2 - arrow.y - arrow.height / 2) };
      });
      expect(alignment.height).toBeGreaterThanOrEqual(44);
      expect(alignment.delta).toBeLessThanOrEqual(1);

      if (width < 1024) await page.getByRole("button", { name: "Menu", exact: true }).click();
      const language = page.getByRole("button", { name: "Language selector", exact: true }).filter({ visible: true }).first();
      await expect(language.locator("svg")).toHaveAttribute("role", "img");
      const trigger = page.getByRole("button", { name: "Theme selector", exact: true }).filter({ visible: true }).first();
      await trigger.click();
      const choices = width <= 640
        ? page.getByRole("dialog", { name: "Theme selector", exact: true })
        : page.getByRole("list", { name: "Theme selector", exact: true });
      await expect(choices).toBeVisible();
      await expect(choices).toHaveCSS("color", theme.text);
      await expect(width <= 640 ? choices : choices.locator("..")).toHaveCSS("background-color", theme.surface);
      await expectInsideViewport(choices);
      if (width <= 640) {
        const options = choices.getByRole("button");
        await options.last().focus();
        await page.keyboard.press("Tab");
        await expect(options.first()).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(options.last()).toBeFocused();
      }
      await page.keyboard.press("Escape");
      await expect(choices).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await page.screenshot({ path: `test-results/selectors-${theme.id}-${width}-${test.info().project.name}.png` });
    }
  });
}
