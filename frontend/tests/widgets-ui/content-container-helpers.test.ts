import { describe, it, expect, vi } from "vitest";
import type { ContentTypeRouteConfig } from "@/entities/docs";
import { resolveContentHeaderText, toTextAlign } from "@/widgets/docs-shell/ui/content-type-containers/content-header-text";
import { getContainerStyle } from "@/widgets/docs-shell/ui/content-type-containers/container-style";
import { toContainerWrapperProps } from "@/widgets/docs-shell/ui/content-type-containers/container-wrapper-props";

const config = {
  title: { en: "Title", pt: "Titulo" },
  description: { en: "Description" },
  titleIsVisible: true,
  descriptionIsVisible: true,
  titleCss: "color: red",
  titleDarkCss: "color: white",
  titleLightCss: "color: black",
  descriptionCss: "font-size: 1rem",
  marginTop: "8px",
  marginBottom: "4px",
} as unknown as ContentTypeRouteConfig;

describe("resolveContentHeaderText", () => {
  it("picks the language text, falling back to English, and the css of the theme mode", () => {
    expect(resolveContentHeaderText(config, "pt", true)).toEqual({
      title: "Titulo",
      description: "Description",
      showTitle: true,
      showDescription: true,
      titleCss: "color: white",
      descriptionCss: "font-size: 1rem",
    });
    expect(resolveContentHeaderText(config, "en", false).titleCss).toBe("color: black");
  });

  it("hides text that is not visible or missing", () => {
    const hidden = resolveContentHeaderText({ ...config, titleIsVisible: false }, "en", false);
    expect(hidden.showTitle).toBe(false);
    expect(resolveContentHeaderText(undefined, "en", false)).toEqual({
      title: undefined,
      description: undefined,
      showTitle: false,
      showDescription: false,
      titleCss: undefined,
      descriptionCss: undefined,
    });
  });
});

describe("toTextAlign", () => {
  it("accepts center, left and right and defaults to center", () => {
    expect(toTextAlign("left")).toBe("left");
    expect(toTextAlign("right")).toBe("right");
    expect(toTextAlign("justify")).toBe("center");
    expect(toTextAlign(undefined)).toBe("center");
  });
});

describe("getContainerStyle", () => {
  it("grows for full, fixes a positive height and ignores anything else", () => {
    expect(getContainerStyle("full")).toEqual({ minHeight: "80vh", overflow: "auto" });
    expect(getContainerStyle(500)).toEqual({ height: 500, overflow: "auto" });
    expect(getContainerStyle(0)).toEqual({});
    expect(getContainerStyle(undefined)).toEqual({});
  });
});

describe("toContainerWrapperProps", () => {
  it("maps the shared route container props to the wrapper props", () => {
    const onFullscreenOpen = vi.fn();
    const onFullscreenClose = vi.fn();
    expect(
      toContainerWrapperProps({
        config,
        fullscreenEnabled: true,
        fullscreenCloseLabel: "Close",
        fullscreenExpandLabel: "Expand",
        onFullscreenOpen,
        onFullscreenClose,
      }),
    ).toEqual({
      fullscreenEnabled: true,
      fullscreenCloseLabel: "Close",
      fullscreenExpandLabel: "Expand",
      onBeforeFullscreen: onFullscreenOpen,
      onAfterFullscreen: onFullscreenClose,
      marginTop: "8px",
      marginBottom: "4px",
      browseNav: undefined,
    });
  });

  it("keeps fullscreen off by default", () => {
    expect(toContainerWrapperProps({ fullscreenCloseLabel: "c", fullscreenExpandLabel: "e" }).fullscreenEnabled).toBe(false);
  });
});
