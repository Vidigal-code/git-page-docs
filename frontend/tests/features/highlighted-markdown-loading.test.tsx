// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HighlightedMarkdown } from "@/features/source-code-highlight";

const { codeToTokens } = vi.hoisted(() => ({ codeToTokens: vi.fn() }));
vi.mock("shiki", () => ({ bundledLanguages: { json: {} }, bundledLanguagesAlias: {}, codeToTokens }));

function tokensFor(content: string, color = "#00ff00") {
  return { tokens: [[{ content, offset: 0, color }]], bg: "#000000", fg: "#ffffff" };
}

const jsonBlock = (content: string): string => `<pre><code class="language-json">${content}</code></pre>`;
const DARK_THEME = { id: "vscode-dark", mode: "dark" as const };

beforeEach(() => {
  codeToTokens.mockReset();
  codeToTokens.mockImplementation(async (content: string) => tokensFor(content));
});
afterEach(cleanup);

it("shows new content immediately and ignores a previous document that finishes loading late", async () => {
  let resolveFirst: (result: ReturnType<typeof tokensFor>) => void = () => {};
  codeToTokens.mockImplementationOnce(() => new Promise<ReturnType<typeof tokensFor>>(resolve => { resolveFirst = resolve; }));
  const { container, rerender } = render(<HighlightedMarkdown html={jsonBlock("first")} theme={DARK_THEME} />);
  await waitFor(() => expect(codeToTokens).toHaveBeenCalledTimes(1));
  rerender(<HighlightedMarkdown html={jsonBlock("second")} theme={DARK_THEME} />);
  expect(container.textContent).toBe("second");
  await waitFor(() => expect(container.querySelector("span")?.textContent).toBe("second"));
  await act(async () => { resolveFirst(tokensFor("first")); });
  expect(container.textContent).toBe("second");
});

it("does not repaint a new theme with an older theme result", async () => {
  let resolveFirst: (result: ReturnType<typeof tokensFor>) => void = () => {};
  codeToTokens.mockImplementationOnce(() => new Promise<ReturnType<typeof tokensFor>>(resolve => { resolveFirst = resolve; }));
  codeToTokens.mockImplementationOnce(async (content: string) => tokensFor(content, "#0000ff"));
  const html = jsonBlock("same document");
  const { container, rerender } = render(<HighlightedMarkdown html={html} theme={DARK_THEME} />);
  await waitFor(() => expect(codeToTokens).toHaveBeenCalledTimes(1));
  rerender(<HighlightedMarkdown html={html} theme={{ id: "vscode-light", mode: "light" }} />);
  await waitFor(() => expect(container.querySelector("span")?.style.color).toBe("rgb(0, 0, 255)"));
  await act(async () => { resolveFirst(tokensFor("same document", "#ff0000")); });
  expect(container.querySelector("span")?.style.color).toBe("rgb(0, 0, 255)");
});

it("keeps the original document visible when a grammar cannot load", async () => {
  codeToTokens.mockRejectedValue(new Error("Grammar download failed"));
  const { container } = render(<HighlightedMarkdown html={jsonBlock("readable fallback")} theme={DARK_THEME} />);
  await act(async () => {});
  await waitFor(() => expect(codeToTokens).toHaveBeenCalledTimes(1));
  expect(container.textContent).toBe("readable fallback");
  expect(container.querySelector("span")).toBeNull();
});

it("shares the highlighting budget across the document and leaves oversized blocks readable", async () => {
  const large = "x".repeat(200_001);
  const html = jsonBlock(large) + jsonBlock(large) + jsonBlock("{}");
  const { container } = render(<HighlightedMarkdown html={html} theme={DARK_THEME} />);
  await waitFor(() => expect(container.querySelectorAll("code")[2].querySelector("span")).not.toBeNull());
  const blocks = container.querySelectorAll("code");
  expect(blocks[0].querySelector("span")).not.toBeNull();
  expect(blocks[1].querySelector("span")).toBeNull();
  expect(blocks[1].textContent).toBe(large);
});

it("does not load syntax grammars for ordinary prose or code without a language", async () => {
  const { container } = render(<HighlightedMarkdown html="<p>Text</p><pre><code>plain</code></pre>" theme={DARK_THEME} />);
  await act(async () => {});
  expect(container.textContent).toBe("Textplain");
  expect(codeToTokens).not.toHaveBeenCalled();
});

it('preserves disclosure state, focus and code scrolling during loading and a theme change', async () => {
  let complete: (result: ReturnType<typeof tokensFor>) => void = () => {};
  codeToTokens.mockImplementation(() => new Promise<ReturnType<typeof tokensFor>>(resolve => { complete = resolve; }));
  const html = '<details id="closed"><summary>Closed initially</summary>Content</details><details id="opened" open><summary>Opened initially</summary>Content</details><pre><code class="language-json">{"enabled":true}</code></pre>';
  const { container, rerender } = render(<HighlightedMarkdown html={html} theme={{ id: 'vscode-dark', mode: 'dark' }} />);
  await waitFor(() => expect(codeToTokens).toHaveBeenCalledTimes(1));
  const closed = container.querySelector<HTMLDetailsElement>('#closed')!;
  const opened = container.querySelector<HTMLDetailsElement>('#opened')!;
  const pre = container.querySelector('pre')!;
  const summary = closed.querySelector('summary')!;
  closed.open = true;
  opened.open = false;
  pre.scrollLeft = 180;
  summary.focus();
  await act(async () => { complete(tokensFor('{"enabled":true}')); });
  await waitFor(() => expect(container.querySelector('code span')).not.toBeNull());
  expect(container.querySelector<HTMLDetailsElement>('#closed')?.open).toBe(true);
  expect(container.querySelector<HTMLDetailsElement>('#opened')?.open).toBe(false);
  expect(document.activeElement).toBe(summary);
  expect(container.querySelector('pre')).toBe(pre);
  expect(pre.scrollLeft).toBe(180);
  rerender(<HighlightedMarkdown html={html} theme={{ id: 'vscode-light', mode: 'light' }} />);
  expect(container.querySelector('code span')).toBeNull();
  await waitFor(() => expect(codeToTokens).toHaveBeenCalledTimes(2));
  await act(async () => { complete(tokensFor('{"enabled":true}')); });
  await waitFor(() => expect(container.querySelector('code span')).not.toBeNull());
  expect(container.querySelector<HTMLDetailsElement>('#closed')?.open).toBe(true);
  expect(container.querySelector<HTMLDetailsElement>('#opened')?.open).toBe(false);
  expect(document.activeElement).toBe(summary);
  expect(container.querySelector('pre')).toBe(pre);
  expect(pre.scrollLeft).toBe(180);
});
