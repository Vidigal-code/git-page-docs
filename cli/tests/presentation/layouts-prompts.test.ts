import { describe, it, expect, beforeEach, vi } from "vitest";

const clack = vi.hoisted(() => ({
  askSelect: vi.fn<(message: string, options: unknown[], initial?: string) => Promise<string>>(),
  askText: vi.fn<(options: { message: string; defaultValue?: string; validate?: (v: string) => string | undefined }) => Promise<string>>(),
}));
vi.mock("../../presentation/ui/clack", () => clack);

import { askLayoutsDir, askLayoutsSource } from "../../presentation/ui/layouts-prompts";

beforeEach(() => {
  for (const mock of Object.values(clack)) mock.mockReset();
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
