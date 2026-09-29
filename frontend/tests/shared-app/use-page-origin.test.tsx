// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { usePageOrigin } from "@/shared/lib/use-page-origin";

afterEach(cleanup);

function Origin() {
  return <span>{usePageOrigin() || "none"}</span>;
}

describe("usePageOrigin", () => {
  it("is empty in the static render and the page origin in the browser", () => {
    expect(renderToString(<Origin />)).toContain("none");
    expect(renderHook(() => usePageOrigin()).result.current).toBe(window.location.origin);
  });
});
