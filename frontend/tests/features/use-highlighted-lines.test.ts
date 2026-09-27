// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHighlightedLines } from "@/features/source-code-highlight/model/use-highlighted-lines";

const { codeToTokens } = vi.hoisted(() => ({ codeToTokens: vi.fn() }));

vi.mock("shiki", () => ({
  bundledLanguages: { typescript: {}, css: {} },
  bundledLanguagesAlias: { javascript: {} },
  codeToTokens,
}));

function tokensFor(code: string) {
  return { tokens: [[{ content: code, offset: 0 }]], bg: "#1e1e1e", fg: "#d4d4d4" };
}

beforeEach(() => {
  codeToTokens.mockReset();
  codeToTokens.mockImplementation(async (code: string) => tokensFor(code));
});

afterEach(cleanup);

describe("useHighlightedLines", () => {
  it("returns null without loading Shiki for files with no grammar hint", async () => {
    const { result } = renderHook(() => useHighlightedLines("plain text", "LICENSE", undefined, "dark"));
    await act(async () => {});
    expect(result.current).toBeNull();
    expect(codeToTokens).not.toHaveBeenCalled();
  });

  it("skips empty and oversized content", async () => {
    const empty = renderHook(() => useHighlightedLines("", "index.ts", undefined, "dark"));
    const huge = renderHook(() => useHighlightedLines("a".repeat(400_001), "index.ts", undefined, "dark"));
    await act(async () => {});
    expect(empty.result.current).toBeNull();
    expect(huge.result.current).toBeNull();
    expect(codeToTokens).not.toHaveBeenCalled();
  });

  it("skips grammars Shiki does not bundle", async () => {
    const { result } = renderHook(() => useHighlightedLines("print(1)", "script.lua", undefined, "dark"));
    await act(async () => {});
    expect(result.current).toBeNull();
    expect(codeToTokens).not.toHaveBeenCalled();
  });

  it("tokenizes with the layout-matched theme and exposes the editor colors", async () => {
    const { result } = renderHook(() => useHighlightedLines("const a = 1;", "src/index.ts", "nord-dark", "dark"));
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(codeToTokens).toHaveBeenCalledWith("const a = 1;", { lang: "typescript", theme: "nord" });
    expect(result.current).toEqual({
      lines: [[{ content: "const a = 1;", offset: 0 }]],
      background: "#1e1e1e",
      foreground: "#d4d4d4",
    });
  });

  it("accepts grammar aliases and falls back to the VS Code palette for unknown layouts", async () => {
    const { result } = renderHook(() => useHighlightedLines("export {}", "lib/app.mjs", "custom-layout", "light"));
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(codeToTokens).toHaveBeenCalledWith("export {}", { lang: "javascript", theme: "light-plus" });
  });

  it("degrades to plain text when tokenization fails", async () => {
    codeToTokens.mockRejectedValue(new Error("grammar failed to load"));
    const { result } = renderHook(() => useHighlightedLines("a {}", "site.css", undefined, "dark"));
    await act(async () => {});
    await act(async () => {});
    expect(codeToTokens).toHaveBeenCalledTimes(1);
    expect(result.current).toBeNull();
  });

  it("resets to null on input change and ignores a stale result that resolves late", async () => {
    let resolveFirst: (value: ReturnType<typeof tokensFor>) => void = () => {};
    codeToTokens.mockImplementationOnce(
      () =>
        new Promise<ReturnType<typeof tokensFor>>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const { result, rerender } = renderHook(({ code }) => useHighlightedLines(code, "index.ts", undefined, "dark"), {
      initialProps: { code: "first" },
    });
    await act(async () => {});
    expect(result.current).toBeNull();

    rerender({ code: "second" });
    await waitFor(() => expect(result.current?.lines[0][0].content).toBe("second"));

    await act(async () => {
      resolveFirst(tokensFor("first"));
    });
    expect(result.current?.lines[0][0].content).toBe("second");
  });

  it("stops updating state after unmount", async () => {
    let resolveLate: (value: ReturnType<typeof tokensFor>) => void = () => {};
    codeToTokens.mockImplementationOnce(
      () =>
        new Promise<ReturnType<typeof tokensFor>>((resolve) => {
          resolveLate = resolve;
        }),
    );
    const { unmount } = renderHook(() => useHighlightedLines("x", "index.ts", undefined, "dark"));
    await act(async () => {});
    unmount();
    await expect(
      act(async () => {
        resolveLate(tokensFor("x"));
      }),
    ).resolves.toBeUndefined();
  });
});
