import { expect, type Locator } from "@playwright/test";

const MINIMUM_TEXT_CONTRAST = 4.5;
const MAXIMUM_OVERFLOW_PX = 1;

export async function expectHighlightedCode(code: Locator): Promise<void> {
  await expect.poll(() => code.evaluate((element) => new Set(
    [...element.querySelectorAll("span")]
      .filter((span) => span.textContent?.trim())
      .map((span) => getComputedStyle(span).color),
  ).size)).toBeGreaterThan(1);
}

export async function expectContinuousSurface(markdown: Locator): Promise<void> {
  const surface = await markdown.evaluate((element) => ({
    content: getComputedStyle(element).backgroundColor,
    frame: getComputedStyle(element.parentElement!).backgroundColor,
    frameImage: getComputedStyle(element.parentElement!).backgroundImage,
  }));
  expect(surface.frameImage).toBe("none");
  expect(surface.frame).toBe(surface.content);
}

export async function expectReadableMarkdown(markdown: Locator): Promise<void> {
  const contrasts = await markdown.evaluate((root) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A canvas context is required to resolve CSS colors");
    const luminance = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((channel) => channel / 255);
      const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const surface = (element: Element): string => {
      const background = getComputedStyle(element).backgroundColor;
      if (background !== "rgba(0, 0, 0, 0)" && background !== "transparent") return background;
      if (!element.parentElement) throw new Error("Markdown must have an opaque reading surface");
      return surface(element.parentElement);
    };
    return [...root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,li,blockquote,code,th,td,kbd,summary,sub,sup,pre code span")].map((element) => {
      const text = luminance(getComputedStyle(element).color);
      const background = luminance(surface(element));
      return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
    });
  });
  expect(contrasts.length).toBeGreaterThan(0);
  expect(Math.min(...contrasts), "Markdown text and syntax token contrast").toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
  expect(await markdown.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(MAXIMUM_OVERFLOW_PX);
}
