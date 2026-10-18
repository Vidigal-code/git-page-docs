import { expect, it } from "vitest";
import { buildRootConfig } from "../builders/root-config-builder.mjs";

it("offers documentation versions from 0.0.9 through the current release in descending order", () => {
  expect(buildRootConfig().VersionControl.versions).toMatchObject([
    { id: "0.0.13", path: "gitpagedocs/docs/versions/0.0.13/config.json" },
    { id: "0.0.12", path: "gitpagedocs/docs/versions/0.0.12/config.json" },
    { id: "0.0.11", path: "gitpagedocs/docs/versions/0.0.11/config.json" },
    { id: "0.0.10", path: "gitpagedocs/docs/versions/0.0.10/config.json" },
    { id: "0.0.9", path: "gitpagedocs/docs/versions/0.0.9/config.json" },
  ]);
});
