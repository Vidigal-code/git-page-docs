import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { LayoutsConfig, ThemeTemplate } from "../frontend/src/entities/docs/model/types";

const FIXED_THEME = "violet-dark";
const REQUESTED_THEME = "polaris-parallax-dark";
const SITE_NAME = "Git Page Link Create";
const REPOSITORY_PATH = "/Vidigal-code/git-page-link-create";
const RAW_REPOSITORY_URL = "https://raw.githubusercontent.com/Vidigal-code/git-page-link-create/HEAD/";
const DOCUMENT_PATH = "gitpagedocs/docs/versions/1.0.0/en/reference.md";
const LOAD_TIMEOUT_MS = 30_000;
const MAX_OVERFLOW_PX = 1;

async function openDocumentation(page: Page, policy: "fixed" | "selectable"): Promise<ThemeTemplate> {
  const layouts = JSON.parse(readFileSync("gitpagelayouts/layoutsConfig.json", "utf8")) as LayoutsConfig;
  const themes = [FIXED_THEME, REQUESTED_THEME].map(id =>
    JSON.parse(readFileSync(`gitpagelayouts/templates/${id}.json`, "utf8")) as ThemeTemplate,
  );
  const config = {
    site: {
      name: SITE_NAME, SiteHeaderName: SITE_NAME, defaultLanguage: "en",
      HideThemeSelector: policy === "fixed", ThemeDefault: FIXED_THEME, ThemeModeDefault: "dark",
      layoutsConfigPathOficial: false,
      layoutsConfigPath: `${RAW_REPOSITORY_URL}gitpagelayouts/layoutsConfig.json`,
      layoutsConfigPathTemplates: `${RAW_REPOSITORY_URL}gitpagelayouts/templates`,
    },
    VersionControl: { versions: [{ id: "1.0.0", path: "gitpagedocs/docs/versions/1.0.0/config.json" }] },
  };
  const menu = { title: "Code reference", "path-click": DOCUMENT_PATH };
  const artifacts = new Map<string, unknown>([
    ["gitpagedocs/config.json", config],
    ["gitpagedocs/docs/versions/1.0.0/config.json", {
      "routes-md": [{ id: 10, path: { en: DOCUMENT_PATH }, title: { en: menu.title }, container: "full" }],
      "menus-header-md": [{ id: 10, en: menu }],
    }],
    ["gitpagelayouts/layoutsConfig.json", { layouts: layouts.layouts.filter(layout => themes.some(theme => theme.id === layout.id)) }],
    ...themes.map(theme => [`gitpagelayouts/templates/${theme.id}.json`, theme] as const),
  ]);
  await page.route("https://**/*", route => route.fulfill({ status: 404, body: "{}" }));
  await page.route("https://raw.githubusercontent.com/**", route => {
    const artifact = new URL(route.request().url()).pathname.split(/\/(?:main|HEAD)\//)[1];
    if (artifact === DOCUMENT_PATH) {
      return route.fulfill({ contentType: "text/plain; charset=utf-8", body: "# Repository reference\n\nThe configured theme applies to this document." });
    }
    const json = artifacts.get(artifact);
    return json ? route.fulfill({ json }) : route.fulfill({ status: 404, body: "{}" });
  });
  await page.addInitScript(requestedTheme => {
    localStorage.setItem("git-page-docs:theme:git-page-link-create", requestedTheme);
    localStorage.setItem("git-page-docs:mode:git-page-link-create", "dark");
  }, REQUESTED_THEME);
  // Keep the repository URL while serving the same 404 fallback used by Pages.
  await page.route(`**${REPOSITORY_PATH}?*`, async route => {
    if (route.request().resourceType() !== "document") return route.continue();
    const notFoundUrl = new URL("/introduction-guide/", route.request().url());
    const response = await route.fetch({ url: notFoundUrl.toString() });
    await route.fulfill({ response });
  });
  await page.goto(`${REPOSITORY_PATH}?theme=${REQUESTED_THEME}&modetheme=dark&menu=en&id=10`);
  await expect(page.getByRole("heading", { name: "Repository reference", exact: true })).toBeVisible({ timeout: LOAD_TIMEOUT_MS });
  return themes.find(theme => theme.id === (policy === "fixed" ? FIXED_THEME : REQUESTED_THEME))!;
}

for (const policy of ["fixed", "selectable"] as const) {
  test(`remote documentation honors its ${policy} theme policy despite URL and saved preferences`, async ({ page }) => {
    const expectedTheme = await openDocumentation(page, policy);
    const root = page.locator("html");
    await expect(root).toHaveCSS("--primary", expectedTheme.colors.primary);
    await expect(page.getByRole("main")).toHaveCSS("--primary", expectedTheme.colors.primary);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Repository reference", exact: true })).toBeVisible({ timeout: LOAD_TIMEOUT_MS });
    await expect(root).toHaveCSS("--primary", expectedTheme.colors.primary);
    await page.screenshot({ path: test.info().outputPath(`document-theme-${policy}.png`) });
  });
}
