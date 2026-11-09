import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { LayoutsConfig, ThemeTemplate } from "../frontend/src/entities/docs/model/types";

const THEME_IDS = {
  fixed: { light: "violet-light", dark: "violet-dark" },
  selectable: { light: "aurora-light", dark: "aurora-dark" },
} as const;
const FOREIGN_THEME = "polaris-parallax-dark";
const SITE_NAME = "Git Page Link Create";
const REPOSITORY_PATH = "/Vidigal-code/git-page-link-create";
const RAW_REPOSITORY_URL = "https://raw.githubusercontent.com/Vidigal-code/git-page-link-create/HEAD/";
const DOCUMENT_PATH = "gitpagedocs/docs/versions/1.0.0/en/reference.md";
const LOAD_TIMEOUT_MS = 30_000;
const MAX_OVERFLOW_PX = 1;
const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTHS = [320, 344] as const;
const VIEWPORT_HEIGHT = 900;
const DOCS_MENU_BREAKPOINT = 1024;

interface ThemeScenario {
  light: ThemeTemplate;
  dark: ThemeTemplate;
  initialUrl: string;
}

async function prepareDocumentation(page: Page, policy: "fixed" | "selectable"): Promise<ThemeScenario> {
  const layouts = JSON.parse(readFileSync("gitpagelayouts/layoutsConfig.json", "utf8")) as LayoutsConfig;
  const themes = [FOREIGN_THEME, ...Object.values(THEME_IDS.fixed), ...Object.values(THEME_IDS.selectable)].map(id =>
    JSON.parse(readFileSync(`gitpagelayouts/templates/${id}.json`, "utf8")) as ThemeTemplate,
  );
  const config = {
    site: {
      name: SITE_NAME, SiteHeaderName: SITE_NAME, defaultLanguage: "en",
      HideThemeSelector: policy === "fixed", ThemeDefault: THEME_IDS.fixed.dark, ThemeModeDefault: "dark",
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
    if (localStorage.getItem("git-page-docs:mode:git-page-link-create") === null) {
      localStorage.setItem("git-page-docs:theme:git-page-link-create", requestedTheme);
      localStorage.setItem("git-page-docs:mode:git-page-link-create", "dark");
    }
  }, FOREIGN_THEME);
  // Keep the repository URL while serving the same 404 fallback used by Pages.
  await page.route(`**${REPOSITORY_PATH}?*`, async route => {
    if (route.request().resourceType() !== "document") return route.continue();
    const notFoundUrl = new URL("/introduction-guide/", route.request().url());
    const response = await route.fetch({ url: notFoundUrl.toString() });
    await route.fulfill({ response });
  });
  const expected = THEME_IDS[policy];
  const requestedTheme = policy === "fixed" ? FOREIGN_THEME : expected.light;
  return {
    light: themes.find(theme => theme.id === expected.light)!,
    dark: themes.find(theme => theme.id === expected.dark)!,
    initialUrl: `${REPOSITORY_PATH}?theme=${requestedTheme}&modetheme=light&menu=en&id=10`,
  };
}

async function expectPalette(page: Page, theme: ThemeTemplate): Promise<void> {
  await expect(page.getByRole("heading", { name: "Repository reference", exact: true })).toBeVisible({ timeout: LOAD_TIMEOUT_MS });
  await expect(page.locator("html")).toHaveCSS("--primary", theme.colors.primary!);
  await expect(page.getByRole("main")).toHaveCSS("--primary", theme.colors.primary!);
  await expect(page.locator("html")).toHaveCSS("--background", theme.colors.background!);
}

async function openControls(page: Page): Promise<void> {
  if ((page.viewportSize()?.width ?? DESKTOP_WIDTH) <= DOCS_MENU_BREAKPOINT) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
  }
}

for (const policy of ["fixed", "selectable"] as const) {
  test(`remote documentation switches and restores light/dark mode with ${policy} theme selection`, async ({ page }, testInfo) => {
    const scenario = await prepareDocumentation(page, policy);
    const widths = testInfo.project.name === "mobile" ? MOBILE_WIDTHS : [DESKTOP_WIDTH];
    for (const width of widths) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto(scenario.initialUrl);
      await expectPalette(page, scenario.light);
      await openControls(page);
      const selector = page.getByRole("button", { name: "Theme selector", exact: true });
      if (policy === "fixed") await expect(selector).toHaveCount(0);
      else await expect(selector).toBeVisible();
      await page.getByRole("button", { name: "Dark mode", exact: true }).click();
      await expectPalette(page, scenario.dark);
      await expect(page.getByRole("button", { name: "Light mode", exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get("theme")).toBe(scenario.dark.id);
      await expect.poll(() => new URL(page.url()).searchParams.get("modetheme")).toBe("dark");
      await page.reload();
      await expectPalette(page, scenario.dark);
      await page.goto(`${REPOSITORY_PATH}?menu=en&id=10`);
      await expectPalette(page, scenario.dark);
      await openControls(page);
      await expect(page.getByRole("button", { name: "Light mode", exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
      await page.screenshot({ path: testInfo.outputPath(`document-theme-${policy}-${width}.png`) });
    }
  });
}
