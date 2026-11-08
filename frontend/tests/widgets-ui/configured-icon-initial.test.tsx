// @vitest-environment jsdom
import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfiguredIcon } from "@/widgets/docs-shell/ui/docs-shell-icon";
import { FiX } from "@/shared/ui/fallback-icons";
import type { ResolvedNavMenuIconConfig } from "@/shared/lib/resolve-nav-menu-icon";

const icon: ResolvedNavMenuIconConfig = {
  useReactIcon: true, reactIconTag: "FiX", reactIconStyle: { color: "red", fontSize: "24px" },
  iconImage: "", iconImgWidth: 20, iconImgHeight: 20,
};

it("uses the caller's semantic fallback during the initial render when no separate React fallback is supplied", () => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<ConfiguredIcon icon={icon} fallback={<FiX aria-hidden />} />);
  expect(host.querySelector("svg")).not.toBeNull();
  expect(host.querySelector("span")?.style.color).toBe("red");
  expect(host.querySelector("span")?.style.fontSize).toBe("24px");
});

it("preserves an explicit null React fallback while the configured icon is pending", () => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<ConfiguredIcon icon={icon} fallback={<FiX aria-hidden />} reactIconFallback={null} />);
  expect(host.querySelector("svg")).toBeNull();
  expect(host.textContent).toBe("");
});

it("preserves a separate pending fallback supplied by the caller", () => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<ConfiguredIcon icon={icon} fallback={<FiX aria-hidden />} reactIconFallback="Loading custom icon" />);
  expect(host.textContent).toBe("Loading custom icon");
  expect(host.querySelector("svg")).toBeNull();
});

it("keeps an explicit image when React icons are disabled", () => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<ConfiguredIcon
    icon={{ ...icon, useReactIcon: false, iconImage: "/close.svg" }}
    fallback={<FiX aria-hidden />} reactIconFallback={null} alt="Close"
  />);
  expect(host.querySelector("img")?.getAttribute("src")).toBe("/close.svg");
  expect(host.querySelector("img")?.getAttribute("width")).toBe("20");
  expect(host.querySelector("img")?.getAttribute("alt")).toBe("Close");
  expect(host.querySelector("svg")).toBeNull();
});

it.each([
  { name: "React icons disabled without an image", configuration: { ...icon, useReactIcon: false } },
  { name: "no icon configuration", configuration: undefined },
])("keeps the ordinary fallback for $name", ({ configuration }) => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<ConfiguredIcon icon={configuration} fallback={<FiX aria-hidden />} reactIconFallback={null} />);
  expect(host.querySelector("svg")).not.toBeNull();
});
