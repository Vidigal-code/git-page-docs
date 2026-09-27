import { useEffect } from "react";
import { describe, expect, it } from "vitest";
import { useIsomorphicLayoutEffect } from "@/shared/lib/use-isomorphic-layout-effect";

describe("useIsomorphicLayoutEffect on the server", () => {
  it("falls back to useEffect when there is no window", () => {
    expect(typeof window).toBe("undefined");
    expect(useIsomorphicLayoutEffect).toBe(useEffect);
  });
});
