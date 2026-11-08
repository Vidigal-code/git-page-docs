import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import type { GitPageDocsConfig, LayoutsConfig, ThemeTemplate } from "../frontend/src/entities/docs/model/types";
import type { ThemeBackgroundConfig } from "../frontend/src/entities/docs/model/types/theme-background";

const THEME_ID = "solar-sparks-dark";
const PARTICLE_COUNT = 50;
const SETUP_TIMEOUT_MS = 30_000;
const SAMPLE_DURATION_MS = 500;
const GUIDE_URL = `/introduction-guide?theme=${THEME_ID}&modetheme=dark`;

async function openBackground(page: Page, background: ThemeBackgroundConfig = {}, count = PARTICLE_COUNT): Promise<Locator> {
  const config = JSON.parse(readFileSync("gitpagedocs/config.json", "utf8")) as GitPageDocsConfig;
  const layouts = JSON.parse(readFileSync("gitpagelayouts/layoutsConfig.json", "utf8")) as LayoutsConfig;
  const theme = JSON.parse(readFileSync(`gitpagelayouts/templates/${THEME_ID}.json`, "utf8")) as ThemeTemplate;
  const staticTheme = JSON.parse(readFileSync("gitpagelayouts/templates/vscode-dark.json", "utf8")) as ThemeTemplate;
  config.site.backgroundEffects = { enabled: true };
  theme.backgroundEffects = { ...theme.backgroundEffects, ...background };
  const artifacts = new Map<string, unknown>([
    ["gitpagedocs/config.json", config],
    ["gitpagelayouts/layoutsConfig.json", { layouts: layouts.layouts.filter(layout => layout.id === THEME_ID || layout.id === staticTheme.id) }],
    [`gitpagelayouts/templates/${THEME_ID}.json`, theme],
    ["gitpagelayouts/templates/vscode-dark.json", staticTheme],
  ]);
  await page.route("https://raw.githubusercontent.com/**", route => {
    const artifact = new URL(route.request().url()).pathname.split(/\/(?:main|HEAD)\//)[1];
    const json = artifacts.get(artifact);
    return json ? route.fulfill({ json }) : route.fulfill({ status: 404, body: "{}" });
  });
  await page.goto(GUIDE_URL);
  const particles = page.locator("[data-background-particle]");
  await expect(particles).toHaveCount(count, { timeout: SETUP_TIMEOUT_MS });
  return particles;
}

async function particleStyles(particles: Locator): Promise<string[]> {
  return particles.evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element);
    return `${style.transform} ${style.opacity}`;
  }));
}

async function clickGuideControl(page: Page, name: string): Promise<void> {
  const control = page.getByRole("button", { name, exact: true }).filter({ visible: true });
  if (await control.count() === 0) {
    await page.getByRole("banner").getByRole("button", { name: "Open menu", exact: true }).click();
  }
  await control.click();
}

async function expectStationary(particles: Locator): Promise<void> {
  await expect.poll(() => particles.evaluateAll(elements => elements.every(element =>
    element.getAnimations().every(animation => animation.playState === "paused"),
  ))).toBe(true);
  const before = await particleStyles(particles);
  await particles.evaluateAll(async (_elements, duration) => {
    await new Promise(resolve => setTimeout(resolve, duration));
  }, SAMPLE_DURATION_MS);
  expect(await particleStyles(particles)).toEqual(before);
}

test("particles move without per-frame style writes and pause/resume without resetting", async ({ page }) => {
  const particles = await openBackground(page);
  const sample = await particles.evaluateAll(async (elements, duration) => {
    const before = elements.map(element => getComputedStyle(element).transform);
    let writes = 0;
    const observer = new MutationObserver(records => { writes += records.length; });
    elements.forEach(element => observer.observe(element, { attributes: true, attributeFilter: ["style"] }));
    await new Promise(resolve => setTimeout(resolve, duration));
    observer.disconnect();
    const after = elements.map(element => getComputedStyle(element).transform);
    return { writes, changed: after.some((value, index) => value !== before[index]) };
  }, SAMPLE_DURATION_MS);
  expect(sample.changed).toBe(true);
  expect(sample.writes).toBeLessThanOrEqual(PARTICLE_COUNT);
  await clickGuideControl(page, "Pause guide animations");
  await expectStationary(particles);
  const before = await particles.first().evaluate(element => Number(element.getAnimations()[0].currentTime));
  const pausedStyle = await particleStyles(particles);
  await clickGuideControl(page, "Resume guide animations");
  await expect.poll(() => particleStyles(particles)).not.toEqual(pausedStyle);
  const after = await particles.first().evaluate(element => Number(element.getAnimations()[0].currentTime));
  expect(after).toBeGreaterThanOrEqual(before);
});

test("hidden tabs suspend particles and preserve a manual pause when visible again", async ({ page }) => {
  const particles = await openBackground(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expectStationary(particles);
  await clickGuideControl(page, "Pause guide animations");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expectStationary(particles);
  const paused = await particleStyles(particles);
  await clickGuideControl(page, "Resume guide animations");
  await expect.poll(() => particleStyles(particles)).not.toEqual(paused);
});

test("reduced motion suspends opacity and transforms and resumes after preference changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const particles = await openBackground(page);
  await expectStationary(particles);
  const reduced = await particleStyles(particles);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => particleStyles(particles)).not.toEqual(reduced);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectStationary(particles);
});

test("disabled particle animation retains the deterministic decorative surface", async ({ page }) => {
  const particles = await openBackground(page, { animation: { enabled: false, speed: 1 } });
  await expectStationary(particles);
  await expect(page.getByTestId("theme-background")).toBeVisible();
});

test("native animation honors speed and cancels its effects when switching to a static theme", async ({ page }) => {
  const particles = await openBackground(page, { animation: { enabled: true, speed: 2 } });
  await expect.poll(() => particles.evaluateAll(elements => elements.every(element =>
    element.getAnimations()[0]?.playbackRate === 2,
  ))).toBe(true);
  const saved = await particles.first().evaluateHandle(element => element.getAnimations()[0]);
  const header = page.getByRole("banner");
  const menu = header.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await header.getByRole("button", { name: "Theme selector", exact: true }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "VSCode Dark", exact: true }).click();
  await expect.poll(() => saved.evaluate(animation => animation.playState)).toBe("idle");
  await saved.dispose();
});

test("all six primitives retain their configured paths, rotation and opacity", async ({ page }) => {
  const kinds = ["stars", "streaks", "matrix", "orbs", "grid", "waves"] as const;
  const particles = await openBackground(page, {
    layers: kinds.map(kind => ({
      id: kind, kind, count: 1, opacity: 0.8, rotation: 30,
      duration: { min: 20, max: 20 }, travel: { x: 20, y: 10 },
    })),
  }, kinds.length);
  await clickGuideControl(page, "Pause guide animations");
  await expectStationary(particles);
  const positions = await particles.evaluateAll(elements => elements.map(element => {
    const animation = element.getAnimations()[0];
    animation.currentTime = 5000;
    const style = getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return {
      kind: element.getAttribute("data-background-particle"), opacity: Number(style.opacity),
      x: matrix.e / window.innerWidth, y: matrix.f / window.innerHeight,
      rotation: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
      duration: animation.effect?.getTiming().duration,
    };
  }));
  for (const position of positions) {
    const oscillating = ["orbs", "grid", "waves"].includes(position.kind ?? "");
    expect(position.x).toBeCloseTo(oscillating ? 0.1 : -0.05, 4);
    expect(position.y).toBeCloseTo(oscillating ? 0.05 : -0.025, 4);
    expect(position.opacity).toBeCloseTo(0.4, 4);
    expect(position.rotation).toBeCloseTo(30, 3);
    expect(position.duration).toBe(20_000);
  }
});
