import { expect, test, type Locator, type Page } from "@playwright/test";
import { MARKDOWN_GFM_FIXTURE, MARKDOWN_JSON_CODE } from "./fixtures/markdown-gfm";
import { expectHighlightedCode, expectReadableMarkdown } from "./helpers/markdown-assertions";

const TREE_URL = "https://api.github.com/repos/Vidigal-code/git-page-docs/git/trees/main?recursive=1";
const FILE_URL = "https://raw.githubusercontent.com/Vidigal-code/git-page-docs/main/README.md";

const UTF16_SOURCE_FILES = [
  {
    path: ".gitignore",
    body: Buffer.from("\uFEFFnode_modules/\n.env\n", "utf16le"),
    lines: ["node_modules/", ".env"],
  },
  {
    path: "src/unicode.ts",
    body: Buffer.from('\uFEFFconst mensagem = "ação, 中文 e 🚀";\n', "utf16le").swap16(),
    lines: ['const mensagem = "ação, 中文 e 🚀";'],
  },
] as const;

test("repository source files decode UTF-16 BOMs without corrupting Unicode", async ({ page }) => {
  await page.route(TREE_URL, (route) => route.fulfill({
    json: { tree: [
      { path: "src", type: "tree" },
      ...UTF16_SOURCE_FILES.map(file => ({ path: file.path, type: "blob", size: file.body.length })),
    ] },
  }));
  for (const file of UTF16_SOURCE_FILES) {
    await page.route(new URL(file.path, FILE_URL).href, (route) => route.fulfill({
      contentType: "text/plain; charset=utf-16",
      body: file.body,
    }));
  }
  await page.goto("/source-viewer/?theme=vscode-dark&modetheme=dark");
  const main = page.getByRole("main");
  const directory = main.getByRole("table", { name: "Files", exact: true });
  const breadcrumb = main.getByRole("navigation", { name: "Repository path", exact: true });
  await expect(directory).toBeVisible();

  for (const file of UTF16_SOURCE_FILES) {
    for (const segment of file.path.split("/")) {
      await directory.getByRole("button", { name: segment, exact: true }).click();
    }
    await expect(directory).toHaveCount(0);
    const code = main.getByRole("table");
    for (const line of file.lines) {
      await expect(code.getByRole("cell").filter({ hasText: line })).toHaveText(line);
    }
    const renderedCode = await code.textContent();
    expect(renderedCode).not.toContain("\u0000");
    expect(renderedCode).not.toContain("\uFFFD");
    expect(renderedCode).not.toContain("\uFEFF");
    await code.screenshot({ path: test.info().outputPath(`source-encoding-${file.path.split("/").at(-1)}.png`) });
    await breadcrumb.getByRole("button", { name: "git-page-docs", exact: true }).click();
    await expect(directory).toBeVisible();
  }
});

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

const TREE_FOLDERS = [
  "workspace-with-complete-directory-names",
  "packages",
  "deeply-nested-source-navigation-components",
] as const;
const TREE_FILE_NAME = "source-file-with-a-complete-name-that-remains-readable-by-horizontal-scrolling.ts";
const TREE_FILE_PATH = `${TREE_FOLDERS.join("/")}/${TREE_FILE_NAME}`;
const TREE_ROOT_FILE_COUNT = 80;
const TREE_FILE_INDEX_DIGITS = 3;
const TREE_SCROLL_DISTANCE = 10_000;
const OPEN_FILE_CODE = 'export const currentFile = "keep this file open";';
const DEEP_FILE_CODE = 'export const nestedFile = "full source tree path";';
const FINAL_FILE_CODE = 'export const finalFile = "bottom of source tree";';
const LAST_TREE_FILE = "scroll-item-079.ts";

interface TreeScrollState {
  left: number;
  top: number;
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
}

async function readTreeScrollState(label: Locator): Promise<TreeScrollState | null> {
  return label.evaluate(element => {
    let ancestor = element.parentElement;
    while (ancestor && ancestor.tagName !== "ASIDE") {
      const style = getComputedStyle(ancestor);
      if (["auto", "scroll"].includes(style.overflowX) && ["auto", "scroll"].includes(style.overflowY)) {
        return {
          left: ancestor.scrollLeft, top: ancestor.scrollTop,
          width: ancestor.clientWidth, height: ancestor.clientHeight,
          contentWidth: ancestor.scrollWidth, contentHeight: ancestor.scrollHeight,
        };
      }
      ancestor = ancestor.parentElement;
    }
    return null;
  });
}

test("source tree scrolls in both directions and toggles folders without truncating names", async ({ page }) => {
  await page.route(TREE_URL, route => route.fulfill({
    json: { tree: [
      ...TREE_FOLDERS.map((_, index) => ({ path: TREE_FOLDERS.slice(0, index + 1).join("/"), type: "tree" })),
      { path: "keep-open.ts", type: "blob", size: OPEN_FILE_CODE.length },
      { path: TREE_FILE_PATH, type: "blob", size: DEEP_FILE_CODE.length },
      ...Array.from({ length: TREE_ROOT_FILE_COUNT }, (_, index) => ({ path: `scroll-item-${index.toString().padStart(TREE_FILE_INDEX_DIGITS, "0")}.ts`, type: "blob", size: FINAL_FILE_CODE.length })),
    ] },
  }));
  for (const file of [
    { path: "keep-open.ts", content: OPEN_FILE_CODE },
    { path: TREE_FILE_PATH, content: DEEP_FILE_CODE },
    { path: LAST_TREE_FILE, content: FINAL_FILE_CODE },
  ]) {
    await page.route(new URL(file.path, FILE_URL).href, route => route.fulfill({ body: file.content }));
  }
  await page.goto("/source-viewer/?theme=github-dark&modetheme=dark");
  const main = page.getByRole("main");
  await expect(main.getByRole("table", { name: "Files", exact: true })).toBeVisible();
  const tree = main.getByRole("complementary", { name: "Files", exact: true });
  if (!(await tree.isVisible())) await main.getByRole("button", { name: "Files", exact: true }).click();
  await tree.getByRole("button", { name: "keep-open.ts", exact: true }).click();
  const openFile = main.getByRole("cell").filter({ hasText: OPEN_FILE_CODE });
  await expect(openFile).toHaveText(OPEN_FILE_CODE);

  const firstFolder = tree.getByRole("button", { name: TREE_FOLDERS[0], exact: true });
  const secondFolder = tree.getByRole("button", { name: TREE_FOLDERS[1], exact: true });
  await expect(firstFolder).toHaveAttribute("aria-expanded", "false");
  await firstFolder.click();
  await expect(firstFolder).toHaveAttribute("aria-expanded", "true");
  await expect(secondFolder).toBeVisible();
  await firstFolder.click();
  await expect(firstFolder).toHaveAttribute("aria-expanded", "false");
  await expect(secondFolder).toHaveCount(0);
  await expect(openFile).toHaveText(OPEN_FILE_CODE);
  for (const name of TREE_FOLDERS) {
    const folder = tree.getByRole("button", { name, exact: true });
    await folder.click();
    await expect(folder).toHaveAttribute("aria-expanded", "true");
  }
  await expect(openFile).toHaveText(OPEN_FILE_CODE);

  const fullName = tree.getByText(TREE_FILE_NAME, { exact: true });
  const label = await fullName.evaluate(element => ({
    textOverflow: getComputedStyle(element).textOverflow,
    width: element.clientWidth,
    contentWidth: element.scrollWidth,
  }));
  expect(label.textOverflow).not.toBe("ellipsis");
  expect(label.contentWidth).toBeLessThanOrEqual(label.width);
  const scroll = await readTreeScrollState(fullName);
  expect(scroll).not.toBeNull();
  expect(scroll!.contentWidth).toBeGreaterThan(scroll!.width);
  expect(scroll!.contentHeight).toBeGreaterThan(scroll!.height);
  await tree.getByRole("button", { name: TREE_FILE_NAME, exact: true }).click();
  await expect(main.getByRole("cell").filter({ hasText: DEEP_FILE_CODE })).toHaveText(DEEP_FILE_CODE);

  await fullName.scrollIntoViewIfNeeded();
  await tree.hover();
  await page.mouse.wheel(-TREE_SCROLL_DISTANCE, 0);
  await expect.poll(async () => (await readTreeScrollState(fullName))?.left ?? -1).toBe(0);
  await tree.screenshot({ path: test.info().outputPath("source-tree-horizontal-start.png") });
  await page.mouse.wheel(TREE_SCROLL_DISTANCE, 0);
  await expect.poll(async () => (await readTreeScrollState(fullName))?.left ?? 0).toBeGreaterThan(0);
  await tree.screenshot({ path: test.info().outputPath("source-tree-horizontal-end.png") });
  await page.mouse.wheel(0, TREE_SCROLL_DISTANCE);
  await expect.poll(async () => (await readTreeScrollState(fullName))?.top ?? 0).toBeGreaterThan(0);
  await page.mouse.wheel(-TREE_SCROLL_DISTANCE, 0);
  await expect.poll(async () => (await readTreeScrollState(fullName))?.left ?? -1).toBe(0);
  const lastFile = tree.getByRole("button", { name: LAST_TREE_FILE, exact: true });
  await lastFile.scrollIntoViewIfNeeded();
  await expect(lastFile).toBeInViewport();
  await tree.screenshot({ path: test.info().outputPath("source-tree-vertical-bottom.png") });
  await tree.getByText(LAST_TREE_FILE, { exact: true }).click();
  await expect(main.getByRole("cell").filter({ hasText: FINAL_FILE_CODE })).toHaveText(FINAL_FILE_CODE);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: test.info().outputPath("source-tree-scroll-and-folders.png") });
});

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

test("long repository listings and previews scroll inside a bounded content area", async ({ page }) => {
  const fileCount = 80;
  const markdown = `# Repository overview\n${"\nRepository content.\n".repeat(120)}\n## End of repository overview\n`;
  await page.route(TREE_URL, (route) => route.fulfill({
    json: { tree: [
      { path: "README.md", type: "blob", size: Buffer.byteLength(markdown) },
      ...Array.from({ length: fileCount }, (_, index) => ({
        path: `file-${index.toString().padStart(3, "0")}.ts`, type: "blob", size: 40,
      })),
    ] },
  }));
  await page.route(FILE_URL, (route) => route.fulfill({ body: markdown }));
  await page.goto("/source-viewer/?theme=rose-dark&modetheme=dark");
  const directory = page.getByRole("table", { name: "Files", exact: true });
  await expect(directory).toBeVisible();
  const overview = page.getByRole("heading", { name: "End of repository overview", exact: true });
  await expect(overview).toBeAttached();

  for (const viewport of [page.viewportSize()!, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const dimensions = await directory.evaluate((element) => {
      let parent = element.parentElement;
      while (parent && parent.tagName !== "MAIN") {
        if (["auto", "scroll"].includes(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight) {
          parent.scrollTop = 0;
          return { height: parent.clientHeight, contentHeight: parent.scrollHeight };
        }
        parent = parent.parentElement;
      }
      return null;
    });
    expect(dimensions).not.toBeNull();
    expect(dimensions!.height).toBeLessThan(viewport.height);
    expect(dimensions!.contentHeight).toBeGreaterThan(dimensions!.height);
    const lastFile = directory.getByRole("button", { name: "file-079.ts", exact: true });
    await directory.getByRole("button", { name: "file-078.ts", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(lastFile).toBeFocused();
    await expect(lastFile).toBeInViewport();
    await overview.scrollIntoViewIfNeeded();
    await expect(overview).toBeInViewport();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await expect(overview).toHaveCount(0);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(overview).toBeAttached();
  await page.screenshot({ path: test.info().outputPath("source-viewer-bounded-scroll.png") });
});
