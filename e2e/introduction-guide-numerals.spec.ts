import { expect, test } from "@playwright/test";

const MINIMUM_DIGIT_GAP_EM = 0.08;
const MAXIMUM_OVERFLOW_PX = 1;
const VIEWPORT_HEIGHT = 960;
const CHAPTER_COUNT = 10;

for (const width of [280, 320, 390, 768, 1280, 1920]) {
  test(`chapter numerals 01-10 have separated digits without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto("/introduction-guide?theme=vscode-dark&modetheme=dark", { waitUntil: "domcontentloaded" });
    const story = page.getByTestId("guide-story");
    const chapters = story.locator("[data-story-chapter]");
    await expect(chapters).toHaveCount(CHAPTER_COUNT);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    for (let index = 0; index < CHAPTER_COUNT; index += 1) {
      await story.evaluate((element, { current, total }) => {
        const top = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (element.offsetHeight - window.innerHeight) * (current + 0.5) / total, behavior: "instant" });
      }, { current: index, total: CHAPTER_COUNT });
      const chapter = chapters.nth(index);
      await expect(chapter).toHaveAttribute("data-active", "true");
      const numeral = chapter.locator(":scope > span[aria-hidden]");
      await expect(numeral).toHaveText(String(index + 1).padStart(2, "0"));
      const metrics = await numeral.evaluate((element) => {
        const style = getComputedStyle(element);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const node = element.firstChild;
        if (!context || !node?.textContent) throw new Error("Numeral text and font metrics are required");
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const range = document.createRange();
        const glyphs = [...node.textContent].map((digit, offset) => {
          range.setStart(node, offset);
          range.setEnd(node, offset + 1);
          const start = range.getBoundingClientRect().left;
          const ink = context.measureText(digit);
          return { left: start - ink.actualBoundingBoxLeft, right: start + ink.actualBoundingBoxRight };
        });
        const bounds = element.getBoundingClientRect();
        return {
          gap: (glyphs[1].left - glyphs[0].right - Number.parseFloat(style.webkitTextStrokeWidth)) / Number.parseFloat(style.fontSize),
          left: bounds.left,
          right: bounds.right,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(metrics.gap, `digit separation in ${index + 1}`).toBeGreaterThanOrEqual(MINIMUM_DIGIT_GAP_EM);
      expect(metrics.left).toBeGreaterThanOrEqual(-MAXIMUM_OVERFLOW_PX);
      expect(metrics.right).toBeLessThanOrEqual(width + MAXIMUM_OVERFLOW_PX);
      expect(metrics.overflow).toBeLessThanOrEqual(MAXIMUM_OVERFLOW_PX);
    }
  });
}
