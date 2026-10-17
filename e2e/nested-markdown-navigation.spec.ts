import { expect, test, type Locator, type Page } from "@playwright/test";

const ROUTES = { configuration: "13", focus: "22", guides: "31", configure: "32", read: "33" } as const;

async function expectCurrentDocument(page: Page, document: { id: string; title: string }): Promise<void> {
  await expect(page).toHaveURL((url) => url.searchParams.get("id") === document.id);
  const breadcrumb = page.getByRole("main").getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(document.title);
}

async function openGuidesMenu(page: Page): Promise<Locator> {
  const menu = page.locator("nav:visible").filter({
    has: page.getByRole("button", { name: /^(Expand|Collapse) submenu: Guides$/ }),
  });
  if (!await menu.isVisible()) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(menu).toBeVisible();
  return menu;
}

async function closeNavigationPanel(page: Page, closeLabel: string): Promise<void> {
  const close = page.getByRole("complementary").getByRole("button", { name: closeLabel, exact: true }).filter({ visible: true });
  if (await close.isVisible()) await close.click();
}

test("Portuguese breadcrumbs open each configured parent Markdown document", async ({ page }) => {
  await page.goto(`/?lang=pt&menu=pt&id=${ROUTES.configuration}`, { waitUntil: "domcontentloaded" });
  await expectCurrentDocument(page, { id: ROUTES.configuration, title: "Configuração" });
  const breadcrumb = page.getByRole("main").getByRole("navigation", { name: "Breadcrumb" });
  await breadcrumb.getByRole("button", { name: "Configure seu site", exact: true }).click();
  await expectCurrentDocument(page, { id: ROUTES.configure, title: "Configure seu site" });
  await expect(breadcrumb.getByText("Configuração", { exact: true })).toHaveCount(0);
  await breadcrumb.getByRole("button", { name: "Guias", exact: true }).click();
  await expectCurrentDocument(page, { id: ROUTES.guides, title: "Guias" });
  await expect(breadcrumb.getByText("Configure seu site", { exact: true })).toHaveCount(0);
});

test("parent titles navigate and submenu arrows expand independently on every menu surface", async ({ page }) => {
  await page.goto(`/?menu=en&id=${ROUTES.focus}`, { waitUntil: "domcontentloaded" });
  await expectCurrentDocument(page, { id: ROUTES.focus, title: "Focus mode" });
  let menu = await openGuidesMenu(page);
  await menu.getByRole("button", { name: "Collapse submenu: Guides", exact: true }).click();
  await expect(menu.getByRole("button", { name: "Read and explore", exact: true })).toHaveCount(0);
  await expectCurrentDocument(page, { id: ROUTES.focus, title: "Focus mode" });
  await menu.getByRole("button", { name: "Expand submenu: Guides", exact: true }).click();
  await menu.getByRole("button", { name: "Collapse submenu: Read and explore", exact: true }).click();
  await expect(menu.getByRole("button", { name: "Focus mode", exact: true })).toHaveCount(0);
  await expectCurrentDocument(page, { id: ROUTES.focus, title: "Focus mode" });
  await menu.getByRole("button", { name: "Read and explore", exact: true }).click();
  await expectCurrentDocument(page, { id: ROUTES.read, title: "Read and explore" });
  menu = await openGuidesMenu(page);
  const readSubmenu = menu.getByRole("button", { name: /^(Expand|Collapse) submenu: Read and explore$/ });
  await expect(readSubmenu).toBeVisible();
  if (await readSubmenu.getAttribute("aria-expanded") === "false") await readSubmenu.click();
  await menu.getByRole("button", { name: "Focus mode", exact: true }).click();
  await expectCurrentDocument(page, { id: ROUTES.focus, title: "Focus mode" });
  await closeNavigationPanel(page, "Close");
  const breadcrumb = page.getByRole("main").getByRole("navigation", { name: "Breadcrumb" });
  await breadcrumb.getByRole("button", { name: "Read and explore", exact: true }).click();
  await expectCurrentDocument(page, { id: ROUTES.read, title: "Read and explore" });
  await breadcrumb.getByRole("button", { name: "Guides", exact: true }).click();
  await expectCurrentDocument(page, { id: ROUTES.guides, title: "Guides" });
});

test("focus navigation includes the parent document before its Markdown children", async ({ page, isMobile }) => {
  await page.goto(`/?menu=en&id=${ROUTES.read}`, { waitUntil: "domcontentloaded" });
  await expectCurrentDocument(page, { id: ROUTES.read, title: "Read and explore" });
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator('button[aria-label="Focus mode"][title="Focus mode"]:visible').click();
  const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
  await expect(focus).toBeVisible();
  await focus.getByRole("button", { name: "Next document", exact: true }).click();
  await expect(page).toHaveURL((url) => url.searchParams.get("id") === ROUTES.focus);
  await expect(focus).toBeVisible();
  await focus.getByRole("button", { name: "Previous document", exact: true }).click();
  await expect(page).toHaveURL((url) => url.searchParams.get("id") === ROUTES.read);
  await expect(focus).toBeVisible();
});
