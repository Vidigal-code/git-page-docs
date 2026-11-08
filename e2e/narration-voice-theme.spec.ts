import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const MOBILE_WIDTH = 320;
const THEME_DIRECTORY = path.resolve("gitpagelayouts/templates");
const NARROW_VIEWPORTS = [280, 320, 344, 390, 768];
const MINIMUM_VISIBLE_TRACK_FRACTION = 0.75;
const MINIMUM_VISIBLE_THUMB_PIXELS = 24;
const MINIMUM_TOUCH_HEIGHT = 44;

interface ThemePalette {
  id: string;
  colors: {
    background: string;
    primary: string;
    text: string;
    textSecondary: string;
    cardBackground: string;
    cardBorder: string;
  };
}

const THEME_PALETTES = readdirSync(THEME_DIRECTORY)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(THEME_DIRECTORY, file), "utf8")) as ThemePalette);
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

async function renderedRangeContrast(slider: Locator): Promise<{ trackFraction: number; thumbPixels: number }> {
  const screenshot = await slider.screenshot({ scale: "css" });
  const background = await slider.evaluate((element) => getComputedStyle(element.parentElement!).backgroundColor);
  return slider.page().evaluate(async ({ data, background }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const surface = background.match(/\d+/g)!.slice(0, 3).map(Number);
    const luminance = (rgb: number[]) => {
      const linear = rgb.map((value) => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const MINIMUM_CONTRAST = 3;
    const CONTRAST_FLARE = 0.05;
    const TRACK_HALF_HEIGHT = 4;
    const surfaceLuminance = luminance(surface);
    let trackPixels = 0;
    let thumbPixels = 0;
    const middle = Math.floor(canvas.height / 2);
    const edgeInset = 4;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = edgeInset; x < canvas.width - edgeInset; x++) {
        const offset = (y * canvas.width + x) * 4;
        const value = luminance([pixels[offset], pixels[offset + 1], pixels[offset + 2]]);
        const ratio = (Math.max(value, surfaceLuminance) + CONTRAST_FLARE) / (Math.min(value, surfaceLuminance) + CONTRAST_FLARE);
        if (ratio < MINIMUM_CONTRAST) continue;
        if (y === middle) trackPixels++;
        if (Math.abs(y - middle) > TRACK_HALF_HEIGHT) thumbPixels++;
      }
    }
    return { trackFraction: trackPixels / (canvas.width - edgeInset * 2), thumbPixels };
  }, { data: screenshot.toString("base64"), background });
}


test("range track and thumb remain discernible throughout every shipped theme palette", async ({ page }) => {
  test.setTimeout(120_000);
  const { panel } = await openVoicePanel(page, "mint-light");
  for (const theme of THEME_PALETTES) {
    await panel.evaluate((element, colors) => {
      const tokens = {
        "--background": colors.background,
        "--primary": colors.primary,
        "--text": colors.text,
        "--text-secondary": colors.textSecondary,
        "--card-background": colors.cardBackground,
        "--card-border": colors.cardBorder,
      };
      for (const [token, value] of Object.entries(tokens)) element.style.setProperty(token, value);
    }, theme.colors);
    for (const name of [/Speed/, /Volume/]) {
      const slider = panel.getByRole("slider", { name });
      const visible = await renderedRangeContrast(slider);
      expect(visible.trackFraction, `${theme.id}: track contrast below 3:1`).toBeGreaterThan(MINIMUM_VISIBLE_TRACK_FRACTION);
      expect(visible.thumbPixels, `${theme.id}: thumb is not distinct from the track`).toBeGreaterThanOrEqual(MINIMUM_VISIBLE_THUMB_PIXELS);
      expect((await slider.boundingBox())!.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_HEIGHT);
    }
  }
});

test("ranges preserve keyboard, touch, focus and disabled behavior at narrow widths", async ({ page, isMobile }, testInfo) => {
  const { panel } = await openVoicePanel(page, "mint-light");
  const speed = panel.getByRole("slider", { name: /Speed/ });
  const volume = panel.getByRole("slider", { name: /Volume/ });
  for (const width of NARROW_VIEWPORTS) {
    await page.setViewportSize({ width, height: 900 });
    for (const slider of [speed, volume]) {
      const bounds = await slider.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_HEIGHT);
    }
    expect(await panel.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
    await speed.focus();
    await page.keyboard.press("Home");
    await expect(speed).toHaveValue("0.5");
    await page.keyboard.press("ArrowRight");
    await expect(speed).toHaveValue("0.75");
    await expect(speed).toBeFocused();
    await expect(speed).toHaveCSS("outline-style", "solid");
    const focusColors = await speed.evaluate((element) => ({ outline: getComputedStyle(element).outlineColor, text: getComputedStyle(element.parentElement!).color }));
    expect(focusColors.outline).toBe(focusColors.text);
    await volume.focus();
    await page.keyboard.press("End");
    await expect(volume).toHaveValue("1");
    await page.keyboard.press("ArrowLeft");
    await expect(volume).toHaveValue("0.9");
    const bounds = (await speed.boundingBox())!;
    const point = { x: bounds.x + bounds.width * 0.8, y: bounds.y + bounds.height / 2 };
    if (isMobile) await page.touchscreen.tap(point.x, point.y);
    else await page.mouse.click(point.x, point.y);
    await expect.poll(() => speed.inputValue()).not.toBe("0.75");
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await panel.screenshot({ path: testInfo.outputPath("narration-ranges-light.png") });
  await panel.getByRole("button", { name: "Read document", exact: true }).click();
  await expect(speed).toBeDisabled();
  await expect(volume).toBeDisabled();
  await panel.getByRole("button", { name: "Stop reading", exact: true }).click();
  await expect(speed).toBeEnabled();
  await expect(volume).toBeEnabled();
});

test("ranges preserve native system controls and keyboard in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const { panel } = await openVoicePanel(page, "matrix-paper-light");
  for (const slider of await panel.getByRole("slider").all()) {
    await expect(slider).toHaveCSS("appearance", "auto");
    await slider.focus();
    await page.keyboard.press("Home");
    const minimum = await slider.getAttribute("min");
    await expect(slider).toHaveValue(minimum!);
    await page.keyboard.press("End");
    const maximum = await slider.getAttribute("max");
    await expect(slider).toHaveValue(maximum!);
  }
});
