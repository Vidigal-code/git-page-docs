import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({ channel: "chromium" });

test("the English PDF example previews, downloads unchanged and opens a separate tab", async ({ page }) => {
  const original = await readFile("cli/content/assets/gitpagedocs-project-guide.pdf");
  await page.route("**/gitpagedocs-project-guide.pdf", (route) => route.fulfill({
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": 'attachment; filename="gitpagedocs-project-guide.pdf"',
    },
    body: original,
  }));
  await page.goto("/?menu=en&id=23");
  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  const preview = main.locator("iframe");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^blob:/);
  await expect(preview).toHaveAttribute("title", /guide/i);

  const downloadButton = main.getByRole("button", { name: "Download PDF", exact: true });
  await expect(downloadButton).toHaveText("");
  const downloadPromise = page.waitForEvent("download");
  await downloadButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("gitpagedocs-project-guide.pdf");
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  expect(await readFile(downloadedPath!)).toEqual(original);

  const open = main.getByRole("button", { name: "Open PDF in a new tab", exact: true });
  await expect(open).toHaveText("");
  const unexpectedDownloads: string[] = [];
  page.on("download", (item) => unexpectedDownloads.push(item.suggestedFilename()));
  const popupPromise = page.waitForEvent("popup");
  await open.click();
  const popup = await popupPromise;
  expect(popup).not.toBe(page);
  await expect(popup).toHaveURL(/^blob:/);
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  await expect.poll(() => popup.evaluate(() => document.contentType)).toBe("application/pdf");
  expect(unexpectedDownloads).toEqual([]);
  await expect(page).toHaveURL(/id=23/);
  expect(await main.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
  await main.screenshot({ path: `test-results/pdf-${test.info().project.name}.png` });
  const pdfUrl = popup.url();
  await main.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(page).not.toHaveURL(/id=23/);
  expect(popup.isClosed()).toBe(false);
  expect(await page.evaluate(async (url) => (await fetch(url)).headers.get("content-type"), pdfUrl)).toBe("application/pdf");
  await popup.close();
});
