import { expect, test } from "@playwright/test";

const VIEWPORT_HEIGHT = 900;
const TALL_VIEWPORT_HEIGHT = 1200;
const GEOMETRY_TOLERANCE_PX = 1;
const DESKTOP_WIDTH = 1280;
const DESKTOP_BREAKPOINT = 1025;
const SIDE_BY_SIDE_BREAKPOINT = 768;
const READING_BAND_TOP = 100;
const SHORT_VIEWPORT_HEIGHT = 480;
const LONG_DOCUMENT_ID = 13;
const CONFIGURED_GUIDE_HEIGHT_PX = 500;
const PREVIOUS_GUIDE_HEIGHT_LIMIT_PX = 400;
const MINIMUM_LONG_GUIDE_LINKS = 12;
const ACTIVE_GUIDE_READING_BAND_TOP = 84;
const MANUAL_GUIDE_SCROLL_PX = 80;

function isGuideEntryVisible(link: HTMLElement): boolean {
  const itemBounds = link.getBoundingClientRect();
  const scrollBounds = link.closest("nav")!.parentElement!.getBoundingClientRect();
  return itemBounds.top >= scrollBounds.top && itemBounds.bottom <= scrollBounds.bottom;
}


test("desktop table of contents fits its entries without changing smaller layouts", async ({ page }, testInfo) => {
  await page.goto("/?lang=en&menu=en&id=2", { waitUntil: "domcontentloaded" });
  const aside = page.getByRole("complementary", { name: "Table of contents", exact: true });
  await expect(aside).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const measurements = [];
  for (const width of [344, 768, 1024, DESKTOP_WIDTH]) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await expect(aside).toBeVisible();
    const geometry = await aside.evaluate(element => {
      const navigation = element.querySelector("nav");
      if (!navigation) throw new Error("Expected the visible table of contents navigation");
      const box = element.getBoundingClientRect();
      const wrapperBox = element.parentElement!.getBoundingClientRect();
      const style = getComputedStyle(element);
      const navStyle = getComputedStyle(navigation);
      const link = navigation.querySelector("a");
      if (!link) throw new Error("Expected a visible table of contents entry");
      const linkStyle = getComputedStyle(link);
      const intrinsicHeight = navigation.getBoundingClientRect().height
        + Number.parseFloat(navStyle.marginTop) + Number.parseFloat(navStyle.marginBottom)
        + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
        + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
      return {
        wrapperHeight: wrapperBox.height, wrapperWidth: wrapperBox.width, asidePosition: style.position,
        width: window.innerWidth, asideHeight: box.height, asideWidth: box.width, intrinsicHeight,
        linkPadding: linkStyle.padding, linkPosition: linkStyle.position,
        indicatorContent: getComputedStyle(link, "::before").content,
        alignSelf: style.alignSelf, direction: getComputedStyle(element.parentElement!).flexDirection,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    measurements.push(geometry);
    await page.screenshot({ path: testInfo.outputPath(`toc-height-${width}.png`) });
  }
  await testInfo.attach("toc-geometry", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
  const desktop = measurements.find(measurement => measurement.width === DESKTOP_WIDTH)!;
  expect(Math.abs(desktop.asideHeight - desktop.intrinsicHeight)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
  expect(desktop.asidePosition).toBe("sticky");
  for (const measurement of measurements) {
    expect(measurement.overflow).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
    if (measurement.width >= DESKTOP_BREAKPOINT) continue;
    expect(measurement.alignSelf).toBe("auto");
    expect(measurement.asidePosition).toBe("static");
    expect(measurement.linkPosition).toBe("static");
    expect(measurement.indicatorContent).toBe("none");
    if (measurement.width < SIDE_BY_SIDE_BREAKPOINT) {
      expect(measurement.direction).toBe("column");
      expect(measurement.linkPadding).toBe("6.4px 12px");
      expect(Math.abs(measurement.asideWidth - measurement.wrapperWidth)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
      expect(Math.abs(measurement.asideHeight - measurement.intrinsicHeight)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
    } else {
      expect(measurement.direction).toBe("row");
      expect(measurement.linkPadding).toBe("4px 0px");
      expect(Math.abs(measurement.asideHeight - measurement.wrapperHeight)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
    }
  }
});

test("desktop table of contents marks the section reached by document scrolling", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: VIEWPORT_HEIGHT });
  await page.goto("/?lang=en&menu=en&id=2", { waitUntil: "domcontentloaded" });
  const guide = page.getByRole("navigation", { name: "Table of contents", exact: true });
  await expect(guide).toBeVisible();
  const article = page.getByRole("main").locator("article").first();
  const firstLink = guide.getByRole("link", { name: "Project Overview", exact: true });
  const secondLink = guide.getByRole("link", { name: "Monorepo packages", exact: true });
  await article.getByRole("heading", { name: "Project Overview", exact: true }).evaluate((heading, top) => {
    window.scrollBy({ top: heading.getBoundingClientRect().top - top, behavior: "instant" });
  }, READING_BAND_TOP);
  await expect(firstLink).toHaveCSS("font-weight", "600");
  await expect.poll(() => firstLink.evaluate(link => {
    const indicator = getComputedStyle(link, "::before");
    return indicator.content !== "none"
      && Number.parseFloat(indicator.width) > 0
      && Number.parseFloat(indicator.height) > 0
      && indicator.backgroundColor === getComputedStyle(link).color;
  })).toBe(true);
  await article.getByRole("heading", { name: "Monorepo packages", exact: true }).evaluate((heading, top) => {
    window.scrollBy({ top: heading.getBoundingClientRect().top - top, behavior: "instant" });
  }, READING_BAND_TOP);
  await expect(secondLink).toHaveCSS("font-weight", "600");
  await expect.poll(() => secondLink.evaluate(link => getComputedStyle(link, "::before").content)).not.toBe("none");
  await expect.poll(() => firstLink.evaluate(link => getComputedStyle(link, "::before").content)).toBe("none");
  const activeBounds = await secondLink.boundingBox();
  const headerBounds = await page.getByRole("banner").boundingBox();
  expect(activeBounds).not.toBeNull();
  expect(headerBounds).not.toBeNull();
  await testInfo.attach("active-indicator-geometry", {
    body: JSON.stringify({ activeBounds, headerBounds }), contentType: "application/json",
  });
  await page.screenshot({ path: testInfo.outputPath("toc-active-indicator.png") });
  expect(activeBounds!.y).toBeGreaterThanOrEqual(headerBounds!.y + headerBounds!.height);
  expect(activeBounds!.y + activeBounds!.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
});

test("long desktop guide fills its content and scrolls only when the viewport is shorter", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: TALL_VIEWPORT_HEIGHT });
  await page.goto("/?lang=en&menu=en&id=" + LONG_DOCUMENT_ID, { waitUntil: "domcontentloaded" });
  const aside = page.getByRole("complementary", { name: "Table of contents", exact: true });
  const guide = aside.getByRole("navigation", { name: "Table of contents", exact: true });
  await expect(aside).toBeVisible();
  await expect.poll(() => guide.getByRole("link").count()).toBeGreaterThan(MINIMUM_LONG_GUIDE_LINKS);
  await page.evaluate(() => document.fonts.ready);
  const measurements = [];
  for (const height of [TALL_VIEWPORT_HEIGHT, SHORT_VIEWPORT_HEIGHT]) {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height });
    await page.getByRole("main").locator("article h2").nth(3).evaluate((heading, top) => {
      window.scrollBy({ top: heading.getBoundingClientRect().top - top, behavior: "instant" });
    }, READING_BAND_TOP);
    const geometry = await aside.evaluate((element, tolerance) => {
      const navigation = element.querySelector<HTMLElement>("nav");
      if (!navigation?.parentElement) throw new Error("Expected the rendered guide navigation");
      const scrollport = navigation.parentElement;
      const asideBox = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const navStyle = getComputedStyle(navigation);
      const intrinsicAsideHeight = navigation.getBoundingClientRect().height
        + Number.parseFloat(navStyle.marginTop) + Number.parseFloat(navStyle.marginBottom)
        + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
        + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
      const header = document.querySelector("header");
      if (!header) throw new Error("Expected the documentation header");
      return {
        viewportHeight: window.innerHeight,
        asideHeight: asideBox.height,
        asideTop: asideBox.top,
        asideBottom: asideBox.bottom,
        intrinsicAsideHeight,
        headerBottom: header.getBoundingClientRect().bottom,
        scrollportHeight: scrollport.clientHeight,
        scrollportContentHeight: scrollport.scrollHeight,
        verticalScrollports: [element, ...element.querySelectorAll<HTMLElement>("*")].filter(candidate =>
          candidate.scrollHeight > candidate.clientHeight + tolerance
          && ["auto", "scroll"].includes(getComputedStyle(candidate).overflowY)
        ).length,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    }, GEOMETRY_TOLERANCE_PX);
    measurements.push(geometry);
    await testInfo.attach("long-guide-" + height, { body: JSON.stringify(geometry), contentType: "application/json" });
    await page.screenshot({ path: testInfo.outputPath("long-guide-" + height + ".png") });
    expect(geometry.asideTop).toBeGreaterThanOrEqual(geometry.headerBottom - GEOMETRY_TOLERANCE_PX);
    expect(geometry.asideBottom).toBeLessThanOrEqual(height + GEOMETRY_TOLERANCE_PX);
    expect(geometry.documentOverflow).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
    if (height === TALL_VIEWPORT_HEIGHT) {
      expect(geometry.intrinsicAsideHeight).toBeGreaterThan(PREVIOUS_GUIDE_HEIGHT_LIMIT_PX);
      expect(geometry.intrinsicAsideHeight).toBeLessThanOrEqual(height - geometry.asideTop);
      expect(geometry.verticalScrollports).toBe(0);
      expect(geometry.scrollportHeight).toBeGreaterThan(PREVIOUS_GUIDE_HEIGHT_LIMIT_PX);
      expect(Math.abs(geometry.asideHeight - geometry.intrinsicAsideHeight)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
    } else {
      expect(geometry.scrollportContentHeight).toBeGreaterThan(geometry.scrollportHeight);
      expect(geometry.verticalScrollports).toBe(1);
    }
    const lastLink = guide.getByRole("link").last();
    await lastLink.scrollIntoViewIfNeeded();
    await expect(lastLink).toBeInViewport();
  }
  await testInfo.attach("long-guide-measurements", { body: JSON.stringify(measurements), contentType: "application/json" });
});

test("desktop guide reveals its active entry locally and retains it after a shorter viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: VIEWPORT_HEIGHT });
  await page.goto("/?lang=en&menu=en&id=13", { waitUntil: "domcontentloaded" });
  const guide = page.getByRole("navigation", { name: "Table of contents", exact: true });
  const activeLink = guide.getByRole("link", { name: "Site behavior and defaults", exact: true });
  await expect(guide).toBeVisible();
  await page.getByRole("main").evaluate((main, height) => {
    main.style.setProperty("--toc-scroll-max-height-desktop", height + "px");
  }, CONFIGURED_GUIDE_HEIGHT_PX);
  const target = page.getByRole("main").locator("article").getByRole("heading", { name: "Site behavior and defaults", exact: true });
  const expectedWindowScroll = await target.evaluate((heading, top) => {
    window.scrollBy({ top: heading.getBoundingClientRect().top - top, behavior: "instant" });
    return window.scrollY;
  }, ACTIVE_GUIDE_READING_BAND_TOP);
  await expect(activeLink).toHaveCSS("font-weight", "600");
  for (const height of [VIEWPORT_HEIGHT, SHORT_VIEWPORT_HEIGHT]) {
    await page.setViewportSize({ width: DESKTOP_WIDTH, height });
    await expect.poll(() => activeLink.evaluate(isGuideEntryVisible)).toBe(true);
    await expect(activeLink).toHaveAttribute("aria-current", "location");
    expect(Math.abs(await page.evaluate(() => window.scrollY) - expectedWindowScroll)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
    await testInfo.attach("active-reveal-" + height, {
      body: JSON.stringify(await activeLink.evaluate(link => ({
        link: link.getBoundingClientRect().toJSON(),
        scrollport: link.closest("nav")!.parentElement!.getBoundingClientRect().toJSON(),
        scrollTop: link.closest("nav")!.parentElement!.scrollTop,
        windowScrollY: window.scrollY,
      }))),
      contentType: "application/json",
    });
  }
});

test("guide preserves manual scrolling below desktop and reveals the active entry on entering desktop", async ({ page }, testInfo) => {
  await page.goto("/?lang=en&menu=en&id=13", { waitUntil: "domcontentloaded" });
  const guide = page.getByRole("navigation", { name: "Table of contents", exact: true });
  await expect(guide).toBeVisible();
  const article = page.getByRole("main").locator("article");
  const firstHeadingName = "Site behavior and defaults";
  const lastHeadingName = "Adding a version or document";
  const lastLink = guide.getByRole("link", { name: lastHeadingName, exact: true });
  for (const width of [344, 768, 1024]) {
    await page.setViewportSize({ width, height: SHORT_VIEWPORT_HEIGHT });
    await article.getByRole("heading", { name: firstHeadingName, exact: true }).evaluate((heading, top) => {
      window.scrollBy({ top: heading.getBoundingClientRect().top - top, behavior: "instant" });
    }, ACTIVE_GUIDE_READING_BAND_TOP);
    await expect(guide.getByRole("link", { name: firstHeadingName, exact: true })).toHaveAttribute("aria-current", "location");
    const before = await guide.evaluate((navigation, manualScroll) => {
      navigation.scrollTop = manualScroll;
      navigation.parentElement!.scrollTop = manualScroll;
      return { navigation: navigation.scrollTop, parent: navigation.parentElement!.scrollTop };
    }, MANUAL_GUIDE_SCROLL_PX);
    await article.getByRole("heading", { name: lastHeadingName, exact: true }).evaluate((heading, top) => {
      window.scrollBy({ top: heading.getBoundingClientRect().top - top, behavior: "instant" });
    }, ACTIVE_GUIDE_READING_BAND_TOP);
    await expect(lastLink).toHaveAttribute("aria-current", "location");
    const after = await guide.evaluate(navigation => ({
      navigation: navigation.scrollTop, parent: navigation.parentElement!.scrollTop,
    }));
    expect(after).toEqual(before);
    await testInfo.attach("manual-guide-scroll-" + width, {
      body: JSON.stringify({ before, after }), contentType: "application/json",
    });
  }
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: SHORT_VIEWPORT_HEIGHT });
  await expect.poll(() => lastLink.evaluate(isGuideEntryVisible)).toBe(true);
});
