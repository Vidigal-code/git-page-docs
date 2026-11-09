// @vitest-environment jsdom
import { useLayoutEffect, type CSSProperties } from "react";
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useDocumentThemeVars } from "@/shared/lib/use-document-theme-vars";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("style");
});

it("replaces cached document colors before the updated shell can paint", () => {
  document.documentElement.style.setProperty("--background", "#112233");
  let backgroundBeforePaint = "";
  renderHook(() => {
    useDocumentThemeVars({ "--background": "#442266" } as CSSProperties);
    useLayoutEffect(() => {
      backgroundBeforePaint = document.documentElement.style.getPropertyValue("--background");
    }, []);
  });

  expect(backgroundBeforePaint).toBe("#442266");
});
