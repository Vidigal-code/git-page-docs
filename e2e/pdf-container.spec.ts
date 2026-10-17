import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("the English PDF example previews, downloads unchanged and opens a separate tab", async ({ page }) => {
  await page.goto("/?menu=en&id=23");
  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  const preview = main.locator("iframe");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^blob:/);
  await expect(preview).toHaveAttribute("title", /guide/i);

  const downloadPromise = page.waitForEvent("download");
  await main.getByRole("button", { name: "Download PDF", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("gitpagedocs-project-guide.pdf");
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  const original = await readFile("cli/content/assets/gitpagedocs-project-guide.pdf");
  expect(await readFile(downloadedPath!)).toEqual(original);

  const open = main.getByRole("link", { name: "Open PDF in a new tab", exact: true });
  await expect(open).toHaveAttribute("target", "_blank");
  await expect(open).toHaveAttribute("rel", "noopener noreferrer");
  const source = await open.getAttribute("href");
  expect(source).toContain("gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf");
  const response = await page.request.get(source!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect(await response.body()).toEqual(original);
  const popupPromise = page.waitForEvent("popup");
  await open.click();
  const popup = await popupPromise;
  expect(popup).not.toBe(page);
  await popup.close();
  await expect(page).toHaveURL(/id=23/);
  expect(await main.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
  await main.screenshot({ path: `test-results/pdf-${test.info().project.name}.png` });
});
