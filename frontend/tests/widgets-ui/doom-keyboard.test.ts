import { expect, it, vi } from "vitest";
// @ts-expect-error jsdom does not provide declarations in this workspace.
import { JSDOM } from "jsdom";
// @ts-expect-error The CLI content module exposes generated HTML without declarations.
import { HTML_DOOM } from "../../../cli/content/html-doom.mjs";

it("starts DOOM without requesting mouse capture unavailable in the HTML sandbox", async () => {
  const stopPlayer = vi.fn().mockResolvedValue(undefined);
  const startPlayer = vi.fn(() => ({ stop: stopPlayer }));
  const dom: { window: Window & typeof globalThis & { Dos: typeof startPlayer } } = new JSDOM(HTML_DOOM.en, {
    runScripts: "dangerously",
    url: "https://docs.example/",
  });
  dom.window.Dos = startPlayer;
  const document = dom.window.document;
  try {
    document.querySelector<HTMLButtonElement>("#doom-load")?.click();
    for (const resource of document.head.querySelectorAll("link, script[src]")) {
      resource.dispatchEvent(new dom.window.Event("load"));
    }

    await vi.waitFor(() => expect(startPlayer).toHaveBeenCalled());
    expect(startPlayer).toHaveBeenCalledWith(
      document.querySelector("#doom-player"),
      expect.objectContaining({ mouseCapture: false }),
    );
  } finally {
    dom.window.dispatchEvent(new dom.window.Event("pagehide"));
    dom.window.close();
  }
});
