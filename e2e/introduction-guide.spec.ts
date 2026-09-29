import { test, expect, type Locator, type Page } from "@playwright/test";

/** Themes with light, dark and a white-primary palette: the backdrop and reveal must work in all. */
const THEMES = ["aurora-dark", "emerald-light", "carbon-dark"] as const;
const MAX_OVERFLOW_PX = 2;
/** WCAG AA contrast for normal-size text (button labels are 0.95rem, below the "large text" size). */
const MIN_TEXT_CONTRAST = 4.5;
/** Hydration plus the hero entrance; generous because the dev server compiles on demand. */
const ENTRANCE_SETTLE_TIMEOUT_MS = 15_000;
/** A pinned chapter should use at least this share of the stage height (no empty half). */
const MIN_CHAPTER_HEIGHT_SHARE = 0.55;
/** A landscape phone: short enough for the tour's stacked-list fallback. */
const LANDSCAPE_PHONE = { width: 844, height: 390 };
/** Wide enough for the back-to-top arrow to sit in the right margin. */
const WIDE_DESKTOP = { width: 1920, height: 960 };

/** WCAG contrast ratio between an element's text colour and its own background. */
async function textContrast(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const channels = (rgb: string) => (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = (rgb: string) => {
      const [r, g, b] = channels(rgb).map((value) => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const style = getComputedStyle(el);
    const [light, dark] = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
  });
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
}

/**
 * The guide only exists in repository-search builds, so this spec runs in the
 * `guide-*` Playwright projects against the repository-search dev server.
 */
async function openGuide(page: Page, theme: string): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  // React reports server/client markup mismatches on the console, not as page errors.
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) errors.push(message.text());
  });
  const response = await page.goto(`/introduction-guide?theme=${theme}`);
  expect(response?.ok()).toBe(true);
  await expect(page.getByTestId("guide-parallax-backdrop")).toBeAttached();
  // The static HTML ships the hero hidden until the client runs its entrance: once
  // the last row is fully shown the page is hydrated and settled.
  await expect
    .poll(() => page.locator("[data-hero-row]").last().evaluate((row) => getComputedStyle(row).opacity), {
      timeout: ENTRANCE_SETTLE_TIMEOUT_MS,
    })
    .toBe("1");
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

    // The hero rows never drift (only the whole block fades, which is not motion).
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

  test("crossfades chapters without moving anything when the visitor prefers reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = await openGuide(page, THEMES[0]);
    const chapters = page.locator("[data-story-chapter]");
    const total = await chapters.count();

    // Still one chapter on stage at a time, driven by the scroll...
    await scrollStoryTo(page, 1.5 / total);
    const second = await chapters.nth(1).getAttribute("data-story-chapter");
    await expect.poll(() => visibleChapters(page)).toEqual([second]);
    await expect(page.getByTestId("guide-story-counter")).toHaveText(/^02 \/ /);

    // ...but no layer travels or zooms.
    const transforms = await chapters
      .nth(1)
      .locator(":scope > *, li, p")
      .evaluateAll((layers) => layers.map((layer) => getComputedStyle(layer).transform));
    expect(new Set(transforms)).toEqual(new Set(["none"]));
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});

test.describe("introduction guide theme preload", () => {
  test("paints a cached theme before hydration without a hydration mismatch", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat/i.test(message.text())) hydrationErrors.push(message.text());
    });
    // The first visit caches the theme catalogue; the reload runs the preload script with it.
    await openGuide(page, THEMES[0]);
    await expect.poll(() => page.evaluate(() => Object.keys(localStorage).length)).toBeGreaterThan(0);
    hydrationErrors.length = 0;
    await page.reload();
    await expect(page.getByTestId("guide-story")).toBeAttached();

    await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--primary"))).not.toBe("");
    expect(hydrationErrors, hydrationErrors.join("\n")).toHaveLength(0);
  });
});

test.describe("introduction guide hero", () => {
  for (const theme of THEMES) {
    test(`lines up both calls to action with one shared style (${theme})`, async ({ page }) => {
      await openGuide(page, theme);
      const actions = page.locator("[data-hero-action]");
      await expect(actions).toHaveCount(2);

      const boxes = await actions.evaluateAll((elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return { height: Math.round(rect.height), font: `${style.fontFamily}|${style.fontSize}|${style.fontWeight}` };
        }),
      );
      expect(boxes[0].height).toBe(boxes[1].height);
      expect(boxes[0].font).toBe(boxes[1].font);

      // The primary action takes its text colour from the theme's contrast token, so it stays legible
      // on any primary (including white ones).
      // Poll: the button's background eases between themes, so a single read can land mid-transition.
      await expect.poll(() => textContrast(actions.first())).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });
  }

  test("keeps the story skip link out of sight until it receives keyboard focus", async ({ page }) => {
    await openGuide(page, THEMES[0]);
    const skip = page.getByTestId("guide-story").getByRole("link");
    const hidden = await skip.boundingBox();
    expect(hidden?.width).toBeLessThanOrEqual(1);

    await skip.focus();
    const shown = await skip.boundingBox();
    expect(shown?.width).toBeGreaterThan(1);
    await expect(skip).toBeInViewport();
  });

  test("reads the animated title as one heading", async ({ page }) => {
    await openGuide(page, THEMES[0]);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveAccessibleName(/\S/);
    const glyphs = await heading.locator("[data-hero-glyph]").count();
    expect(glyphs).toBeGreaterThan(1);
  });
});

test.describe("introduction guide layout", () => {
  test("fills the first screen with the hero, so the tour starts below the fold", async ({ page }) => {
    await openGuide(page, THEMES[0]);
    const storyTop = await page.getByTestId("guide-story").evaluate((story) => story.getBoundingClientRect().top);
    const viewportHeight = page.viewportSize()?.height ?? 0;
    expect(storyTop).toBeGreaterThanOrEqual(viewportHeight - MAX_OVERFLOW_PX);
  });

  test("lets a pinned chapter fill most of the stage height", async ({ page }) => {
    await openGuide(page, THEMES[0]);
    const total = await page.locator("[data-story-chapter]").count();
    await scrollStoryTo(page, 5.5 / total);
    await expect.poll(() => visibleChapters(page)).toHaveLength(1);

    const share = await page.evaluate(() => {
      const stage = document.querySelector("[data-testid=guide-story] > div") as HTMLElement;
      const chapter = [...document.querySelectorAll("[data-story-chapter]")].find((node) => Number(getComputedStyle(node).opacity) > 0.5) as HTMLElement;
      const boxes = [...chapter.querySelectorAll("span, h2, p, li")].map((node) => node.getBoundingClientRect()).filter((box) => box.height > 0);
      const used = Math.max(...boxes.map((box) => box.bottom)) - Math.min(...boxes.map((box) => box.top));
      return used / stage.getBoundingClientRect().height;
    });
    expect(share).toBeGreaterThanOrEqual(MIN_CHAPTER_HEIGHT_SHARE);
  });

  test("takes the reader from the end of the guide back to the top", async ({ page }) => {
    await openGuide(page, THEMES[0]);
    const backToTop = page.getByRole("button", { name: /top|topo|arriba/i });
    await backToTop.scrollIntoViewIfNeeded();
    await expect(backToTop).toBeInViewport();

    await backToTop.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("#guide-top")).toBeFocused();
  });

  test("puts the back-to-top arrow beside the guide, level with its last content and sized like the section icons", async ({ page }) => {
    await page.setViewportSize(WIDE_DESKTOP);
    await openGuide(page, THEMES[0]);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const button = page.getByRole("button", { name: /top|topo|arriba/i });
    await expect(button).toBeInViewport();
    // The last section rises into place when it is revealed; measure once it has settled.
    const lastSection = page.locator("#guide-body section[id]").last();
    await expect.poll(() => lastSection.evaluate((el) => getComputedStyle(el.parentElement as Element).transform)).toBe("none");

    const layout = await page.evaluate(() => {
      const body = document.querySelector("#guide-body") as HTMLElement;
      const section = [...body.querySelectorAll("section[id]")].at(-1) as HTMLElement;
      const lastBlock = (section.lastElementChild as HTMLElement).getBoundingClientRect();
      const icon = (section.querySelector("[class*=sectionIcon]") as HTMLElement).getBoundingClientRect();
      const arrow = (document.querySelector("[data-testid=guide-back-to-top] button") as HTMLElement).getBoundingClientRect();
      return {
        besideGuide: arrow.left >= body.getBoundingClientRect().right,
        bottomGap: Math.abs(arrow.bottom - lastBlock.bottom),
        sameSize: Math.round(arrow.width) === Math.round(icon.width) && Math.round(arrow.height) === Math.round(icon.height),
      };
    });
    expect(layout.besideGuide).toBe(true);
    expect(layout.bottomGap).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
    expect(layout.sameSize).toBe(true);
    await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
  });

  test("stacks the tour as a list on short landscape screens, with nothing clipped", async ({ page }) => {
    await page.setViewportSize(LANDSCAPE_PHONE);
    await openGuide(page, THEMES[0]);
    const chapters = page.locator("[data-story-chapter]");
    const count = await chapters.count();
    for (let index = 0; index < count; index += 1) {
      const chapter = chapters.nth(index);
      await chapter.scrollIntoViewIfNeeded();
      await expect(chapter).toHaveCSS("opacity", "1");
      await expect(chapter.getByRole("heading")).toBeInViewport();
    }
    await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(MAX_OVERFLOW_PX);
  });
});
