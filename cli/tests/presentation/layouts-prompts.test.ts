import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const clack = vi.hoisted(() => ({
  askConfirm: vi.fn<(message: string, initial?: boolean) => Promise<boolean>>(),
  askSelect: vi.fn<(message: string, options: unknown[], initial?: string) => Promise<string>>(),
  askText: vi.fn<(options: { message: string; defaultValue?: string; validate?: (v: string) => string | undefined }) => Promise<string>>(),
  note: vi.fn<(message: string, title?: string) => void>(),
}));
vi.mock("../../presentation/ui/clack", () => clack);

const tty = vi.hoisted(() => ({ interactivePromptsAvailable: vi.fn<() => boolean>() }));
vi.mock("../../presentation/ui/tty", () => tty);

import { askLayoutsDir, askLayoutsSource, migrateLegacyLayoutsInteractive } from "../../presentation/ui/layouts-prompts";

const temporaryRoots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "gpd-layouts-prompt-"));
  temporaryRoots.push(root);
  return root;
}

function writeFileAt(root: string, relativePath: string, contents: string): void {
  const absolute = path.join(root, ...relativePath.split("/"));
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, contents);
}

const OPTIONS = { outputDir: "gitpagedocs", layoutsDir: "gitpagelayouts" };

beforeEach(() => {
  for (const mock of [...Object.values(clack), ...Object.values(tty)]) mock.mockReset();
  tty.interactivePromptsAvailable.mockReturnValue(true);
});

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop() as string, { recursive: true, force: true });
  }
});

describe("askLayoutsSource", () => {
  it("offers official and local layouts, pre-selecting the current choice", async () => {
    clack.askSelect.mockResolvedValue("local");
    await expect(askLayoutsSource(false)).resolves.toBe(true);
    expect(clack.askSelect).toHaveBeenCalledWith(
      "Layout source",
      [
        expect.objectContaining({ value: "official" }),
        expect.objectContaining({ value: "local", hint: "generated into gitpagelayouts/" }),
      ],
      "official",
    );

    clack.askSelect.mockResolvedValue("official");
    await expect(askLayoutsSource(true)).resolves.toBe(false);
    expect(clack.askSelect).toHaveBeenLastCalledWith("Layout source", expect.any(Array), "local");
  });
});

describe("askLayoutsDir", () => {
  it("normalizes the current value as default and the answer as result", async () => {
    clack.askText.mockResolvedValue("/meus-temas/");
    await expect(askLayoutsDir("\\custom\\")).resolves.toBe("meus-temas");
    const options = clack.askText.mock.calls[0][0];
    expect(options).toMatchObject({ message: "Layouts folder:", defaultValue: "custom" });
    expect(options.validate?.("  ")).toBe("A folder name is required.");
    expect(options.validate?.("x")).toBeUndefined();
  });
});

describe("migrateLegacyLayoutsInteractive", () => {
  it("returns null without prompting when there is nothing to migrate", async () => {
    const root = makeRoot();
    await expect(migrateLegacyLayoutsInteractive(root, OPTIONS)).resolves.toBeNull();
    expect(clack.note).not.toHaveBeenCalled();
    expect(clack.askConfirm).not.toHaveBeenCalled();
  });

  it("only reports the legacy folder outside a terminal", async () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", "{}");
    tty.interactivePromptsAvailable.mockReturnValue(false);

    await expect(migrateLegacyLayoutsInteractive(root, OPTIONS)).resolves.toBeNull();

    expect(clack.note).toHaveBeenCalledWith(
      expect.stringContaining("1 layout file(s) still live in gitpagedocs/layouts/."),
      "Legacy layouts",
    );
    expect(clack.askConfirm).not.toHaveBeenCalled();
    expect(existsSync(path.join(root, "gitpagedocs", "layouts", "layoutsConfig.json"))).toBe(true);
  });

  it("leaves the files alone when the user declines", async () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", "{}");
    clack.askConfirm.mockResolvedValue(false);

    await expect(migrateLegacyLayoutsInteractive(root, OPTIONS)).resolves.toBeNull();

    expect(clack.askConfirm).toHaveBeenCalledWith("Move them to gitpagelayouts/ now?", true);
    expect(clack.note).toHaveBeenLastCalledWith(
      "Left untouched — the viewer still reads gitpagedocs/layouts/.",
      "Legacy layouts",
    );
    expect(existsSync(path.join(root, "gitpagedocs", "layouts", "layoutsConfig.json"))).toBe(true);
  });

  it("moves the files into the layouts home when confirmed", async () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", '{"a":1}');
    writeFileAt(root, "gitpagedocs/layouts/templates/dark.json", "{}");
    clack.askConfirm.mockResolvedValue(true);

    const outcome = await migrateLegacyLayoutsInteractive(root, OPTIONS);

    expect(outcome).toEqual({ from: "gitpagedocs/layouts", to: "gitpagelayouts", movedCount: 2 });
    expect(clack.note).toHaveBeenCalledWith(
      "Found 2 layout file(s) in gitpagedocs/layouts/.\nLayouts are now generated in gitpagelayouts/.",
      "Legacy layouts",
    );
    expect(readFileSync(path.join(root, "gitpagelayouts", "layoutsConfig.json"), "utf-8")).toBe('{"a":1}');
    expect(existsSync(path.join(root, "gitpagelayouts", "templates", "dark.json"))).toBe(true);
    expect(existsSync(path.join(root, "gitpagedocs", "layouts"))).toBe(false);
  });

  it("warns about overwrites and defaults the confirmation to no", async () => {
    const root = makeRoot();
    writeFileAt(root, "gitpagedocs/layouts/layoutsConfig.json", "legacy");
    writeFileAt(root, "meus-temas/layoutsConfig.json", "current");
    clack.askConfirm.mockResolvedValue(true);

    const outcome = await migrateLegacyLayoutsInteractive(root, { outputDir: "gitpagedocs", layoutsDir: "/meus-temas/" });

    expect(outcome).toEqual({ from: "gitpagedocs/layouts", to: "meus-temas", movedCount: 1 });
    expect(clack.note).toHaveBeenCalledWith(
      expect.stringContaining("1 file(s) already in meus-temas/ would be replaced."),
      "Legacy layouts",
    );
    expect(clack.askConfirm).toHaveBeenCalledWith("Move them to meus-temas/ now?", false);
    expect(readFileSync(path.join(root, "meus-temas", "layoutsConfig.json"), "utf-8")).toBe("legacy");
  });
});
