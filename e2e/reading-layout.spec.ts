import { expect, test, type Locator } from "@playwright/test";

const NARROW_WIDTHS = [320, 344, 390];

async function expectNoOverflow(region: Locator): Promise<void> {
  expect(await region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
}

for (const width of NARROW_WIDTHS) {
  test(`reading controls and navigation stay aligned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 882 });
    await page.addInitScript(() => {
      const voice: SpeechSynthesisVoice = {
        default: true,
        localService: true,
        lang: "en-US",
        name: "Browser voice with a very long localized name for narrow screens",
        voiceURI: "local-reading-voice",
      };
      Object.defineProperty(window.speechSynthesis, "getVoices", { value: () => [voice] });
    });
    await page.goto("/?menu=en&id=13&theme=github-dark&modetheme=dark");
    const main = page.getByRole("main");
    await expect(main).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const breadcrumb = main.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toBeVisible();
    const centerOffset = await breadcrumb.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const items = [...element.querySelectorAll("li")].map((item) => item.getBoundingClientRect());
      const left = Math.min(...items.map((item) => item.left));
      const right = Math.max(...items.map((item) => item.right));
      return Math.abs((left + right) / 2 - (bounds.left + bounds.right) / 2);
    });
    expect(centerOffset).toBeLessThanOrEqual(2);

    const panel = main.locator("details").filter({ has: page.locator("summary", { hasText: "Accessibility and reading" }) });
    await panel.locator("summary").click();
    const voice = panel.getByRole("combobox", { name: "Browser voice" });
    await voice.selectOption("local-reading-voice");
    const select = await voice.boundingBox();
    expect(select).not.toBeNull();
    expect(select!.height).toBeGreaterThanOrEqual(44);
    const arrow = await voice.locator("..").locator("svg").boundingBox();
    expect(arrow).not.toBeNull();
    expect(Math.abs(arrow!.y + arrow!.height / 2 - select!.y - select!.height / 2)).toBeLessThanOrEqual(1);
    await expectNoOverflow(panel);
    await expectNoOverflow(main);
    await page.screenshot({ path: `test-results/reading-${width}-${test.info().project.name}.png` });

    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const drawer = page.getByRole("complementary").filter({ has: page.getByTitle("Focus mode", { exact: true }) });
    const mode = drawer.getByRole("button", { name: /Light mode|Dark mode/i });
    await expect(mode).toBeVisible();
    const modeBounds = await mode.boundingBox();
    const focusButton = drawer.getByRole("button", { name: "Focus mode", exact: true }).and(drawer.getByTitle("Focus mode", { exact: true }));
    const focusBounds = await focusButton.boundingBox();
    expect(modeBounds).not.toBeNull();
    expect(focusBounds).not.toBeNull();
    expect(Math.abs(modeBounds!.width - focusBounds!.width)).toBeLessThanOrEqual(1);
    expect(modeBounds!.width).toBeGreaterThan(width / 2);
    const icon = await mode.locator("svg").boundingBox();
    expect(icon).not.toBeNull();
    expect(Math.abs(icon!.x + icon!.width / 2 - modeBounds!.x - modeBounds!.width / 2)).toBeLessThanOrEqual(1);
    await expectNoOverflow(drawer);
    await drawer.screenshot({ path: `test-results/drawer-${width}-${test.info().project.name}.png` });
    await focusButton.click();
    const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
    await expect(focus).toBeVisible();
    await focus.locator("summary", { hasText: "Accessibility and reading" }).click();
    await expect(focus.getByRole("combobox", { name: "Browser voice" })).toHaveValue("local-reading-voice");
    for (const target of ["document", "section"]) {
      for (const action of ["First", "Previous", "Next", "Last"]) {
        await expect(focus.getByRole("button", { name: `${action} ${target}`, exact: true })).toBeInViewport();
      }
    }
    await expectNoOverflow(focus);
    await focus.screenshot({ path: `test-results/focus-reading-${width}-${test.info().project.name}.png` });
  });
}
