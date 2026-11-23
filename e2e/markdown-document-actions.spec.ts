import { readFileSync } from "node:fs";
import { test, expect, type Locator, type Page } from "@playwright/test";
import type { LayoutsConfig, ThemeTemplate } from "../frontend/src/entities/docs/model/types";

const REPOSITORY_PATH = "/Vidigal-code/git-page-link-create";
const RAW_REPOSITORY_URL = "https://raw.githubusercontent.com/Vidigal-code/git-page-link-create/HEAD/";
const VERSION = "0.0.29";
const VERSION_PATH = `gitpagedocs/docs/versions/${VERSION}`;
const PARAGRAPH_COUNT = 48;
const LAST_PARAGRAPH = "The final paragraph must remain fully visible above the document controls.";
const LOAD_TIMEOUT_MS = 30_000;
const GEOMETRY_TOLERANCE_PX = 1;
const MIN_CONTENT_GAP_PX = 6;
const MAX_CONTENT_GAP_PX = 12;
const DOCUMENTS = [
  { id: 1, title: "First document" },
  { id: 2, title: "Middle document" },
  { id: 3, title: "Last document" },
] as const;
const ACTION_LABELS = ["Previous", "Next", "Back to top"] as const;
type Alignment = "left" | "center" | "right";

interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: string;
}

async function prepareDocumentation(page: Page, position: Alignment): Promise<void> {
  const layouts = JSON.parse(readFileSync("gitpagelayouts/layoutsConfig.json", "utf8")) as LayoutsConfig;
  const theme = JSON.parse(readFileSync("gitpagelayouts/templates/aurora-dark.json", "utf8")) as ThemeTemplate;
  const paragraphs = Array.from({ length: PARAGRAPH_COUNT }, (_, index) => `Paragraph ${index + 1}: readers can follow this document without any controls covering its content.`).join("\n\n");
  const markdown = new Map(DOCUMENTS.map(document => [
    `${VERSION_PATH}/en/${document.id}.md`, `# ${document.title}\n\n${paragraphs}\n\n${LAST_PARAGRAPH}`,
  ]));
  const artifacts = new Map<string, unknown>([
    ["gitpagedocs/config.json", {
      site: {
        name: "Document controls", defaultLanguage: "en", languages: { en: true },
        HideThemeSelector: true, ThemeDefault: theme.id, ThemeModeDefault: "dark",
        AiChatEnabled: false, audioPlayerEnabled: false, backgroundEffects: { enabled: false },
        documentNavigation: { position }, backToTop: { enabled: true, minPageHeightViewports: 1.5 },
        layoutsConfigPathOficial: false,
        layoutsConfigPath: `${RAW_REPOSITORY_URL}gitpagelayouts/layoutsConfig.json`,
        layoutsConfigPathTemplates: `${RAW_REPOSITORY_URL}gitpagelayouts/templates`,
      },
      VersionControl: { versions: [{ id: VERSION, path: `${VERSION_PATH}/config.json` }] },
    }],
    [`${VERSION_PATH}/config.json`, {
      "routes-md": DOCUMENTS.map(document => ({
        id: document.id, path: { en: `${VERSION_PATH}/en/${document.id}.md` },
        title: { en: document.title }, container: "full", RouteguideBrand: false,
      })),
      "menus-header-md": DOCUMENTS.map(document => ({
        id: document.id, en: { title: document.title, "path-click": `${VERSION_PATH}/en/${document.id}.md` },
      })),
    }],
    ["gitpagelayouts/layoutsConfig.json", { layouts: layouts.layouts.filter(layout => layout.id === theme.id) }],
    [`gitpagelayouts/templates/${theme.id}.json`, theme],
  ]);
  await page.route("https://**/*", route => route.fulfill({ status: 404, body: "{}" }));
  await page.route("https://raw.githubusercontent.com/**", route => {
    const artifact = new URL(route.request().url()).pathname.split(/\/(?:main|HEAD)\//)[1];
    const body = markdown.get(artifact);
    if (body) return route.fulfill({ contentType: "text/plain; charset=utf-8", body });
    const json = artifacts.get(artifact);
    return json ? route.fulfill({ json }) : route.fulfill({ status: 404, body: "{}" });
  });
  await page.route(`**${REPOSITORY_PATH}?*`, async route => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch({ url: new URL("/introduction-guide/", route.request().url()).toString() });
    await route.fulfill({ response });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function geometry(locator: Locator): Promise<Geometry> {
  await expect(locator).toBeVisible();
  return locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, radius: getComputedStyle(element).borderRadius };
  });
}

async function expectControlsLayout(article: Locator, position: Alignment): Promise<void> {
  const controls = ACTION_LABELS.map(name => article.getByRole("button", { name, exact: true }));
  await controls.at(-1)!.scrollIntoViewIfNeeded();
  const content = await geometry(article.getByText(LAST_PARAGRAPH, { exact: true }));
  const card = await geometry(article);
  const copy = await geometry(article.getByTestId("md-copy"));
  const buttons = await Promise.all(controls.map(control => geometry(control)));
  for (const button of buttons) {
    expect(button.width).toBe(copy.width);
    expect(button.height).toBe(copy.height);
    expect(button.radius).toBe(copy.radius);
    const gap = button.y - content.y - content.height;
    expect(gap).toBeGreaterThanOrEqual(MIN_CONTENT_GAP_PX);
    expect(gap).toBeLessThanOrEqual(MAX_CONTENT_GAP_PX);
    expect(button.y + button.height).toBeLessThan(card.y + card.height);
  }
  const first = buttons[0];
  const last = buttons.at(-1)!;
  const alignmentOffset = {
    left: first.x - content.x,
    center: (first.x + last.x + last.width) / 2 - content.x - content.width / 2,
    right: last.x + last.width - content.x - content.width,
  };
  expect(Math.abs(alignmentOffset[position])).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
}

async function closeNavigationPanel(page: Page): Promise<void> {
  const close = page.getByRole("complementary").getByRole("button", { name: "Close", exact: true }).filter({ visible: true });
  if (await close.isVisible()) await close.click();
}

for (const position of ["left", "center", "right"] as const) {
  test(`Markdown document controls preserve ${position} alignment, compact spacing and navigation`, async ({ page }) => {
    await prepareDocumentation(page, position);
    await page.goto(`${REPOSITORY_PATH}?lang=en&menu=en&id=${DOCUMENTS[1].id}`);
    const main = page.getByRole("main");
    const article = main.getByRole("article");
    const heading = article.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText(DOCUMENTS[1].title, { timeout: LOAD_TIMEOUT_MS });
    await expectControlsLayout(article, position);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await article.getByRole("button", { name: "Back to top", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(main).toBeFocused();
    const previous = article.getByRole("button", { name: "Previous", exact: true });
    const next = article.getByRole("button", { name: "Next", exact: true });
    await previous.click();
    await expect(heading).toHaveText(DOCUMENTS[0].title);
    await expect(previous).toBeDisabled();
    await closeNavigationPanel(page);
    await next.click();
    await expect(heading).toHaveText(DOCUMENTS[1].title);
    await closeNavigationPanel(page);
    await next.click();
    await expect(heading).toHaveText(DOCUMENTS[2].title);
    await expect(next).toBeDisabled();
  });
}
