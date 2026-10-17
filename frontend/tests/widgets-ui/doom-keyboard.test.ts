import { expect, it, vi } from "vitest";
// @ts-expect-error jsdom does not provide declarations in this workspace.
import { JSDOM } from "jsdom";
// @ts-expect-error The CLI content module exposes generated HTML without declarations.
import { HTML_DOOM } from "../../../cli/content/html-doom.mjs";

it.each(["en", "pt", "es"])("keeps only the game area visible inside the %s HTML example", (language) => {
  const dom: { window: Window } = new JSDOM(HTML_DOOM[language]);
  const document = dom.window.document;
  try {
    expect(document.querySelector("main h1, main p, main a, main button")).toBeNull();
    expect(document.querySelector("#doom-player")?.getAttribute("aria-label")).toBeTruthy();
    expect(document.querySelector("#doom-status")?.hasAttribute("hidden")).toBe(true);
    expect(document.title).toContain("DOOM");
    expect(document.documentElement.lang).toBe(language);
  } finally {
    dom.window.close();
  }
});

it("offers native play without autoplay, cloud controls or mouse capture", async () => {
  const stopPlayer = vi.fn().mockResolvedValue(undefined);
  const hideCloud = vi.fn();
  const startPlayer = vi.fn(() => ({ stop: stopPlayer, setNoCloud: hideCloud }));
  const dom: { window: Window & typeof globalThis & { Dos: typeof startPlayer } } = new JSDOM(HTML_DOOM.en, {
    runScripts: "dangerously",
    url: "https://docs.example/",
  });
  dom.window.Dos = startPlayer;
  const document = dom.window.document;
  try {
    for (const resource of document.head.querySelectorAll("link, script[src]")) {
      resource.dispatchEvent(new dom.window.Event("load"));
    }

    await vi.waitFor(() => expect(startPlayer).toHaveBeenCalled());
    expect(startPlayer).toHaveBeenCalledWith(
      document.querySelector("#doom-player"),
      expect.objectContaining({ autoStart: false, kiosk: true, mouseCapture: false }),
    );
    expect(hideCloud).toHaveBeenCalledWith(true);
    expect(document.querySelector("#doom-status")?.hasAttribute("hidden")).toBe(true);
  } finally {
    dom.window.dispatchEvent(new dom.window.Event("pagehide"));
    dom.window.close();
  }
});

it.each(["link", "script[src]"])("shows a loading error only when the %s resource fails", async (selector) => {
  const dom: { window: Window & typeof globalThis } = new JSDOM(HTML_DOOM.en, {
    runScripts: "dangerously",
    url: "https://docs.example/",
  });
  const reportError = vi.spyOn(dom.window.console, "error").mockImplementation(() => undefined);
  const document = dom.window.document;
  try {
    expect(document.querySelector("#doom-status")?.hasAttribute("hidden")).toBe(true);
    document.head.querySelector(selector)?.dispatchEvent(new dom.window.Event("error"));

    await vi.waitFor(() => expect(document.querySelector("#doom-status")?.hasAttribute("hidden")).toBe(false));
    expect(document.querySelector("#doom-status")?.textContent).toContain("reload this page to try again");
    expect(reportError).toHaveBeenCalledOnce();
    expect(document.querySelector("main button, main a")).toBeNull();
  } finally {
    reportError.mockRestore();
    dom.window.close();
  }
});
