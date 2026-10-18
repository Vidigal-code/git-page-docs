import { expect, it } from "vitest";
import { buildRootConfig } from "../builders/root-config-builder.mjs";

it("generates document navigation centered by default", () => {
  expect(buildRootConfig().site.documentNavigation).toEqual({ position: "center" });
});
