import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import type { ThemeTemplate } from "../frontend/src/entities/docs/model/types";
import { MARKDOWN_ROUTE_ID } from "./fixtures/markdown-site-config";
import { MARKDOWN_JSON_CODE } from "./fixtures/markdown-gfm";
import { expectContinuousSurface, expectHighlightedCode, expectReadableMarkdown } from "./helpers/markdown-assertions";

const THEME_DIRECTORY = path.resolve("gitpagelayouts/templates");
const THEMES_PER_BATCH = 31;
const THEME_BATCH_TIMEOUT_MS = 180_000;
const THEMES = readdirSync(THEME_DIRECTORY)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(THEME_DIRECTORY, file), "utf8")) as ThemeTemplate);
const SCREENSHOT_THEMES = new Set(["comet-trail-dark", "duet-dark", "matrix-cyan-dark", "mono-dark", "github-light", "vscode-dark"]);

async function selectTheme(page: Page, theme: ThemeTemplate): Promise<void> {
  const width = page.viewportSize()?.width ?? 1280;
  if (width < 1024) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("button", { name: "Theme selector", exact: true }).filter({ visible: true }).first().click();
  const choices = page.getByRole(width <= 640 ? "dialog" : "list", { name: "Theme selector", exact: true });
  await choices.getByRole("button", { name: theme.name, exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("theme")).toBe(theme.id);
  if (width < 1024) await page.getByRole("complementary").filter({ visible: true }).getByRole("button", { name: "Close", exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("https://example.com/**", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="gray"/></svg>',
  }));
});

for (let offset = 0; offset < THEMES.length; offset += THEMES_PER_BATCH) {
  const themes = THEMES.slice(offset, offset + THEMES_PER_BATCH);
  test(`GFM and syntax colors stay readable when switching official themes ${offset + 1}-${offset + themes.length}`, async ({ page }) => {
    test.setTimeout(THEME_BATCH_TIMEOUT_MS);
    await page.goto(`/?menu=en&id=${MARKDOWN_ROUTE_ID}&theme=github-dark&modetheme=dark`);
    const heading = page.getByRole("heading", { name: "Markdown rendering", exact: true });
    await expect(heading).toBeVisible();
    const markdown = heading.locator("..");
    await expect(markdown.getByRole("table")).toBeVisible();
    await expect(markdown.getByRole("checkbox")).toHaveCount(2);
    await expect(markdown.getByText("Author-styled text remains readable.")).toBeVisible();
    await expect(markdown.locator("ol")).toHaveAttribute("start", "3");
    await expect(markdown.locator("th").nth(1)).toHaveCSS("text-align", /^(?:-webkit-)?center$/);
    await expect(markdown.locator("th").nth(2)).toHaveCSS("text-align", /^(?:-webkit-)?right$/);

    for (const theme of themes) {
      await test.step(theme.id, async () => {
        await selectTheme(page, theme);
        const code = markdown.locator("pre code.language-json");
        await expectHighlightedCode(code);
        expect(await code.textContent()).toBe(`${MARKDOWN_JSON_CODE}\n`);
        await expectContinuousSurface(markdown);
        await expectReadableMarkdown(markdown);
        if (SCREENSHOT_THEMES.has(theme.id)) {
          await markdown.screenshot({ path: `test-results/markdown-${theme.id}-${test.info().project.name}.png` });
        }
      });
    }
  });
}

test("Markdown keeps its surface and code alignment in focus and fullscreen", async ({ page, isMobile }) => {
  await page.goto(`/?menu=en&id=${MARKDOWN_ROUTE_ID}&theme=duet-dark&modetheme=dark`);
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator('button[aria-label="Focus mode"]:visible').click();
  const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
  const focusMarkdown = focus.getByRole("heading", { name: "Markdown rendering", exact: true }).locator("..");
  const focusCode = focusMarkdown.locator("pre code.language-json");
  await expectHighlightedCode(focusCode);
  await expect(focusCode).toHaveCSS("text-align", /^(?:start|left)$/);
  await expectContinuousSurface(focusMarkdown);
  await expectReadableMarkdown(focusMarkdown);
  await page.keyboard.press("Escape");
  const article = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Markdown rendering", exact: true }) });
  await article.locator("..").getByRole("button", { name: "Show menu", exact: true }).click();
  const fullscreen = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: "Markdown rendering", exact: true }) });
  const fullMarkdown = fullscreen.getByRole("heading", { name: "Markdown rendering", exact: true }).locator("..");
  await expectHighlightedCode(fullMarkdown.locator("pre code.language-json"));
  await expectContinuousSurface(fullMarkdown);
  await expectReadableMarkdown(fullMarkdown);
});
