import { expect, test } from "@playwright/test";

const PLAYER_SCRIPT = "https://v8.js-dos.com/latest/js-dos.js";
const PLAYER_STYLES = "https://v8.js-dos.com/latest/js-dos.css";

test("the HTML example keeps its title and description and loads DOOM on demand", async ({ page }) => {
  const playerRequests: string[] = [];
  await page.route(PLAYER_STYLES, (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await page.route(PLAYER_SCRIPT, (route) => {
    playerRequests.push(route.request().url());
    return route.fulfill({
      contentType: "text/javascript",
      body: `window.Dos = (element, options) => {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-label", "DOOM display");
        element.append(canvas);
        options.onEvent("ci-ready");
        return { stop: () => Promise.resolve() };
      };`,
    });
  });
  await page.goto("/?menu=en&id=29");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "DOOM: HTML example", exact: true })).toBeVisible();
  await expect(main.getByText("An HTML container with a title, description and a game loaded only after clicking.", { exact: true })).toBeVisible();
  const frame = main.frameLocator('iframe[title="HTML content"]');
  await expect(frame.getByRole("heading", { name: "DOOM in an HTML container", exact: true })).toBeVisible();
  await expect(frame.locator(".description")).toContainText("its own title, description and game area");
  expect(playerRequests).toEqual([]);
  await frame.getByRole("button", { name: "Load DOOM", exact: true }).click();
  await expect(frame.getByRole("status")).toContainText("DOOM is ready");
  await expect(frame.getByLabel("DOOM display")).toBeVisible();
  expect(playerRequests).toEqual([PLAYER_SCRIPT]);
  expect(await main.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
  await main.screenshot({ path: `test-results/html-doom-${test.info().project.name}.png` });
});

test("the HTML example lets the reader retry when the player cannot load", async ({ page }) => {
  await page.route(PLAYER_STYLES, (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await page.route(PLAYER_SCRIPT, (route) => route.abort("failed"));
  await page.goto("/?menu=en&id=29");
  const frame = page.getByRole("main").frameLocator('iframe[title="HTML content"]');
  const load = frame.getByRole("button", { name: "Load DOOM", exact: true });
  await load.click();
  await expect(frame.getByRole("status")).toContainText("The player could not load");
  await expect(load).toBeEnabled();
  await expect(frame.getByRole("link", { name: "Open DOOM on DOS Zone" })).toHaveAttribute("rel", "noopener noreferrer");
});
