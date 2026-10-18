import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const collection = vi.hoisted(() => ({
  load: vi.fn(() => ({ SiCustomIcon: () => null })),
}));
vi.mock("react-icons/si", () => collection.load());

beforeEach(() => {
  vi.resetModules();
  collection.load.mockClear();
});

it("renders the configured translation icon without loading the complete Simple Icons collection", async () => {
  const { resolveReactIconByTag } = await import("@/shared/lib/react-icon-tag/resolve-react-icon-by-tag");
  const Icon = await resolveReactIconByTag("  SiGoogletranslate  ");
  expect(collection.load).not.toHaveBeenCalled();
  expect(typeof Icon).toBe("function");
  if (!Icon) throw new Error("The translation icon is unavailable");
  const markup = renderToStaticMarkup(createElement(Icon, {
    style: { color: "blue", fontSize: "22px" }, "aria-hidden": true,
  }));
  expect(markup).toContain('role="img"');
  expect(markup).toContain('viewBox="0 0 24 24"');
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).toContain('color:blue;font-size:22px');
  expect(await resolveReactIconByTag("SiGoogletranslate")).toBe(Icon);
});

it("preserves generic configured icons from the same collection", async () => {
  const { resolveReactIconByTag } = await import("@/shared/lib/react-icon-tag/resolve-react-icon-by-tag");
  const Icon = await resolveReactIconByTag("SiCustomIcon");
  expect(typeof Icon).toBe("function");
  expect(await resolveReactIconByTag("SiCustomIcon")).toBe(Icon);
  expect(await resolveReactIconByTag("SiMissingIcon")).toBeNull();
});
