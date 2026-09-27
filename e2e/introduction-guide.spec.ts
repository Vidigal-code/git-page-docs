import { test, expect, type Page } from "@playwright/test";

/** Themes with light, dark and a white-primary palette: the backdrop and reveal must work in all. */
const THEMES = ["aurora-dark", "emerald-light", "carbon-dark"] as const;
const MAX_OVERFLOW_PX = 2;

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
}

/**
 * The guide only exists in repository-search builds; the default E2E server runs
 * the local docs mode, where the route is a 404. Run this spec against
 * `GITPAGEDOCS_REPOSITORY_SEARCH=true pnpm dev` (reused through PORT).
 */
async function openGuide(page: Page, theme: string): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  const response = await page.goto(`/introduction-guide?theme=${theme}`);
  test.skip(response?.status() === 404, "The introduction guide requires GITPAGEDOCS_REPOSITORY_SEARCH=true.");
  await expect(page.getByTestId("guide-parallax-backdrop")).toBeAttached();
  return errors;
}

test.describe("introduction guide motion", () => {
  for (const theme of THEMES) {
    test(`renders the parallax guide without errors or horizontal overflow (${theme})`, async ({ page }) => {
      const errors = await openGuide(page, theme);

      const backdrop = page.getByTestId("guide-parallax-backdrop");
      await expect(backdrop).toHaveAttribute("aria-hidden", "true");
      await expect(backdrop.locator("[data-parallax-layer]")).toHaveCount(3);

      // Scroll through the whole guide: every section must end up fully visible.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const lastSection = page.locator("section[id]").last();
      await lastSection.scrollIntoViewIfNeeded();
      await expect.poll(() => lastSection.evaluate((el) => getComputedStyle(el.parentElement as Element).opacity)).toBe("1");

      await expect.poll(() => horizontalOverflow(page), { timeout: 10_000 }).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
      expect(errors, errors.join("\n")).toHaveLength(0);
    });
  }

  test("keeps every section static and visible when the visitor prefers reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await openGuide(page, THEMES[0]);

    const sections = page.locator("section[id]");
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const section = sections.nth(index);
      await section.scrollIntoViewIfNeeded();
      // Snaps into its final state: fully opaque, no leftover offset.
      await expect
        .poll(() => section.evaluate((el) => {
          const style = getComputedStyle(el.parentElement as Element);
          return `${style.opacity}|${style.transform}`;
        }))
        .toBe("1|none");
    }
    const layerTransforms = await page
      .locator("[data-parallax-layer]")
      .evaluateAll((layers) => layers.map((layer) => getComputedStyle(layer).transform));
    expect(new Set(layerTransforms)).toEqual(new Set(["none"]));

    // The hero content neither drifts nor fades after scrolling past it.
    const heroContent = page.getByRole("heading", { level: 1 }).locator("..");
    const heroStyle = await heroContent.evaluate((el) => {
      const style = getComputedStyle(el);
      return `${style.opacity}|${style.transform}`;
    });
    expect(heroStyle).toBe("1|none");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});

/** A chapter above this opacity counts as the one on stage. */
const VISIBLE_CHAPTER_OPACITY = 0.5;

/** Scrolls to a share (0..1) of the story's scrollable distance. */
async function scrollStoryTo(page: Page, fraction: number): Promise<void> {
  await page.getByTestId("guide-story").evaluate((story, share) => {
    const top = story.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (story.offsetHeight - window.innerHeight) * share);
  }, fraction);
}

/** Ids of the chapters currently shown on the stage. */
async function visibleChapters(page: Page): Promise<string[]> {
  return page.locator("[data-story-chapter]").evaluateAll(
    (chapters, threshold) =>
      chapters
        .filter((chapter) => Number(getComputedStyle(chapter).opacity) > threshold)
        .map((chapter) => chapter.getAttribute("data-story-chapter") ?? ""),
    VISIBLE_CHAPTER_OPACITY,
  );
}

test.describe("introduction guide scroll story", () => {
  for (const theme of THEMES) {
    test(`plays one chapter at a time while the page scrolls (${theme})`, async ({ page }) => {
      const errors = await openGuide(page, theme);
      const counter = page.getByTestId("guide-story-counter");
      const chapters = page.locator("[data-story-chapter]");
      const total = await chapters.count();
      expect(total).toBeGreaterThan(1);

      await scrollStoryTo(page, 0);
      await expect.poll(() => visibleChapters(page)).toHaveLength(1);
      await expect(counter).toHaveText(/^01 \/ /);

      // The middle of the second chapter's slice shows only that chapter.
      await scrollStoryTo(page, 1.5 / total);
      const second = await chapters.nth(1).getAttribute("data-story-chapter");
      await expect.poll(() => visibleChapters(page)).toEqual([second]);
      await expect(counter).toHaveText(/^02 \/ /);
      // The rail marks exactly that chapter as the current step (hidden, not removed, on narrow screens).
      const current = page.getByTestId("guide-story").locator('button[aria-current="step"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(await chapters.nth(1).getByRole("heading").innerText());

      await expect.poll(() => horizontalOverflow(page), { timeout: 10_000 }).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
      expect(errors, errors.join("\n")).toHaveLength(0);
    });
  }

  test("jumps to a chapter from the rail and skips to the full guide", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openGuide(page, THEMES[0]);
    const chapters = page.locator("[data-story-chapter]");
    const target = await chapters.nth(2).getAttribute("data-story-chapter");
    await page.getByTestId("guide-story").getByRole("navigation").getByRole("button").nth(2).click();
    await expect.poll(() => visibleChapters(page)).toEqual([target]);

    await page.getByTestId("guide-story").getByRole("link").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#guide-body$/);
  });

  test("renders the chapters as a static list when the visitor prefers reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await openGuide(page, THEMES[0]);
    const styles = await page.locator("[data-story-chapter]").evaluateAll((chapters) =>
      chapters.map((chapter) => `${getComputedStyle(chapter).position}|${getComputedStyle(chapter).opacity}`),
    );
    expect(new Set(styles)).toEqual(new Set(["relative|1"]));
    await expect(page.getByTestId("guide-story-counter")).toBeHidden();
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
