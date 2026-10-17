import { expect, test } from "@playwright/test";

const PLAYER_SCRIPT = "https://v8.js-dos.com/latest/js-dos.js";
const PLAYER_STYLES = "https://v8.js-dos.com/latest/js-dos.css";

test("the HTML example keeps its title outside the frame and offers only the native game controls", async ({ page }) => {
  const playerRequests: string[] = [];
  await page.route(PLAYER_STYLES, (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await page.route(PLAYER_SCRIPT, (route) => {
    playerRequests.push(route.request().url());
    return route.fulfill({
      contentType: "text/javascript",
      body: `window.Dos = (element, options) => {
        if (options.autoStart !== false) throw new Error("The game must wait for Play");
        const play = document.createElement("button");
        play.textContent = "Play";
        play.addEventListener("click", () => {
          const canvas = document.createElement("canvas");
          canvas.setAttribute("aria-label", "DOOM display");
          element.append(canvas);
          play.remove();
        });
        element.append(play);
        return { stop: () => Promise.resolve(), setNoCloud: () => undefined };
      };`,
    });
  });
  await page.goto("/?menu=en&id=29");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "DOOM: HTML example", exact: true })).toBeVisible();
  await expect(main.getByText("Play DOOM in an HTML container using the player’s native controls.", { exact: true })).toBeVisible();
  const frame = main.frameLocator('iframe[title="HTML content"]');
  await expect(frame.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(frame.getByRole("heading")).toHaveCount(0);
  await expect(frame.getByRole("link")).toHaveCount(0);
  await expect(frame.locator("main > p")).toHaveCount(0);
  await expect(frame.locator("#doom-status")).toBeHidden();
  await expect(frame.getByLabel("DOOM display")).toHaveCount(0);
  await frame.getByRole("button", { name: "Play", exact: true }).click();
  await expect(frame.getByLabel("DOOM display")).toBeVisible();
  expect(playerRequests).toEqual([PLAYER_SCRIPT]);
  expect(await main.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
  await main.screenshot({ path: `test-results/html-doom-${test.info().project.name}.png` });
});

test("the HTML example shows a message only when the player cannot load", async ({ page }) => {
  await page.route(PLAYER_STYLES, (route) => route.fulfill({ contentType: "text/css", body: "" }));
  await page.route(PLAYER_SCRIPT, (route) => route.abort("failed"));
  await page.goto("/?menu=en&id=29");
  const frame = page.getByRole("main").frameLocator('iframe[title="HTML content"]');
  await expect(frame.getByRole("status")).toContainText("The player could not load");
  await expect(frame.getByRole("status")).toContainText("reload this page to try again");
  await expect(frame.getByRole("heading")).toHaveCount(0);
  await expect(frame.getByRole("link")).toHaveCount(0);
  await expect(frame.getByRole("button")).toHaveCount(0);
});
