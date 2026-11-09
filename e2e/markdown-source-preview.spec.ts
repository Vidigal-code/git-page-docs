import { expect, test, type Locator, type Page } from "@playwright/test";
import { MARKDOWN_GFM_FIXTURE, MARKDOWN_JSON_CODE } from "./fixtures/markdown-gfm";
import { expectHighlightedCode, expectReadableMarkdown } from "./helpers/markdown-assertions";

const TREE_URL = "https://api.github.com/repos/Vidigal-code/git-page-docs/git/trees/main?recursive=1";
const FILE_URL = "https://raw.githubusercontent.com/Vidigal-code/git-page-docs/main/README.md";

async function expectSourcePreview(markdown: Locator): Promise<void> {
  const code = markdown.locator("pre code.language-json");
  await expectHighlightedCode(code);
  expect(await code.textContent()).toBe(`${MARKDOWN_JSON_CODE}\n`);
  await expectReadableMarkdown(markdown);
}

async function selectLightTheme(page: Page): Promise<void> {
  const header = page.getByRole("banner");
  const openMenu = header.getByRole("button", { name: "Open menu", exact: true });
  const hasMobileMenu = await openMenu.isVisible();
  if (hasMobileMenu) await openMenu.click();
  await header.getByRole("button", { name: "Theme selector", exact: true }).filter({ visible: true }).click();
  const width = page.viewportSize()?.width ?? 1280;
  const choices = page.getByRole(width <= 640 ? "dialog" : "list", { name: "Theme selector", exact: true });
  await choices.getByRole("button", { name: "GitHub Light", exact: true }).click();
  await expect(page).toHaveURL((url) => url.searchParams.get("theme") === "github-light" && url.searchParams.get("modetheme") === "light");
  if (hasMobileMenu) await header.getByRole("complementary").getByRole("button", { name: "Close menu", exact: true }).click();
}

test("source Markdown preview keeps JSON highlighted and readable when changing themes", async ({ page }) => {
  await page.route(TREE_URL, (route) => route.fulfill({
    json: { tree: [{ path: "README.md", type: "blob", size: Buffer.byteLength(MARKDOWN_GFM_FIXTURE) }] },
  }));
  await page.route(FILE_URL, (route) => route.fulfill({ contentType: "text/plain; charset=utf-8", body: MARKDOWN_GFM_FIXTURE }));
  await page.route("https://example.com/image.png", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="gray"/></svg>',
  }));
  await page.goto("/source-viewer/?theme=vscode-dark&modetheme=dark");
  const main = page.getByRole("main");
  const heading = main.getByRole("heading", { name: "Markdown rendering", exact: true });
  await expect(heading).toBeVisible();
  await main.getByRole("button", { name: "Code", exact: true }).click();
  await expect(heading).toHaveCount(0);
  await main.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(heading).toBeVisible();
  const markdown = heading.locator("..");
  await expectSourcePreview(markdown);
  const darkBackground = await markdown.evaluate((element) => getComputedStyle(element).backgroundColor);
  await markdown.screenshot({ path: `test-results/markdown-source-vscode-dark-${test.info().project.name}.png` });

  await selectLightTheme(page);
  await expect(markdown).not.toHaveCSS("background-color", darkBackground);
  await expectSourcePreview(markdown);
  await markdown.screenshot({ path: `test-results/markdown-source-github-light-${test.info().project.name}.png` });
});

const SOURCE_FILE_NAME = "repository-navigation-with-a-long-file-name.ts";
const SOURCE_PATH = `src/nested/${SOURCE_FILE_NAME}`;
const SOURCE_CODE = `export const repositoryPath = "${"long-path/".repeat(24)}";\n`;

async function mockRepositoryNavigation(page: Page): Promise<void> {
  await page.route(TREE_URL, (route) => route.fulfill({
    json: { tree: [
      { path: "README.md", type: "blob", size: 28 },
      { path: "src", type: "tree" },
      { path: "src/nested", type: "tree" },
      { path: SOURCE_PATH, type: "blob", size: Buffer.byteLength(SOURCE_CODE) },
    ] },
  }));
  await page.route(FILE_URL, (route) => route.fulfill({ body: "# Repository navigation\n" }));
  await page.route(`https://raw.githubusercontent.com/Vidigal-code/git-page-docs/main/${SOURCE_PATH}`,
    (route) => route.fulfill({ body: SOURCE_CODE }));
}

for (const mode of ["dark", "light"]) {
  test(`repository folders and code fit desktop and narrow screens in ${mode} mode`, async ({ page }) => {
    await mockRepositoryNavigation(page);
    for (const width of [1280, 344, 280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/source-viewer/?theme=github-${mode}&modetheme=${mode}`);
      const directory = page.getByRole("table", { name: "Files", exact: true });
      await expect(directory).toBeVisible();
      await expect(page.getByRole("heading", { name: "Repository navigation", exact: true })).toBeVisible();
      await directory.getByRole("button", { name: "src", exact: true }).click();
      await directory.getByRole("button", { name: "nested", exact: true }).click();
      await directory.getByRole("button", { name: SOURCE_FILE_NAME, exact: true }).click();
      await expect(directory).toHaveCount(0);
      const breadcrumb = page.getByRole("navigation", { name: "Repository path", exact: true });
      await expect(breadcrumb).toContainText(SOURCE_FILE_NAME);
      await expect(page.getByRole("main").getByRole("cell").filter({ hasText: "export const repositoryPath" })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: test.info().outputPath(`source-viewer-${mode}-${width}.png`), fullPage: true });
      await breadcrumb.getByRole("button", { name: "nested", exact: true }).click();
      await expect(directory).toBeVisible();
      await directory.getByRole("button", { name: "Parent directory", exact: true }).click();
      await expect(directory.getByRole("button", { name: "nested", exact: true })).toBeVisible();
    }
  });
}
