import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Locator } from "@playwright/test";
import { toBaseThemeCssVars } from "../frontend/src/entities/docs/lib/theme/to-css-vars";
import type { ThemeTemplate } from "../frontend/src/entities/docs/model/types";
import { MARKDOWN_ROUTE_ID } from "./fixtures/markdown-site-config";

const THEME_DIRECTORY = path.resolve("gitpagelayouts/templates");
const MINIMUM_TEXT_CONTRAST = 4.5;
const MAXIMUM_OVERFLOW_PX = 1;
const THEMES = readdirSync(THEME_DIRECTORY)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(THEME_DIRECTORY, file), "utf8")) as ThemeTemplate);

async function textContrasts(markdown: Locator): Promise<number[]> {
  return markdown.evaluate((root) => {
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
    return [...root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,li,blockquote,code,th,td,kbd,summary,sub,sup")].map((element) => {
      const text = luminance(getComputedStyle(element).color);
      const background = luminance(surface(element));
      return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
    });
  });
}

test("GFM elements stay readable in every official theme and fit the viewport", async ({ page }) => {
  await page.route("https://example.com/**", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="gray"/></svg>',
  }));
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

  for (const theme of THEMES) {
    await markdown.evaluate((element, vars) => {
      for (const [property, value] of Object.entries(vars)) (element as HTMLElement).style.setProperty(property, value);
    }, toBaseThemeCssVars(theme) as Record<string, string>);
    const contrasts = await textContrasts(markdown);
    expect(contrasts.length).toBeGreaterThan(30);
    expect(Math.min(...contrasts), `${theme.id}: Markdown text contrast`).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
    expect(await markdown.evaluate((element) => element.scrollWidth - element.clientWidth), theme.id).toBeLessThanOrEqual(MAXIMUM_OVERFLOW_PX);
    if (theme.id === "github-light" || theme.id === "vscode-dark") {
      await markdown.screenshot({ path: `test-results/markdown-${theme.id}-${test.info().project.name}.png` });
    }
  }
});
