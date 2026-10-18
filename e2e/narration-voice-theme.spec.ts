import { expect, test, type Locator, type Page } from "@playwright/test";

const MOBILE_WIDTH = 320;
const THEMES = [
  { id: "matrix-rain-dark", mode: "dark" },
  { id: "matrix-paper-light", mode: "light" },
];

test.beforeEach(async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: MOBILE_WIDTH, height: 900 });
});

async function installVoices(page: Page): Promise<void> {
  await page.addInitScript(() => {
    class BrowserUtterance extends EventTarget {
      constructor(readonly text: string) { super(); }
    }
    const synthesis = Object.assign(new EventTarget(), {
      getVoices: () => [
        { voiceURI: "test-en", name: "English voice", lang: "en-US", default: true, localService: true },
        { voiceURI: "test-pt", name: "Voz em português com nome longo para verificar a largura disponível", lang: "pt-BR", default: false, localService: true },
      ],
      speak(utterance: BrowserUtterance) { utterance.dispatchEvent(new Event("start")); },
      cancel: () => undefined,
    });
    Object.defineProperty(window, "speechSynthesis", { value: synthesis });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: BrowserUtterance });
  });
}

async function openVoicePanel(page: Page, theme: string): Promise<{ panel: Locator; voice: Locator }> {
  await installVoices(page);
  await page.goto(`/?lang=en&menu=en&id=13&theme=${theme}`, { waitUntil: "domcontentloaded" });
  const panel = page.getByRole("main").locator("details").filter({ has: page.locator("summary", { hasText: "Accessibility and reading" }) });
  await panel.locator("summary").click();
  const voice = panel.getByRole("combobox", { name: "Browser voice" });
  await expect(voice).toBeVisible();
  return { panel, voice };
}

for (const theme of THEMES) {
  test(`native voice picker uses the active ${theme.mode} theme surface`, async ({ page }, testInfo) => {
    const { panel, voice } = await openVoicePanel(page, theme.id);
    const expectedSurface = await panel.evaluate((element) => getComputedStyle(element).backgroundColor);
    const expectedText = await voice.evaluate((element) => getComputedStyle(element).color);
    await voice.click();
    await expect.poll(() => voice.evaluate((element) => getComputedStyle(element, "::picker(select)").backgroundColor)).toBe(expectedSurface);
    await expect.poll(() => voice.evaluate((element) => getComputedStyle(element, "::picker(select)").color)).toBe(expectedText);
    const option = voice.getByRole("option", { name: /Voz em português/ });
    await expect(option).toBeVisible();
    const bounds = await option.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.screenshot({ path: testInfo.outputPath(`voice-picker-${theme.mode}.png`) });
  });
}

test("voice selection keeps native keyboard, focus and disabled behavior", async ({ page }) => {
  const { panel, voice } = await openVoicePanel(page, "matrix-rain-dark");
  await voice.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(voice).toHaveValue("test-en");
  await expect(voice).toBeFocused();
  await voice.click();
  await page.keyboard.press("Escape");
  await expect(voice).toBeFocused();
  await expect.poll(() => voice.evaluate((element) => element.matches(":open"))).toBe(false);
  await panel.getByRole("button", { name: "Read document", exact: true }).click();
  await expect(voice).toBeDisabled();
  await panel.getByRole("button", { name: "Stop reading", exact: true }).click();
  await expect(voice).toBeEnabled();
});

test("voice picker preserves the system control in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const { voice } = await openVoicePanel(page, "matrix-paper-light");
  await expect(voice).toHaveCSS("appearance", "auto");
  await voice.selectOption("test-pt");
  await expect(voice).toHaveValue("test-pt");
});
