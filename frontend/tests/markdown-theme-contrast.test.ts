import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { toBaseThemeCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { ThemeTemplate } from "@/entities/docs/model/types";

const THEME_DIRECTORY = path.resolve("gitpagelayouts/templates");
const MINIMUM_TEXT_CONTRAST = 4.5;
const CONTRAST_FLARE = 0.05;
const THEMES = readdirSync(THEME_DIRECTORY)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(THEME_DIRECTORY, file), "utf8")) as ThemeTemplate);

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)!.map((channel) => Number.parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + CONTRAST_FLARE) / (Math.min(first, second) + CONTRAST_FLARE);
}

it.each(THEMES)("keeps Markdown text, links, quotes and code readable in $id", (theme) => {
  const vars = toBaseThemeCssVars(theme) as Record<string, string>;
  const background = vars["--markdown-background"];
  for (const token of ["--markdown-text", "--markdown-link", "--markdown-muted"]) {
    expect(contrast(vars[token], background), `${theme.id}: ${token}`).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
  }
  expect(contrast(vars["--markdown-code-text"], vars["--markdown-code-background"])).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
});

it("retains the original theme colors when their Markdown contrast is sufficient", () => {
  const theme = THEMES.find((entry) => entry.id === "github-light")!;
  const vars = toBaseThemeCssVars(theme) as Record<string, string>;
  expect(vars["--markdown-background"]).toBe("#FFFFFF");
  expect(vars["--markdown-text"]).toBe("#1F2328");
  expect(vars["--markdown-link"]).toBe("#0969DA");
  expect(vars["--markdown-muted"]).toBe("#57606A");
});
