import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const PAGINATED_PAGE_URL = "/v/0.0.13/?lang=en&menu=en&id=50";
const FIRST_LESSON = "Lesson 1: try the controls";
const FIRST_DESCRIPTION = "Three files in one Markdown container.";
const GEOMETRY_TOLERANCE = 2;
const MOBILE_VIEWPORT = { width: 320, height: 882 };
const CONTAINER_INDEX = { md: 0, html: 1, video: 2, audio: 3, pdf: 4 } as const;

async function expectBottomRight(pages: Locator, content: Locator): Promise<void> {
  await expect.poll(async () => {
    const [navigation, body, last] = await Promise.all([
      pages.boundingBox(), content.boundingBox(), pages.getByRole("button", { name: "Last page", exact: true }).boundingBox(),
    ]);
    if (!navigation || !body || !last) return { below: false, right: false };
    return {
      below: navigation.y >= body.y + body.height - GEOMETRY_TOLERANCE,
      right: Math.abs(last.x + last.width - navigation.x - navigation.width) <= GEOMETRY_TOLERANCE,
    };
  }).toEqual({ below: true, right: true });
}

async function openPaginatedPage(page: Page): Promise<Locator> {
  await page.goto(PAGINATED_PAGE_URL, { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  await expect(main.getByText(FIRST_LESSON, { exact: true })).toBeVisible();
  return main;
}

test("five containers page independently with bottom-right controls and replace their selected files", async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize(MOBILE_VIEWPORT);
  const main = await openPaginatedPage(page);
  const pages = main.getByRole("navigation", { name: "Pages", exact: true });
  await expect(pages).toHaveCount(5);
  const bodies = await main.getByRole("article").all();
  expect(bodies).toHaveLength(5);
  await expect(main.locator('iframe[title="HTML content"]').contentFrame().getByRole("heading", { name: "First HTML file", exact: true })).toBeVisible();
  await expect(main.locator('iframe[title="Project guide"]')).toBeVisible();
  for (const [index, body] of bodies.entries()) {
    const controls = pages.nth(index);
    await expect(body).toBeVisible();
    await expect(controls.getByRole("button")).toHaveCount(4);
    await expect(controls.getByRole("status")).toHaveText(index === CONTAINER_INDEX.md ? "Pages 1 / 3" : "Pages 1 / 2");
    await expect(controls.getByRole("button", { name: "First page", exact: true })).toBeDisabled();
    await expect(controls.getByRole("button", { name: "Previous page", exact: true })).toBeDisabled();
    await expectBottomRight(controls, body);
  }
  const markdown = pages.nth(CONTAINER_INDEX.md);
  await markdown.getByRole("button", { name: "Last page", exact: true }).click();
  await expect(main.getByRole("heading", { name: "Configuration", exact: true })).toBeVisible();
  await expect(markdown.getByRole("status")).toHaveText("Pages 3 / 3");
  await expect(markdown.getByRole("button", { name: "Next page", exact: true })).toBeDisabled();
  await expect(markdown.getByRole("button", { name: "Last page", exact: true })).toBeDisabled();
  await markdown.getByRole("button", { name: "Previous page", exact: true }).click();
  await expect(main.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await markdown.getByRole("button", { name: "First page", exact: true }).click();
  await expect(main.getByRole("heading", { name: FIRST_LESSON, exact: true })).toBeVisible();
  await pages.nth(CONTAINER_INDEX.html).getByRole("button", { name: "Next page", exact: true }).click();
  await expect(main.locator('iframe[title="HTML content"]').contentFrame().getByRole("heading", { name: "Second HTML file", exact: true })).toBeVisible();
  await expect(main.getByRole("heading", { name: "HTML: second file", exact: true })).toBeVisible();
  await expect(main.getByTestId("route-video")).toHaveAttribute("src", /flower\.mp4$/);
  await pages.nth(CONTAINER_INDEX.video).getByRole("button", { name: "Next page", exact: true }).click();
  await expect(main.getByTestId("route-video")).toHaveAttribute("src", /flower\.webm$/);
  await expect(main.getByRole("heading", { name: "Flower video: WebM", exact: true })).toBeVisible();
  const audio = main.locator("audio");
  await expect(audio).toHaveAttribute("src", /pagination-low\.wav$/);
  await expect.poll(() => audio.evaluate((element: HTMLMediaElement) => element.readyState)).toBeGreaterThanOrEqual(2);
  await main.getByTestId("audio-route-toggle").click();
  await expect.poll(() => audio.evaluate((element: HTMLMediaElement) => element.paused)).toBe(false);
  await pages.nth(CONTAINER_INDEX.audio).getByRole("button", { name: "Next page", exact: true }).click();
  await expect(audio).toHaveAttribute("src", /pagination-high\.wav$/);
  await expect.poll(() => audio.evaluate((element: HTMLMediaElement) => element.paused)).toBe(true);
  await expect(main.getByRole("heading", { name: "High tone", exact: true })).toBeVisible();
  await pages.nth(CONTAINER_INDEX.pdf).getByRole("button", { name: "Next page", exact: true }).click();
  await expect(main.locator('iframe[title="Pagination quick reference"]')).toBeVisible();
  await expect(main.getByText("A second PDF in the same container.", { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await main.getByRole("button", { name: "Download PDF", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("pagination-reference.pdf");
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  expect(await readFile(downloadedPath!)).toEqual(await readFile("cli/content/assets/pagination-reference.pdf"));
  await expect(pages.getByRole("status")).toHaveText(["Pages 1 / 3", "Pages 2 / 2", "Pages 2 / 2", "Pages 2 / 2", "Pages 2 / 2"]);
  await expect.poll(() => main.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE);
  await expect.poll(() => page.locator("html").evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(GEOMETRY_TOLERANCE);
});

test("keyboard navigation keeps focus on the container control after changing a file", async ({ page }) => {
  const main = await openPaginatedPage(page);
  const pages = main.getByRole("navigation", { name: "Pages", exact: true }).first();
  const next = pages.getByRole("button", { name: "Next page", exact: true });
  await next.focus();
  await next.press("Enter");
  await expect(pages.getByRole("status")).toHaveText("Pages 2 / 3");
  await expect(next).toBeFocused();
});

test("Ctrl+K opens each indexed file inside its owner page", async ({ page }) => {
  await page.goto("/v/0.0.13/?lang=en&menu=en&id=1", { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  await expect(main.getByRole("article").getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  const entries = [
    { title: "Lesson 3: configuration", index: CONTAINER_INDEX.md, status: "Pages 3 / 3" },
    { title: "HTML: second file", index: CONTAINER_INDEX.html, status: "Pages 2 / 2" },
    { title: "Flower video: WebM", index: CONTAINER_INDEX.video, status: "Pages 2 / 2" },
    { title: "High tone", index: CONTAINER_INDEX.audio, status: "Pages 2 / 2" },
    { title: "Pagination quick reference", index: CONTAINER_INDEX.pdf, status: "Pages 2 / 2" },
  ];
  for (const entry of entries) {
    await page.keyboard.press("Control+k");
    const input = page.getByPlaceholder("Type to navigate...");
    await input.fill(entry.title);
    await expect(input).toHaveValue(entry.title);
    const results = page.locator('[class*="quickNavList"]').getByRole("button");
    await expect(results).toHaveCount(1);
    await expect(results).toContainText("Paginated containers example");
    await expect(results).toContainText(entry.title);
    await input.press("Enter");
    await expect(input).toBeHidden();
    await expect(main.getByRole("heading", { name: entry.title, exact: true })).toBeVisible();
    await expect(main.getByRole("navigation", { name: "Pages", exact: true }).nth(entry.index).getByRole("status")).toHaveText(entry.status);
    await expect.poll(() => new URL(page.url()).searchParams.get("id")).toBe("50");
  }
});

test("Ctrl+K preserves immediate typing and Enter navigation to the selected file", async ({ page }) => {
  await page.goto("/v/0.0.13/?lang=en&menu=en&id=1", { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");
  await expect(main.getByRole("article").getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await page.keyboard.press("Control+k");
  const input = page.getByPlaceholder("Type to navigate...");
  await input.fill("Lesson 3: configuration");
  await input.press("Enter");
  await expect(input).toBeHidden();
  await expect(main.getByRole("heading", { name: "Lesson 3: configuration", exact: true })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("id")).toBe("50");
});

test("focus preserves the selected Markdown metadata and marker while changing container pages", async ({ page, isMobile }) => {
  const main = await openPaginatedPage(page);
  await expect(main.getByText(FIRST_DESCRIPTION, { exact: true })).toBeVisible();
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator('button[aria-label="Focus mode"][title="Focus mode"]:visible').click();
  const focus = page.getByRole("dialog", { name: "Focus mode", exact: true });
  await expect(focus.getByText(FIRST_LESSON, { exact: true })).toBeVisible();
  await expect(focus.getByText(FIRST_DESCRIPTION, { exact: true })).toBeVisible();
  const marker = focus.getByRole("link", { name: "Highlighted example", exact: true });
  await marker.click();
  await expect(focus.getByText("This highlighted sentence is a navigation target.", { exact: true })).toBeInViewport();
  const pages = focus.getByRole("navigation", { name: "Pages", exact: true });
  await pages.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(focus).toBeVisible();
  await expect(pages.getByRole("status")).toHaveText("Pages 2 / 3");
  await expect(focus.getByText("Lesson 2: getting started", { exact: true })).toBeVisible();
  await expect(focus.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await expect(marker).toHaveCount(0);
  await pages.getByRole("button", { name: "First page", exact: true }).click();
  await expect(focus.getByText(FIRST_LESSON, { exact: true })).toBeVisible();
  await expect(focus.getByText(FIRST_DESCRIPTION, { exact: true })).toBeVisible();
  await expect(marker).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("id")).toBe("50");
});

for (const container of [
  { type: "Markdown", index: 0, parameter: "mdfull", count: "3" },
  { type: "HTML", index: 1, parameter: "htmlfull", count: "2" },
]) {
  test(`${container.type} fullscreen keeps its owner and remains open while changing container pages`, async ({ page }) => {
    const main = await openPaginatedPage(page);
    await main.getByRole("button", { name: "Show menu", exact: true }).nth(container.index).click();
    const fullscreen = page.getByRole(container.type === "HTML" ? "region" : "dialog", { name: "Close", exact: true });
    await expect(fullscreen).toHaveCount(1);
    const pages = fullscreen.getByRole("navigation", { name: "Pages", exact: true });
    await expect(pages.getByRole("status")).toHaveText(`Pages 1 / ${container.count}`);
    await pages.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(fullscreen).toBeVisible();
    await expect(pages.getByRole("status")).toHaveText(`Pages 2 / ${container.count}`);
    await expect.poll(() => {
      const params = new URL(page.url()).searchParams;
      return { owner: params.get("id"), file: params.get("file"), language: params.get(container.parameter) };
    }).toEqual({ owner: "50", file: "page:50", language: "en" });
    await fullscreen.getByRole("button", { name: "Close", exact: true }).click();
    await expect(fullscreen).toHaveCount(0);
    await expect(main.getByRole("navigation", { name: "Pages", exact: true }).nth(container.index).getByRole("status"))
      .toHaveText(`Pages 2 / ${container.count}`);
    await expect.poll(() => new URL(page.url()).searchParams.get("id")).toBe("50");
  });
}
