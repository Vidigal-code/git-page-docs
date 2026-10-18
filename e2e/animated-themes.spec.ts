import { expect, test, type Locator, type Page } from "@playwright/test";

const CATALOG_SIZE = 124;
const MOBILE_WIDTH = 320;
const MAX_OVERFLOW_PX = 2;
const SNAPSHOTS = [
  { name: "Astral Drift", id: "astral-drift-dark", kind: "stars" },
  { name: "Matrix Rain", id: "matrix-rain-dark", kind: "matrix" },
  { name: "Matrix Paper", id: "matrix-paper-light", kind: "matrix" },
  { name: "Aurora Borealis Dark", id: "aurora-borealis-dark", kind: "waves" },
  { name: "Aurora Borealis Light", id: "aurora-borealis-light", kind: "waves" },
  { name: "GitHub Dark", id: "github-dark", kind: null },
];

async function openMenu(page: Page): Promise<void> {
  if ((page.viewportSize()?.width ?? 1280) >= 1024) return;
  const trigger = page.getByRole("button", { name: "Menu", exact: true });
  await trigger.click();
  await expect(page.getByRole("complementary").filter({ visible: true }).getByRole("button", { name: "Close", exact: true })).toBeVisible();
}

async function closeMenu(page: Page): Promise<void> {
  if ((page.viewportSize()?.width ?? 1280) >= 1024) return;
  await page.getByRole("complementary").filter({ visible: true }).getByRole("button", { name: "Close", exact: true }).click();
}

function animationControl(page: Page, action: "Pause" | "Resume"): Locator {
  return page.getByRole("button", { name: `${action} background animation`, exact: true }).filter({ visible: true });
}

async function openChoices(page: Page): Promise<Locator> {
  const width = page.viewportSize()?.width ?? 1280;
  await openMenu(page);
  await page.getByRole("button", { name: "Theme selector", exact: true }).filter({ visible: true }).first().click();
  const choices = page.getByRole(width <= 640 ? "dialog" : "list", { name: "Theme selector", exact: true });
  await expect(choices).toBeVisible();
  return choices;
}

async function particleFrame(particle: Locator): Promise<string> {
  return particle.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.transform}|${style.opacity}`;
  });
}

async function expectFrozen(particle: Locator): Promise<void> {
  const frames = await particle.evaluate(async (element) => {
    const sample = () => { const style = getComputedStyle(element); return `${style.transform}|${style.opacity}`; };
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const first = sample();
    await new Promise<void>((resolve) => {
      let remainingFrames = 8;
      const advance = () => { if (--remainingFrames === 0) resolve(); else requestAnimationFrame(advance); };
      requestAnimationFrame(advance);
    });
    return { first, last: sample() };
  });
  expect(frames.last).toBe(frames.first);
}

test("offers all layouts and switches animated and legacy themes without overflow", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") await page.setViewportSize({ width: MOBILE_WIDTH, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?lang=en&menu=en&id=13&theme=github-dark", { waitUntil: "domcontentloaded" });
  await page.getByRole("main").waitFor();
  for (const theme of SNAPSHOTS) {
    const choices = await openChoices(page);
    await expect(choices.getByRole("button")).toHaveCount(CATALOG_SIZE);
    await choices.getByRole("button", { name: theme.name, exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("theme")).toBe(theme.id);
    if (theme.kind) {
      await expect(page.getByTestId("theme-background")).toBeVisible();
      await expect(page.locator(`[data-background-particle="${theme.kind}"]`).first()).toBeAttached();
      if (await animationControl(page, "Pause").isVisible()) await animationControl(page, "Pause").click();
      await expect(animationControl(page, "Resume")).toHaveAttribute("aria-pressed", "true");
    } else {
      await expect(page.getByTestId("theme-background")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Pause background animation" })).toHaveCount(0);
    }
    await closeMenu(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    await page.screenshot({ path: testInfo.outputPath(`${theme.id}.png`) });
  }
  expect(errors).toEqual([]);
});

test("pauses actual transforms and opacity then resumes from the current frame", async ({ page }) => {
  await page.goto("/?lang=en&menu=en&id=13&theme=astral-drift-dark", { waitUntil: "domcontentloaded" });
  const particle = page.locator('[data-background-particle="stars"]').first();
  await expect(particle).toBeAttached();
  const initial = await particleFrame(particle);
  await expect.poll(() => particleFrame(particle)).not.toBe(initial);
  await openMenu(page);
  const pause = animationControl(page, "Pause");
  await expect(pause).toBeVisible();
  expect(await pause.evaluate((element) => element.previousElementSibling?.getAttribute("aria-label")))
    .toMatch(/(?:Block|Allow) menu on navigation/);
  await pause.click();
  await expectFrozen(particle);
  await closeMenu(page);
  await openMenu(page);
  await expect(animationControl(page, "Resume")).toHaveAttribute("aria-pressed", "true");
  const paused = await particleFrame(particle);
  await animationControl(page, "Resume").click();
  await expect.poll(() => particleFrame(particle)).not.toBe(paused);
});

test("keeps playback paused while toggling both modes of a new theme", async ({ page }) => {
  await page.goto("/?lang=en&menu=en&id=13&theme=aurora-borealis-dark", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("theme-background")).toBeVisible();
  await openMenu(page);
  await animationControl(page, "Pause").click();
  for (const mode of ["Light", "Dark"]) {
    await page.getByRole("button", { name: `${mode} mode`, exact: true }).filter({ visible: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("theme")).toBe(`aurora-borealis-${mode.toLowerCase()}`);
    await expect(animationControl(page, "Resume")).toHaveAttribute("aria-pressed", "true");
    const particle = page.locator("[data-background-particle]").first();
    await expect(particle).toBeAttached();
    await expectFrozen(particle);
  }
  await animationControl(page, "Resume").click();
  const particle = page.locator("[data-background-particle]").first();
  const initial = await particleFrame(particle);
  await expect.poll(() => particleFrame(particle)).not.toBe(initial);
});

test("honors reduced motion at load and when the system preference changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?lang=en&menu=en&id=13&theme=matrix-rain-dark", { waitUntil: "domcontentloaded" });
  const particle = page.locator('[data-background-particle="matrix"]').first();
  await expect(particle).toBeAttached();
  await expect(page.getByRole("button", { name: "Pause background animation" })).toHaveCount(0);
  await expectFrozen(particle);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openMenu(page);
  await expect(animationControl(page, "Pause")).toBeVisible();
  const initial = await particleFrame(particle);
  await expect.poll(() => particleFrame(particle)).not.toBe(initial);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Pause background animation" })).toHaveCount(0);
  await expectFrozen(particle);
});
