// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";
import { ConfiguredIcon, DocsShellBrandIcon } from "@/widgets/docs-shell/ui/docs-shell-icon";

vi.mock("next/image", () => ({
  default: ({ unoptimized: _unoptimized, ...props }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => (
    <img alt="" {...props} />
  ),
}));

// The real slot resolves react-icons asynchronously; the stub exposes the tag
// and the fallback it was handed so the resolution rules can be asserted.
vi.mock("@/shared/ui/react-icon-by-tag", () => ({
  ReactIconByTag: ({ tag, fallback, style }: { tag?: string; fallback?: ReactNode; style?: CSSProperties }) => (
    <i data-testid="react-icon" data-tag={tag ?? ""} style={style}>
      {fallback}
    </i>
  ),
}));

const baseIcon = {
  iconImage: "",
  useReactIcon: false,
  reactIconTag: undefined,
  reactIconStyle: { color: "red" },
  iconImgWidth: 18,
  iconImgHeight: 18,
};

describe("ConfiguredIcon", () => {
  afterEach(cleanup);

  it("renders the configured image with the given alt", () => {
    const { container } = render(
      <ConfiguredIcon icon={{ ...baseIcon, iconImage: "/icons/menu.png" }} fallback={<b>fb</b>} alt="Menu" />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/icons/menu.png");
    expect(img?.getAttribute("alt")).toBe("Menu");
    expect(img?.getAttribute("width")).toBe("18");
    expect(container.querySelector("b")).toBeNull();
  });

  it("renders the fallback when the config carries neither icon nor image", () => {
    const { container } = render(<ConfiguredIcon icon={undefined} fallback={<b>fb</b>} />);
    expect(container.querySelector("b")?.textContent).toBe("fb");
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders the react icon slot with the configured tag and its own fallback", () => {
    const { getByTestId, container } = render(
      <ConfiguredIcon
        icon={{ ...baseIcon, useReactIcon: true, reactIconTag: "FiMenu" }}
        fallback={<b>fb</b>}
        reactIconFallback={<u>slot</u>}
      />,
    );
    const slot = getByTestId("react-icon");
    expect(slot.getAttribute("data-tag")).toBe("FiMenu");
    expect(slot.querySelector("u")?.textContent).toBe("slot");
    expect(container.querySelector("b")).toBeNull();
    expect((slot.parentElement as HTMLElement).style.color).toBe("red");
  });

  it("uses the default tag only when the configured tag is empty", () => {
    const { getByTestId, rerender } = render(
      <ConfiguredIcon icon={{ ...baseIcon, useReactIcon: true, reactIconTag: "" }} defaultTag="FiChevronsLeft" fallback={null} />,
    );
    expect(getByTestId("react-icon").getAttribute("data-tag")).toBe("FiChevronsLeft");
    rerender(
      <ConfiguredIcon icon={{ ...baseIcon, useReactIcon: true, reactIconTag: "FiX" }} defaultTag="FiChevronsLeft" fallback={null} />,
    );
    expect(getByTestId("react-icon").getAttribute("data-tag")).toBe("FiX");
  });
});

describe("DocsShellBrandIcon", () => {
  afterEach(cleanup);

  const brand = {
    useReactIcon: false,
    reactIconTag: undefined,
    reactIconStyle: {},
    activeLayoutMode: "dark" as const,
    iconImage: undefined,
    iconImgWidth: 24,
    iconImgHeight: 24,
    alt: "My Docs",
    reactIconClassName: "react-cls",
    imageClassName: "img-cls",
  };

  it("renders the brand image with the site name as alt", () => {
    const { container } = render(<DocsShellBrandIcon {...brand} iconImage="/brand.png" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("My Docs");
    expect(img?.className).toBe("img-cls");
  });

  it("renders the react icon slot inside the styled wrapper", () => {
    const { container, getByTestId } = render(<DocsShellBrandIcon {...brand} useReactIcon reactIconTag="FaBook" />);
    expect(container.querySelector("span.react-cls")).not.toBeNull();
    expect(getByTestId("react-icon").getAttribute("data-tag")).toBe("FaBook");
  });

  it("renders nothing without an icon or image", () => {
    const { container } = render(<DocsShellBrandIcon {...brand} />);
    expect(container.innerHTML).toBe("");
  });
});
